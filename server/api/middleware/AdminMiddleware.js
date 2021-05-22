module.exports = (req, res, next) => {
  if (!req.session.user) return res.json({ status: "error", error: "Вы не вошли в свой профиль" });
  if (!req.session.user.admin) return res.json({ status: "error", error: "Вы не являетесь администратором" });
  next();
};
