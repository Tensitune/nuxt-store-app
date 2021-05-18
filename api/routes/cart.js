const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
const db = require('../db')

router.get('/', UserMiddleware, async (req, res) => {
  let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
  if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

  let cartItems = []
  if (req.query.count) {
    cartItems = await db.count('cart_items', { cart_id: cartId })
  } else {
    cartItems = await db.find('cart_items', { cart_id: cartId })
  }

  res.json({ status: 'success', data: cartItems })
})

router.post('/',
  UserMiddleware,
  check('productId').notEmpty().custom(async (value, { req }) => {
    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    const category = await db.findOne('cart_items', { cart_id: cartId, product_id: value })
    if (category) return Promise.reject(new Error('Этот товар уже есть в вашей корзине'))
  }),
  check('quantity').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    await db.insert('cart_items', {
      cart_id: cartId,
      product_id: req.body.productId,
      quantity: req.body.quantity
    })

    res.json({ status: 'success' })
  }
)

router.put('/:productId',
  UserMiddleware,
  check('quantity').notEmpty(),
  async (req, res) => {
    const product = await db.findOne('products', { id: req.params.productId })
    if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    const cartItem = await db.findOne('cart_items', { cart_id: cartId, product_id: req.params.productId })
    if (!cartItem) return res.json({ status: 'error', error: 'Этот товар в корзине не найден' })

    await db.update('cart_items', cartItem.id, { quantity: req.body.quantity })
    res.json({ status: 'success' })
  }
)

router.delete('/:productId', UserMiddleware, async (req, res) => {
  const product = await db.findOne('products', { id: req.params.productId })
  if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

  const error = validationResult(req)
  if (error) return res.json({ status: 'error', error: error.msg })

  let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
  if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

  const cartItem = await db.findOne('cart_items', { cart_id: cartId, product_id: req.params.productId })
  if (!cartItem) return res.json({ status: 'error', error: 'Этот товар в корзине не найден' })

  await db.delete('cart_items', cartItem.id)
  res.json({ status: 'success' })
})

module.exports = router
