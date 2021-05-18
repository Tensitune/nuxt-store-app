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

router.post('/:productId',
  UserMiddleware,
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const product = await db.findOne('products', { id: req.params.productId })
    if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await db.insert('categories', {
      product_id: req.params.productId,
      user_id: req.session.userid,
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.put('/:reviewId',
  UserMiddleware,
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const review = await db.findOne('reviews', { id: req.params.reviewId })
    if (!review) return res.json({ status: 'error', error: 'Такого отзыва не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await db.update('reviews', req.body.id, {
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.delete('/:reviewId', UserMiddleware, async (req, res) => {
  const review = await db.findOne('reviews', { id: req.params.reviewId })
  if (!review) return res.json({ status: 'error', error: 'Такого отзыва не существует' })

  const error = validationResult(req)
  if (error) return res.json({ status: 'error', error: error.msg })

  await db.delete('reviews', req.body.id)
  res.json({ status: 'success' })
})

module.exports = router
