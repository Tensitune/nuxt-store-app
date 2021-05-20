const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { AdminMiddleware } = require('../middleware')
const { getPagedRows } = require('../utils')

module.exports = (api, app) => {
  api.get('/products', async (req, res) => {
    const whereParams = {}

    if (req.query.title) {
      whereParams.title = { like: req.query.title }
    }

    if (req.query.priceFrom || req.query.priceTo) {
      whereParams.price = {}
      if (req.query.priceFrom) whereParams.price.greaterThan = req.query.priceFrom
      if (req.query.priceTo) whereParams.price.lessThan = req.query.priceTo
    }

    const orderParam = {}
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(',')
      orderParam.by = orderBy[0]
      orderParam.desc = orderBy[1] === 'true'
    }

    const products = await getPagedRows(app.db, 'products', whereParams, req.query, orderParam)
    res.json({ status: 'success', data: products })
  })

  api.get('/products/recommended', async (req, res) => {
    const products = await getPagedRows(app.db, 'products', { recommended: true }, req.query)
    res.json({ status: 'success', data: products })
  })

  api.get('/products/popular', async (req, res) => {
    let products = await app.db.find('products')

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const reviews = await app.db.find('reviews', { product_id: product.id })

      if (reviews.length) {
        const rating = []
        reviews.map(review => rating.push(review.rating))
        products[i].rating = rating.reduce((a, b) => a + b) / rating.length
      } else {
        products[i].rating = 0
      }
    }
    products = await products.filter(product => {
      if (product.rating < 4) return false
      return true
    }).sort((a, b) => (a.rating > b.rating))

    res.json({ status: 'success', data: products.slice(0, 9) })
  })

  api.get('/products/:productId', async (req, res) => {
    const products = await app.db.findOne('products', { id: req.params.productId })
    res.json({ status: 'success', data: products })
  })

  api.post('/products',
    AdminMiddleware,
    check('cat_id').notEmpty().custom(async value => {
      const category = await app.db.findOne('categories', { id: value })
      if (!category) return Promise.reject(new Error('Такой категории не существует'))
    }),
    check('title').notEmpty(),
    check('description').notEmpty(),
    check('price').notEmpty(),
    check('stock').notEmpty(),
    async (req, res) => {
      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      await app.db.insert('products', {
        cat_id: req.body.cat_id,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock
      })

      res.json({ status: 'success' })
    }
  )

  api.put('/products/:productId', AdminMiddleware, async (req, res) => {
    const product = await app.db.findOne('products', { id: req.params.productId })
    if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    const data = {}

    if (req.body.cat_id) {
      const category = await app.db.findOne('categories', { id: req.body.cat_id })
      if (!category) return res.json({ status: 'error', error: 'Такой категории не существует' })

      data.cat_id = req.body.cat_id
    }

    if (req.body.title) data.title = req.body.title
    if (req.body.description) data.description = req.body.description
    if (req.body.price) data.price = req.body.price
    if (req.body.stock) data.stock = req.body.stock
    if (req.body.thumbnail) data.thumbnail = req.body.thumbnail

    await app.db.update('products', req.params.productId, data)
    res.json({ status: 'success' })
  })

  api.delete('/products/:productId', AdminMiddleware, async (req, res) => {
    const product = await app.db.findOne('products', { id: req.params.productId })
    if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await app.db.delete('products', req.params.productId)
    res.json({ status: 'success' })
  })
}
