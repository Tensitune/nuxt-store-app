const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
const { getPagedRows } = require('../utils')

module.exports = (api, app) => {
  api.get('/reviews/:productId', async (req, res) => {
    const reviews = await getPagedRows(app.db, 'reviews', { product_id: req.params.productId }, req.query)
    res.json({ status: 'success', data: reviews })
  })

  api.post('/reviews/:productId',
    UserMiddleware,
    check('rating').notEmpty(),
    check('text').notEmpty(),
    async (req, res) => {
      const product = await app.db.findOne('products', { id: req.params.productId })
      if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      await app.db.insert('categories', {
        product_id: req.params.productId,
        user_id: req.session.user.id,
        rating: req.body.rating,
        text: req.body.text
      })

      res.json({ status: 'success' })
    }
  )

  api.put('/reviews/:reviewId',
    UserMiddleware,
    check('rating').notEmpty(),
    check('text').notEmpty(),
    async (req, res) => {
      const review = await app.db.findOne('reviews', { id: req.params.reviewId })
      if (!review) return res.json({ status: 'error', error: 'Такого отзыва не существует' })

      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      await app.db.update('reviews', req.params.reviewId, {
        rating: req.body.rating,
        text: req.body.text
      })

      res.json({ status: 'success' })
    }
  )

  api.delete('/reviews/:reviewId', UserMiddleware, async (req, res) => {
    const review = await app.db.findOne('reviews', { id: req.params.reviewId })
    if (!review) return res.json({ status: 'error', error: 'Такого отзыва не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    await app.db.delete('reviews', req.params.reviewId)
    res.json({ status: 'success' })
  })
}
