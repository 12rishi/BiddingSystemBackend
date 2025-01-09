exports.handleTime = (req, res, next) => {
  const time = date.now();
  req.time = time;
  next();
};
