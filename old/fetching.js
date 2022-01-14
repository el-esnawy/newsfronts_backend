const NewsAPI = require("newsapi");
const fs = require("fs");
const util = require("util");
const Sources = require("../models/sourcesModel");
const dotenv = require("dotenv");
const chalk = require("chalk");
const { getAllSources } = require("./articlesData");

const mongoose = require("mongoose");

dotenv.config();
const API_KEY = process.env["API_KEY_0"];
const newsapi = new NewsAPI(API_KEY);

const SourceCategories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];
let CurrentKey = 0;
const currentAPIKey = 0;

async function getAllSourcesByCat(category) {
  const { sources } = await newsapi.v2.sources({
    category,
    language: "en",
  });
  return sources;
}

// return an array of objects, each object is a category of sources
async function getAllSources(...sourcesArray) {
  // console.log(sourcesArray);
  if (CurrentKey === SourceCategories.length - 1) {
    CurrentKey = 0;
    return [...sourcesArray];
  } else {
    const sources = await getAllSourcesByCat(SourceCategories[CurrentKey]);

    const srcsArray = [
      ...sourcesArray,
      {
        category: SourceCategories[CurrentKey],
        results: sources.length,
        sources,
      },
    ];

    CurrentKey += 1;

    return await getSources(...srcsArray);
  }
}

// async function main() {
//   // sorting all sources by category
//   // const sourcesObj = await getAllSources(...[]);
//   // console.log(sourcesObj);
//   // fs.writeFileSync("./sourcesCategory.json", JSON.stringify(sourcesObj));
//   //
//   // getting the number of sources by category in array
//   const sources = JSON.parse(await readFile("./sourcesCategory.json"));
//   // const numSources = sources.map((source) => source.results);
//   // console.log(numSources);
//   const articles = await everythingFrom("associated-press");
//   console.log(articles.length);
// }

async function main() {
  const readFile = await util.promisify(fs.readFile);
  const SourcesAndCategory = JSON.parse(
    await readFile("./sourcesCategory.json"),
  );
}
main();
