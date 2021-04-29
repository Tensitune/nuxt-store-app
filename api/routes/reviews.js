const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
const db = require('../db')

router.get('/:productId', async (req, res) => {
  const params = { cat_id: req.params.productId }

  let reviews
  if (req.query.page) {
    reviews = await db.getPagedRows('reviews', req.query.page, req.query.perPage, params)
  } else if (req.query.getAll) {
    reviews = await db.find('reviews', params)
  } else {
    reviews = await db.count('reviews', params)
  }

  res.json({ status: 'success', data: reviews })
})

router.post('/add',
  UserMiddleware,
  check('product_id').custom(async value => {
    const product = await db.findOne('products', { id: value })
    if (!product) return Promise.reject(new Error('Такого товара не существует'))
  }),
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.insert('categories', {
      product_id: req.body.product_id,
      user_id: req.session.userid,
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.post('/edit',
  UserMiddleware,
  check('id').custom(async (value, { req }) => {
    const review = await db.findOne('reviews', { id: value, user_id: req.session.userid })
    if (!review) return Promise.reject(new Error('Такого отзыва не существует'))
  }),
  check('rating').notEmpty(),
  check('text').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.update('reviews', req.body.id, {
      rating: req.body.rating,
      text: req.body.text
    })

    res.json({ status: 'success' })
  }
)

router.post('/delete',
  UserMiddleware,
  check('id').custom(async (value, { req }) => {
    const review = await db.findOne('reviews', { id: value, user_id: req.session.userid })
    if (!review) return Promise.reject(new Error('Такого отзыва не существует'))
  }),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    await db.delete('reviews', req.body.id)
    res.json({ status: 'success' })
  }
)

// router.post('/reviews', (req, res) => {
//   if (!(req.session.userid && req.body.type)) return

//   db.findOne('users', { id: req.session.userid }).then(user => {
//     if (!user) return

//     if (req.body.type === 'add') {
//       if (!(req.body.product_id && req.body.user_id && req.body.rating && req.body.text)) return

//       db.addOrUpdate('reviews', {
//         product_id: req.body.product_id,
//         user_id: req.body.user_id,
//         rating: req.body.rating,
//         text: req.body.text
//       }).then(() => {
//         res.json({ status: 'success' })
//       }).catch(err => DBError(res, err))
//     } else if (req.body.type === 'edit' && req.body.id) {
//       const data = { id: req.body.id }
//       if (req.body.product_id) data.product_id = req.body.product_id
//       if (req.body.user_id) data.user_id = req.body.user_id
//       if (req.body.rating) data.rating = req.body.rating
//       if (req.body.text) data.text = req.body.text

//       db.addOrUpdate('reviews', data).then(() => {
//         res.json({ status: 'success' })
//       }).catch(err => DBError(res, err))
//     } else if (req.body.type === 'remove' && req.body.id) {
//       db.delete('reviews', { id: req.body.id }).then(() => {
//         res.json({ status: 'success' })
//       }).catch(err => DBError(res, err))
//     }
//   })
// })

module.exports = router
