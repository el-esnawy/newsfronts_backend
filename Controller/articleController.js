const Article = require("../models/articleModel");
const Headlines = require("../models/headlinesModel");
const AppError = require("../util/AppError");
const catchAsync = require("../util/catchAsync");

const everything = require("../util/fetchArticles");
const Source = require("../models/sourcesModel");

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

exports.getArticles = catchAsync(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  const articles = await Article.find()
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    status: "success",
    page,
    pageSize,
    articles: shuffle(articles),
  });
});

exports.getArticlesByCategory = catchAsync(async (req, res, next) => {
  const category = req.params.category;
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const categories = [
    "general",
    "business",
    "entertainmnent",
    "science",
    "sports",
    "technology",
  ];

  if (!categories.includes(category)) {
    return next(new AppError("Category is not defined", 400));
  }
  const count = await Article.countDocuments({ category });
  const articles = await Article.find({ category })
    .sort({ publishedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    status: "success",
    count,
    page,
    pageSize,
    articlesCount: articles.length,
    articles: shuffle(articles),
  });
});

exports.getArticlesBySource = catchAsync(async (req, res, next) => {
  const source = req.params.source;
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  if (!source) {
    return next(new AppError("Source is not defined, Must Define Source", 400));
  }

  const count = await Article.countDocuments({
    "source.id": {
      $regex: source,
    },
  });
  const articles = await Article.find({
    "source.id": {
      $regex: source,
    },
  })
    .sort({ publishedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    status: "success",
    count,
    page,
    pageSize,
    articles: shuffle(articles),
  });
});

exports.getHeadlines = catchAsync(async (req, res, next) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Headlines.countDocuments();
  const articles = await Headlines.find()
    .sort({ publishedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    status: "success",
    page,
    count,
    pageSize,
    articles: shuffle(articles),
  });
});

exports.getAllSources = catchAsync(async (req, res, next) => {
  const sources = await Source.find();
  res.status(200).json({
    sources,
  });
});

exports.getArticlesBySearch = catchAsync(async (req, res, next) => {
  const searchTerm = req.params.term.trim();
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  if (!searchTerm) {
    return next(
      new AppError(
        "Search Term is not defined, Must Define a Term to search",
        400,
      ),
    );
  } else if (searchTerm.length < 3) {
    return next(
      new AppError("Search Term is Too Short, minimum three Characters ", 400),
    );
  }
  const fetchedArticles = await everything(null, searchTerm);

  res.status(200).json({
    status: "success",
    count: fetchedArticles.length,
    articles: shuffle(fetchedArticles),
    page,
    pageSize,
  });
});
