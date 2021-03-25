const { Router } = require('express')
const router = Router()

const bcrypt = require('bcrypt')
const { DBError } = require('../../utils')
const { findOne, addOrUpdate } = require('../../utils/db')

router.post('/signin', (req, res) => {
  if (!(req.body.username || req.body.password)) return

  findOne('users', { username: req.body.username }).then(user => {
    if (!user) {
      res.json({ status: 'error', error: 'Такого пользователя не существует' })
      return
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.json({ status: 'error', error: 'Неверный пароль' })
      return
    }

    req.session.userid = user.id
    res.json({ status: 'success' })
  }).catch(err => DBError(res, err))
})

router.post('/signup', (req, res) => {
  if (!(req.body.username && req.body.password && req.body.firstname && req.body.lastname)) return

  findOne('users', { username: req.body.username }).then(user => {
    if (user) {
      res.json({ status: 'error', error: 'Имя пользователя уже занято' })
      return
    }

    const password = bcrypt.hashSync(req.body.password, 10)
    addOrUpdate('users', {
      username: req.body.username,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      address: req.body.address
    }).then(() => {
      res.json({ status: 'success' })
    }).catch(err => DBError(res, err))
  }).catch(err => DBError(res, err))
})

router.get('/signout', (req, res) => {
  if (req.session.userid) {
    delete req.session.userid
  }
  res.redirect('/')
})

router.get('/profile', (req, res) => {
  if (!req.session.userid) {
    res.json({ status: 'error', error: 'Вы не вошли в профиль' })
    return
  }

  findOne('users', { id: req.session.userid }).then(user => {
    if (!user) {
      res.json({ status: 'error', error: 'Пользователь не найден' })
      return
    }

    delete user.password
    res.json({ status: 'success', data: user })
  }).catch(err => DBError(res, err))
})

module.exports = router
