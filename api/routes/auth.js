const { Router } = require('express')
const router = Router()

const { body, check, validationResult } = require('express-validator')

const bcrypt = require('bcrypt')
const db = require('../db')

router.post('/signin',
  body('username').custom(async value => {
    const user = await db.findOne('users', { username: value })
    if (!user) return Promise.reject(new Error('Такого пользователя не существует'))
  }),
  check('password', 'Требуется пароль').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = errors.array()[0] ?? false
      return res.status(400).json({ status: 'error', error })
    }

    const user = await db.findOne('users', { username: req.body.username })
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).json({ status: 'error', error: 'Неверный пароль' })
    }

    req.session.userid = user.id
    res.json({ status: 'success' })
  }
)

router.post('/signup',
  body('username').custom(async value => {
    const user = await db.findOne('users', { username: value })
    if (user) return Promise.reject(new Error('Имя пользователя уже занято'))
  }),
  check('password', 'Требуется пароль').notEmpty(),
  check('firstname', 'Требуется имя').notEmpty(),
  check('lastname', 'Требуется фамилия').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const error = errors.array()[0] ?? false
      return res.status(400).json({ status: 'error', error })
    }

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

router.get('/profile', ensureAuthenticated, async (req, res) => {
  const user = await db.findOne('users', { id: req.session.userid })
  if (!user) {
    return res.status(400).json({ status: 'error', error: 'Пользователь не найден' })
  }

  delete user.password
  res.json({ status: 'success', data: user })
})

function ensureAuthenticated(req, res, next) {
  if (req.session.userid) return next()
  res.redirect('/')
}

module.exports = router
