module.exports = (req, res, next) => {
  if (!req.session.userid) return res.json({ status: 'error', error: 'Вы не вошли в свой профиль' })
  next()
}
