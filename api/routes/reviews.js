const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
const db = require('../db')

const getPagedRows = require('../utils/getPagedRows')

router.get('/:productId', async (req, res) => {
  const reviews = await getPagedRows('reviews', { product_id: req.params.productId }, req.query)
  res.json({ status: 'success', data: reviews })
})

router.post('/',
  UserMiddleware,
  check('product_id').notEmpty().custom(async value => {
    const product = await db.findOne('products', { id: value })
    if (!product) return Promise.reject(new Error('Такого товара не существует'))
  }),
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await db.insert('categories', {
      product_id: req.body.product_id,
      user_id: req.session.userid,
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.put('/',
  UserMiddleware,
  check('id').notEmpty().custom(async (value, { req }) => {
    const review = await db.findOne('reviews', { id: value, user_id: req.session.userid })
    if (!review) return Promise.reject(new Error('Такого отзыва не существует'))
  }),
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await db.update('reviews', req.body.id, {
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.delete('/',
  UserMiddleware,
  check('id').notEmpty().custom(async (value, { req }) => {
    const review = await db.findOne('reviews', { id: value, user_id: req.session.userid })
    if (!review) return Promise.reject(new Error('Такого отзыва не существует'))
  }),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await db.delete('reviews', req.body.id)
    res.json({ status: 'success' })
  }
)

module.exports = router
