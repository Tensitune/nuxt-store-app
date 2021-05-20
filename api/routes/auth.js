const { Router } = require('express')
const router = Router()

const bcrypt = require('bcrypt')

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const db = require('../db')

router.post('/signin',
  check('username').notEmpty().custom(async value => {
    const user = await db.findOne('users', { username: value })
    if (!user) return Promise.reject(new Error('Такого пользователя не существует'))
  }),
  check('password', 'Требуется пароль').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    const user = await db.findOne('users', { username: req.body.username })
    const passwordCheck = await bcrypt.compare(req.body.password, user.password)

    if (!passwordCheck) {
      return res.json({ status: 'error', error: 'Неверный пароль' })
    }

    delete user.password
    req.session.user = user

    res.json({ status: 'success' })
  }
)

router.post('/signup',
  check('username').notEmpty().custom(async value => {
    const user = await db.findOne('users', { username: value })
    if (user) return Promise.reject(new Error('Имя пользователя уже занято'))
  }),
  check('password', 'Требуется пароль').notEmpty(),
  check('firstname', 'Требуется имя').notEmpty(),
  check('lastname', 'Требуется фамилия').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    const password = bcrypt.hashSync(req.body.password, 10)
    await db.insert('users', {
      username: req.body.username,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone ?? '',
      address: req.body.address ?? ''
    }).then(async (userId) => {
      await db.insert('shopping_carts', { user_id: userId })

      const user = await db.findOne('users', { id: userId })
      if (user) {
        delete user.password
        req.session.user = user
      }

      res.json({ status: 'success' })
    })
  }
)

router.get('/signout', (req, res) => {
  if (req.session.user) delete req.session.user
  res.redirect('/')
})

module.exports = router
