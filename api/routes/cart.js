const { Router } = require('express')
const router = Router()

const { check } = require('express-validator')
const { validationResult } = require('../utils')

const { UserMiddleware } = require('../middleware')
const db = require('../db')

router.get('/', UserMiddleware, async (req, res) => {
  let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
  if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

  const cartItems = await db.find('cart_items', { cart_id: cartId })
  res.json({ status: 'success', data: cartItems })
})

router.post('/',
  UserMiddleware,
  check('product_id').notEmpty(),
  check('quantity').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    await db.insert('cart_items', {
      cart_id: cartId,
      product_id: req.body.product_id,
      quantity: req.body.quantity
    })

    res.json({ status: 'success' })
  }
)

router.put('/',
  UserMiddleware,
  check('product_id').notEmpty(),
  check('quantity').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    const cartItem = await db.findOne('cart_items', { cart_id: cartId, product_id: req.body.product_id })
    if (!cartItem) return res.status(400).json({ status: 'error', error: 'Этот продукт в корзине не найден' })

    await db.update('cart_items', cartItem.id, { quantity: req.body.quantity })
    res.json({ status: 'success' })
  }
)

router.delete('/',
  UserMiddleware,
  check('product_id').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (error) return res.status(400).json({ status: 'error', error })

    let cartId = (await db.findOne('shopping_carts', { user_id: req.session.userid })).id
    if (!cartId) await db.insert('shopping_carts', { user_id: req.session.userid }).then(id => (cartId = id))

    const cartItem = await db.findOne('cart_items', { cart_id: cartId, product_id: req.body.product_id })
    if (!cartItem) return res.status(400).json({ status: 'error', error: 'Этот продукт в корзине не найден' })

    await db.delete('cart_items', cartItem.id)
    res.json({ status: 'success' })
  }
)

module.exports = router
