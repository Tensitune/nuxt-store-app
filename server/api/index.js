require('dotenv').config()

const express = require('express')
const session = require('express-session')
const app = express()

const bcrypt = require('bcrypt')
const db = require('../utils/db')
db.Init()

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post('/signin', (req, res) => {
  if (!(req.body.username || req.body.password)) return

  db.findOne('users', { username: req.body.username }).then(user => {
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
  })
})

app.post('/signup', (req, res) => {
  if (!(req.body.username && req.body.password && req.body.firstname && req.body.lastname)) return

  db.findOne('users', { username: req.body.username }).then(user => {
    if (user) {
      res.json({ status: 'error', error: 'Имя пользователя уже занято' })
      return
    }

    const password = bcrypt.hashSync(req.body.password, 10)
    db.addOrUpdate('users', {
      username: req.body.username,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone,
      address: req.body.address
    }).then(() => {
      res.json({ status: 'success' })
    }).catch(err => {
      console.error(err)
      res.json({ status: 'error', error: 'Что-то пошло не так' })
    })
  })
})

app.get('/signout', (req, res) => {
  if (req.session.userid) {
    delete req.session.userid
  }
  res.redirect('/')
})

app.get('/profile', (req, res) => {
  if (!req.session.userid) {
    res.json({ status: 'error', error: 'Вы не вошли в профиль' })
    return
  }

  db.findOne('users', { id: req.session.userid }).then(user => {
    if (!user) {
      res.json({ status: 'error', error: 'Пользователь не найден' })
      return
    }

    delete user.password
    res.json({ status: 'success', user: user })
  })
})

module.exports = app
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}
