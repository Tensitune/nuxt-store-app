const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { AdminMiddleware } = require('../middleware')
const db = require('../db')

router.get('/:categoryId', async (req, res) => {
  const params = { cat_id: req.params.categoryId }

  let products
  if (req.query.page) {
    products = await db.getPagedRows('products', req.query.page, req.query.perPage, params)
  } else if (req.query.getAll) {
    products = await db.find('products', params)
  } else {
    products = await db.count('products', params)
  }

  res.json({ status: 'success', data: products })
})

router.post('/add',
  AdminMiddleware,
  check('cat_id').custom(async value => {
    const category = await db.findOne('categories', { id: value })
    if (!category) return Promise.reject(new Error('Такой категории не существует'))
  }),
  check('title').notEmpty(),
  check('description').notEmpty(),
  check('price').notEmpty(),
  check('stock').notEmpty(),
  check('thumbnail_uri').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.insert('products', {
      cat_id: req.body.cat_id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      thumbnail_uri: req.body.thumbnail_uri
    })

    res.json({ status: 'success' })
  }
)

router.post('/edit',
  AdminMiddleware,
  check('id').custom(async value => {
    const product = await db.findOne('products', { id: value })
    if (!product) return Promise.reject(new Error('Такого товара не существует'))
  }),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    const data = {}

    if (req.body.cat_id) {
      const category = await db.findOne('categories', { id: req.body.cat_id })
      if (!category) return res.status(400).json({ status: 'error', error: 'Такой категории не существует' })

      data.cat_id = req.body.cat_id
    }

    if (req.body.title) data.title = req.body.title
    if (req.body.description) data.description = req.body.description
    if (req.body.price) data.price = req.body.price
    if (req.body.stock) data.stock = req.body.stock
    if (req.body.thumbnail_uri) data.thumbnail_uri = req.body.thumbnail_uri

    await db.update('products', req.body.id, data)
    res.json({ status: 'success' })
  }
)

router.post('/delete',
  AdminMiddleware,
  check('id').custom(async value => {
    const product = await db.findOne('products', { id: value })
    if (!product) return Promise.reject(new Error('Такого товара не существует'))
  }),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.delete('products', req.body.id)
    res.json({ status: 'success' })
  }
)

module.exports = router
