require('dotenv').config()

const express = require('express')
const session = require('express-session')
const app = express()

app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/auth', require('./routes/auth'))
app.use('/categories', require('./routes/categories'))
app.use('/products', require('./routes/products'))
app.use('/reviews', require('./routes/reviews'))
app.use('/cart', require('./routes/cart'))

module.exports = app
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}
