const { Router } = require('express')
const router = Router()

const bcrypt = require('bcrypt')

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
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
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.json({ status: 'error', error: 'Неверный пароль' })
    }

    req.session.userid = user.id
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
      res.json({ status: 'success' })
    })
  }
)

router.get('/signout', (req, res) => {
  if (req.session.userid) delete req.session.userid
  res.redirect('/')
})

router.get('/profile', UserMiddleware, async (req, res) => {
  const user = await db.findOne('users', { id: req.session.userid })
  if (!user) {
    return res.json({ status: 'error', error: 'Пользователь не найден' })
  }

  delete user.password
  res.json({ status: 'success', data: user })
})

module.exports = router
