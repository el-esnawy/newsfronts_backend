const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};

module.exports = (error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
  if (!error.status) error.status = "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    // 3 Nos. types of errors thrown by mongoose
    // a- cast error
    // b- validation error

    let err = Object.assign(error);

    if (err.name === "MongoError") err = handleMongoError(err);
    if (err.name === "CastError") err = handleCastError(err);
    if (err.name === "ValidationError") err = handleValidationError(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError(err);
    if (err.name === "TokenExpiredError") err = handleJWTExpires(err);

    sendErrorProduction(err, res);
  }

  next();
};
