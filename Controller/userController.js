const asyncHandler = require("express-async-handler");

const User = require("../models/userModel.js");
const Source = require("../models/sourcesModel");
const generateToken = require("../util/generateToken");
const Article = require("../models/articleModel");
const Headline = require("../models/headlinesModel");

const fetchArticlesFunctions = require("../util/fetchArticles");

// @desc Auth user & get Token
// @route post /api/user/login
// @access Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// @desc GET user profile
// @route post /api/user/profie
// @access private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      subscriptions: user.subscriptions,
      favArticles: user.favArticles,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found ");
  }
});

// @desc POST register new user
// @route post /api/user
// @access public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  if (passwordConfirm !== password) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    count: users.length,
    users,
  });
});

// @desc PUT user profile
// @route post /api/user/profie
// @access private

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found ");
  }
});

// @desc GET All sers
// @route post /api/user/profie
// @access private/Admin

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.json({
    users,
  });
});
// @desc Delete USERS
// @route DELETE /api/user/:id
// @access private/Admin

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ status: "success", message: "user removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get  USER by ID
// @route GET /api/user/:id
// @access private/Admin

const getUserbyId = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc  user profile
// @route PUT /api/user/:id
// @access private/admin

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found ");
  }
});

// @desc PUT user favorite Sources
// @route post /api/v1/user/subscribe
// @access private

const updateSubscriptions = asyncHandler(async (req, res) => {
  const source = await Source.findById(req.body.subscriptionId);
  const { user } = req;

  if (!source) {
    res.status(404);
    throw new Error("No Source ID Found or Invalid");
  }

  const found = user.subscriptions.findIndex(
    (el) => el.toString() === source._id.toString(),
  );

  if (found === -1) {
    user.subscriptions = [...user.subscriptions, req.body.subscriptionId];
    await user.save();
    res.status(200).json({
      status: "Success",
      message: `Subscribed to Source: ${source.id}`,
      user: req.user,
      source,
    });
  } else {
    const newArray = user.subscriptions.filter(
      (el) => el.toString() !== source._id.toString(),
    );

    user.subscriptions = [...newArray];
    const newUser = await user.save();

    res.status(200).json({
      status: "Success",
      message: `unsubscribed to Source: ${source.id}`,
      user: newUser,
      source,
    });
  }
});

// @desc PUT user like articles
// @route post /api/v1/user/like
// @access private
const updateLikedArticles = asyncHandler(async (req, res) => {
  const articles = await Article.findById(req.body.articleId);
  const headline = await Headline.findById(req.body.articleId);
  const article = articles || headline;
  const { user } = req;

  if (!article) {
    res.status(404);
    throw new Error("No Article ID Found or Invalid ID");
  }
  const found = user.likes.findIndex((el) => {
    return el.toString() == article._id;
  });

  if (found === -1) {
    user.likes = [...user.likes, req.body.articleId];
    const newUser = await user.save();
    res.status(200).json({
      status: "Success",
      message: `Subscribed to Source: ${article.id}`,
      user: newUser,
      article,
    });
  } else {
    const newArray = user.likes.filter(
      (el) => el.toString() !== article._id.toString(),
    );

    user.likes = [...newArray];
    const newUser = await user.save();

    res.status(200).json({
      status: "Success",
      message: `unsubscribed to Source: ${article.id}`,
      user: newUser,
      article,
    });
  }
});
// @desc PUT user bookmark Sources
// @route post /api/v1/user/bookmark
// @access private
const updateBookmarks = asyncHandler(async (req, res) => {
  const articles = await Article.findById(req.body.articleId);
  const headline = await Headline.findById(req.body.articleId);
  const article = articles || headline;
  const { user } = req;

  if (!article) {
    res.status(404);
    throw new Error("No Article ID Found or Invalid ID");
  }
  const found = user.bookmarks.findIndex((el) => {
    return el.toString() == article._id;
  });

  if (found === -1) {
    user.bookmarks = [...user.bookmarks, req.body.articleId];
    const newUser = await user.save();
    res.status(200).json({
      status: "Success",
      message: `Subscribed to Source: ${article.id}`,
      user: newUser,
      article,
    });
  } else {
    const newArray = user.bookmarks.filter(
      (el) => el.toString() !== article._id.toString(),
    );

    user.bookmarks = [...newArray];
    const newUser = await user.save();

    res.status(200).json({
      status: "Success",
      message: `unsubscribed to Source: ${article.id}`,
      user: newUser,
      article,
    });
  }
});

const fetchArticles = async (req, res) => {
  fetchArticlesFunctions.GetAllArticlesToday();
  fetchArticlesFunctions.GetAllTopHeadlinesToday();

  res.status(200).json({
    status: "success",
    message: "fetching all articles & headline",
  });
};

module.exports = {
  authUser,
  getUserProfile,
  registerUser,
  getAllUsers,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserbyId,
  updateUserById,
  updateSubscriptions,
  updateLikedArticles,
  updateBookmarks,
  fetchArticles,
};
