const mongoose = require("mongoose");

const articleSchemaOptions = {
  source: {
    id: { type: String },
    name: { type: String },
  },
  author: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: [false, "Article must have a title"],
  },
  description: {
    type: String,
    required: [false, "Article must have a description"],
  },
  publishedAt: {
    type: Date,
  },
  urlToImage: {
    type: String,
    required: false,
  },
  content: {
    type: String,
  },
  url: {
    type: String,
  },
  category: {
    type: String,
  },
};

const headlineSchema = new mongoose.Schema(articleSchemaOptions, {
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

const Headlines = mongoose.model("Headlines", headlineSchema);
module.exports = Headlines;
