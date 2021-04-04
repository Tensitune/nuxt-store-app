require('dotenv').config()

const express = require('express')
const session = require('express-session')
const app = express()

const { Init } = require('../utils/db')
Init()

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(require('./controllers/auth'))

module.exports = app
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}