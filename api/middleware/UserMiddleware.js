module.exports = (req, res, next) => {
  if (req.session.userid) return next()
  res.redirect('/')
}
