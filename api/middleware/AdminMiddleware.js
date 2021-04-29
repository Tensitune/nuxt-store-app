const { find } = require('../db')

module.exports = async (req, res, next) => {
  if (!req.session.userid) return res.redirect('/')

  const user = await find('users', { id: req.session.userid })
  if (!(user && user.admin)) return res.redirect('/')

  next()
}
