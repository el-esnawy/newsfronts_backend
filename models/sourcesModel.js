const mongoose = require("mongoose");

const sourcesSchemaOptions = {
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, "source must have a name"],
  },
  url: {
    type: String,
    required: [true, "source must have a URL"],
  },

  language: {
    type: String,
    required: [true, "Article must have an Image"],
    enum: {
      values: [
        "en",
        "no",
        "ar",
        "ud",
        "de",
        "pt",
        "es",
        "fr",
        "it",
        "he",
        "ru",
        "se",
        "zh",
        "nl",
      ],
    },
  },
  country: {
    type: String,
    required: [true, "a source must have a country field"],
  },
  iconURL: {
    type: String,
  },
};

const sourcesSchema = new mongoose.Schema(sourcesSchemaOptions, {
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

const Sources = mongoose.model("source", sourcesSchema);
module.exports = Sources;
