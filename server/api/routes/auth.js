const bcrypt = require('bcrypt')

const { check } = require('express-validator')
const { validationResult } = require('../helpers')

module.exports = (api, app) => {
  api.post('/auth/signin',
    check('username').notEmpty().custom(async value => {
      const user = await app.db.findOne('users', { username: value })
      if (!user) return Promise.reject(new Error('Такого пользователя не существует'))
    }),
    check('password', 'Требуется пароль').notEmpty(),
    async (req, res) => {
      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      const user = await app.db.findOne('users', { username: req.body.username })
      const passwordCheck = await bcrypt.compare(req.body.password, user.password)

      if (!passwordCheck) {
        return res.json({ status: 'error', error: 'Неверный пароль' })
      }

      delete user.password
      req.session.user = user

      res.json({ status: 'success' })
    }
  )

  api.post('/auth/signup',
    check('username').notEmpty().custom(async value => {
      const user = await app.db.findOne('users', { username: value })
      if (user) return Promise.reject(new Error('Имя пользователя уже занято'))
    }),
    check('password', 'Требуется пароль').notEmpty(),
    check('firstname', 'Требуется имя').notEmpty(),
    check('lastname', 'Требуется фамилия').notEmpty(),
    async (req, res) => {
      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      const password = bcrypt.hashSync(req.body.password, 10)
      await app.db.insert('users', {
        username: req.body.username,
        password: password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone ?? '',
        address: req.body.address ?? ''
      }).then(async (userId) => {
        await app.db.insert('shopping_carts', { userId })

        const user = await app.db.findOne('users', { id: userId })
        if (user) {
          delete user.password
          req.session.user = user
        }

        res.json({ status: 'success' })
      })
    }
  )

  api.get('/auth/signout', (req, res) => {
    if (req.session.user) delete req.session.user
    res.redirect('/')
  })
}
