const express = require("express");
const middlewares = require("../Controller/middlewares");

const router = express.Router();

router.route("/getsources/").get(middlewares.getSources);
router.route("/getnumsources/").get(middlewares.getNumberOfSources);
router.route("/getallarticles").get(middlewares.getAllArticles);
router
  .route("/v2/getallarticles/:category")
  .get(middlewares.getArticlesbyCategory);

module.exports = router;
