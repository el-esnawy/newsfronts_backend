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

const articleSchema = new mongoose.Schema(articleSchemaOptions, {
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

// articleSchema.index({ url: 1 }, { unique: 1 });

const Article = mongoose.model("articles", articleSchema);
module.exports = Article;
