const { findOne } = require('../db')

module.exports = async (req, res, next) => {
  if (!req.session.userid) return res.json({ status: 'error', error: 'Вы не вошли в свой профиль' })

  const user = await findOne('users', { id: req.session.userid })
  if (!(user && user.admin)) return res.json({ status: 'error', error: 'Вы не являетесь администратором' })

  next()
}
