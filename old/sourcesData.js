const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("03a04e06e4224157a027d95e551877c3");
const Sources = require("../models/sourcesModel");
const dotenv = require("dotenv");
const chalk = require("chalk");

const mongoose = require("mongoose");

dotenv.config();

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.blackBright.bgGreen.bold("DB Connection Successfull"));
  });

async function importSourcesToDB() {
  const srcs = await newsapi.v2.sources({});
  const testSource = {
    id: "123",
    name: "esnawy",
    url: "esnawy",
    language: "en",
    country: "us",
  };
  await Sources.insertMany(srcs.sources);
}

importSourcesToDB();
