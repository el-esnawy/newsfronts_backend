const express = require("express");
const {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserbyId,
  updateUserById,
  updateSubscriptions,
  updateLikedArticles,
  updateBookmarks,
  fetchArticles,
} = require("../Controller/userController");

const { protect, authorizeAdmin } = require("../Middlewares/authMiddleware");

const router = express.Router();

router.route("/fetchAllArticles").get(protect, authorizeAdmin, fetchArticles);

router.post("/login", authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/like").post(protect, updateLikedArticles);
router.route("/subscribe").post(protect, updateSubscriptions);
router.route("/bookmark").post(protect, updateBookmarks);

router.route("/").post(registerUser).get(protect, authorizeAdmin, getUsers);
router
  .route("/:id")
  .delete(protect, authorizeAdmin, deleteUser)
  .get(protect, authorizeAdmin, getUserbyId)
  .put(protect, authorizeAdmin, updateUserById);

router.route("/fetchAllArticles").get(authorizeAdmin, fetchArticles);

module.exports = router;
