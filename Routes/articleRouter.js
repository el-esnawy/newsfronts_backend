const express = require("express");
const articleController = require("../Controller/articleController");

const router = express.Router({
  mergeParams: true,
});

router.route("/headlines").get(articleController.getHeadlines);
router.route("/").get(articleController.getArticles);
router.route("/source").get(articleController.getAllSources);
router
  .route("/category/:category")
  .get(articleController.getArticlesByCategory);

router.route("/source/:source").get(articleController.getArticlesBySource);
router.route("/search/:term").get(articleController.getArticlesBySearch);

module.exports = router;
