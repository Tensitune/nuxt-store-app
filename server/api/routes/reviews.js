const { check } = require('express-validator')
const { getPagedRows, validationResult } = require('../helpers')

const { UserMiddleware } = require('../middleware')

module.exports = (api, app) => {
  api.get('/reviews/:productId', async (req, res) => {
    const reviews = await getPagedRows(app.db, 'reviews', { productId: req.params.productId }, req.query)
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

      await app.db.insert('reviews', {
        productId: req.params.productId,
        userId: req.session.user.id,
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

      if (review.userId !== req.session.user.id) {
        return res.json({ status: 'error', error: 'Вы не можете изменить чужой отзыв' })
      }

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

    if (review.userId !== req.session.user.id) {
      return res.json({ status: 'error', error: 'Вы не можете удалить чужой отзыв' })
    }

    await app.db.delete('reviews', req.params.reviewId)
    res.json({ status: 'success' })
  })
}
