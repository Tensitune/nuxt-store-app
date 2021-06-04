module.exports = (req, res, next) => {
  if (!req.session.user) return res.json({ success: false, error: "Вы не вошли в свой профиль" });
  if (!req.session.user.isAdmin) return res.json({ success: false, error: "Вы не являетесь администратором" });
  next();
};
