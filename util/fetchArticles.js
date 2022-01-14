const NewsAPI = require("newsapi");
const AppError = require("./AppError");
const connectToDb = require("./connectToDb");
const util = require("util");
const dotenv = require("dotenv");
const fs = require("fs");
const Article = require("../models/articleModel");
const Headlines = require("../models/headlinesModel");
const Sources = require("../models/sourcesModel");

const sanitizeHtml = require("sanitize-html");
const validURL = require("valid-url");

connectToDb("./.env");

dotenv.config();
let currentAPIKey = 0;
let newsapi = new NewsAPI(process.env[`API_KEY_${currentAPIKey}`]);

const date = new Date();

const DATE_STRING = `${date.getFullYear()}-${(
  date.getMonth() +
  1 +
  ""
).padStart(2, "0")}-${(date.getDate() + "").padStart(2, "0")}`;

const removeDuplicates = async (Model) => {
  const documents = await Model.aggregate([
    {
      $group: {
        _id: { url: "$url" },
        url: { $addToSet: "$_id" },
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  documents.forEach(async (document, index) => {
    const { url } = document;
    for (let i = 1; i < url.length; i++) {
      await Model.findByIdAndDelete(url[i]);
      console.log(`Deleted ${url[i]}`);
    }

    if (index === documents.length - 1) return true;
  });
};

const cleanHTMLTAGS = async (article, index) => {
  const {
    content: articleContent,
    title: articleTitle,
    description: desc,
    _id: id,
  } = article;

  const optionsSaintize = {
    allowedTags: [],
    allowedAttributes: [],
  };
  const sanitaizedContent = sanitizeHtml(articleContent, optionsSaintize);
  const sanitaizedtitle = sanitizeHtml(articleTitle, optionsSaintize);
  const sanitaizeddescription = sanitizeHtml(desc, optionsSaintize);

  if (
    sanitaizedContent === articleContent &&
    sanitaizedtitle === articleTitle &&
    sanitaizeddescription === desc
  ) {
    return;
  } else {
    const newArticles = {
      content: sanitaizedContent,
      title: sanitaizedtitle,
      description: sanitaizeddescription,
    };

    const updateArticle = await Article.findByIdAndUpdate(id, newArticles);

    if (updateArticle) {
      console.log(`${index} / ${updateArticle.length}`);
    }
  }
};

const cleanAuthor = async (article) => {
  const { _id: id, author } = article;

  if (
    validURL.isHttpUri(author) ||
    validURL.isHttpsUri(author) ||
    validURL.isUri(author) ||
    validURL.isWebUri(author)
  ) {
    await Article.findByIdAndDelete(id);
  }
};

async function cleanUp() {
  await Article.deleteMany({ urlToImage: { $eq: null || undefined } });
  await Headlines.deleteMany({ urlToImage: { $eq: null || undefined } });
  const ArticlesDone = await removeDuplicates(Article);
  const headlinesDone = await removeDuplicates(Headlines);

  if (ArticlesDone) {
    const AllArticles = await Article.find();
    AllArticles.forEach(cleanHTMLTAGS);
    AllArticles.forEach(cleanAuthor);
  }

  if (headlinesDone) {
    const AllHeadlines = await Headlines.find();
    AllHeadlines.forEach(cleanHTMLTAGS);
    AllHeadlines.forEach(cleanAuthor);
  }
}

const topHeadlines = async (source, category) => {
  try {
    if (!category && source) {
      const { articles } = await newsapi.v2.topHeadlines({
        sources: source,
        pageSize: 100,
        from: DATE_STRING,
      });
      return articles;
    } else if (!source && category) {
      const { articles } = await newsapi.v2.topHeadlines({
        category,
        pageSize: 100,
        from: DATE_STRING,
      });
      return articles;
    }
  } catch (error) {
    if (currentAPIKey < 11) {
      currentAPIKey += 1;
      newsapi = new NewsAPI(process.env[`API_KEY_${currentAPIKey}`]);
      return await topHeadlines(source, category);
    } else {
      return new AppError(`Error Message from NEWSAPI:  ${error.message}`, 500);
    }
  }
};

const everything = async (source, query) => {
  try {
    if (!query && source) {
      const { articles } = await newsapi.v2.everything({
        sortBy: "popularity",
        sources: source,
        pageSize: 100,
        from: DATE_STRING,
        language: "en",
      });
      return articles;
    } else if (!source && query) {
      const { articles } = await newsapi.v2.everything({
        sortBy: "relevancy",
        q: query,
        pageSize: 100,
        from: DATE_STRING,
        language: "en",
      });
      return articles;
    } else {
      const { articles } = await newsapi.v2.everything({
        q: query,
        sources: source,
        pageSize: 100,
        from: DATE_STRING,
        language: "en",
      });
      return articles;
    }
  } catch (error) {
    if (currentAPIKey < 9) {
      currentAPIKey += 1;
      newsapi = new NewsAPI(process.env[`API_KEY_${currentAPIKey}`]);
      return await everything(source, query);
    } else {
      return new AppError(`ERROR MESSAGE RECEIVEDt: ${error.message}`, 500);
    }
  }
};

async function GetAllArticlesToday() {
  const readFile = await util.promisify(fs.readFile);
  const sources = JSON.parse(await readFile("./sources.json"));
  const sourceIds = sources
    .map((source) => {
      if (source.language === "en") {
        return source.id;
      }
    })
    .filter((source) => source);

  for (let i = 0; i < sourceIds.length; i++) {
    const articles = await everything(sourceIds[i], null);
    if (articles.length === 0) continue;

    const fullarticles = articles.map((article) => {
      const index = sources.findIndex((source) => source.id === sourceIds[i]);

      return { ...article, category: sources[index].category };
    });

    const response = await Article.insertMany(fullarticles);

    const done = response ? "Done" : "Something went wrong";
    console.log(
      `All Articles: ${articles.length}  From ${articles[0]?.source?.id}  /  ( Fetched by ${sourceIds[i]})  ${done}`,
    );
    if (i === sourceIds.length - 1) {
      await cleanUp();
      console.log("ALL DONE");
      return;
    }
  }
}

async function GetAllTopHeadlinesToday() {
  const readFile = await util.promisify(fs.readFile);
  const sources = JSON.parse(await readFile("./sources.json"));
  const sourceIds = sources
    .map((source) => {
      if (source.language === "en") {
        return source.id;
      }
    })
    .filter((source) => (source ? true : false));

  for (let i = 0; i < sourceIds.length; i++) {
    const articles = await topHeadlines(sourceIds[i]);
    const fullarticles = articles.map((article) => {
      const index = sources.findIndex((source) => source.id === sourceIds[i]);

      return { ...article, category: sources[index].category };
    });

    const response = await Headlines.insertMany(fullarticles);

    const done = response ? "Done" : "Something went wrong";
    console.log(
      `TOP Headlines: ${articles.length}  From ${articles[0]?.source?.name}  ${done}`,
    );

    if (i === sourceIds.length - 1) {
      await cleanUp();
      console.log("ALL DONE");
      return;
    }
  }
}

async function deleteAllData() {
  const deleteArticles = await Article.deleteMany();
  const deleteHeadlines = await Headlines.deleteMany();
  if (deleteArticles && deleteHeadlines) {
    console.log("All Articles & Headlines deleted");
    return;
  }
}

async function getSources() {
  // await Sources.deleteMany();
  const { sources } = await newsapi.v2.sources({});

  sources.forEach(async (source) => {
    if (!source.url) {
      await Sources.create(source);
    } else {
      websiteLogo(source.url, async function (error, images) {
        if (error) {
          console.log(error);
          await Sources.create(source);
        }
        try {
          if (!images?.icon?.href) return await Sources.create(source);

          const articleSource = await Sources.create({
            ...source,
            iconURL: images.icon.href,
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  });
}

if (process.argv[2] === "--import-all") {
  GetAllArticlesToday();
  GetAllTopHeadlinesToday();
}
if (process.argv[2] === "--import-articles") {
  GetAllArticlesToday();
  cleanUp();
}
if (process.argv[2] === "--import-head") {
  GetAllTopHeadlinesToday();
}
if (process.argv[2] === "--delete") {
  deleteAllData();
}
if (process.argv[2] === "--cleanup") {
  cleanUp();
}

module.exports = { everything, GetAllArticlesToday, GetAllTopHeadlinesToday };
