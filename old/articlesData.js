const NewsAPI = require("newsapi");
const fs = require("fs");
const Article = require("../models/articleModel");
const dotenv = require("dotenv");
const chalk = require("chalk");

const mongoose = require("mongoose");
const catchAsync = require("../Controller/catchAsync");

dotenv.config();
const API_KEY = process.env["API_KEY_0"];
const newsapi = new NewsAPI(API_KEY);

exports.getAllSources = (SourceLanguage) => {
  const sources = JSON.parse(fs.readFileSync("../sources.json", "utf-8"));

  const sourceNames = sources.map((source) =>
    source.language === SourceLanguage ? source.id : undefined,
  );

  const trueSources = sourceNames.filter((source) => (source ? true : false));

  return trueSources;
};
