module.exports = (req, res, next) => {
  if (!req.session.user) return res.json({ status: "error", error: "Вы не вошли в свой профиль" });
  next();
};
