const { check } = require('express-validator')
const { validationResult } = require('../helpers')

const { UserMiddleware } = require('../middleware')

module.exports = (api, app) => {
  api.get('/cart', UserMiddleware, async (req, res) => {
    let cartId = (await app.db.findOne('shopping_carts', { userId: req.session.user.id })).id
    if (!cartId) await app.db.insert('shopping_carts', { userId: req.session.user.id }).then(id => (cartId = id))

    let cartItems = []
    if (req.query.count) {
      cartItems = await app.db.count('cart_items', { cartId })
    } else {
      cartItems = await app.db.find('cart_items', { cartId })
    }

    res.json({ status: 'success', data: cartItems })
  })

  api.post('/cart',
    UserMiddleware,
    check('productId').notEmpty().custom(async (value, { req }) => {
      let cartId = (await app.db.findOne('shopping_carts', { userId: req.session.user.id })).id
      if (!cartId) await app.db.insert('shopping_carts', { userId: req.session.user.id }).then(id => (cartId = id))

      const category = await app.db.findOne('cart_items', { cartId, productId: value })
      if (category) return Promise.reject(new Error('Этот товар уже есть в вашей корзине'))
    }),
    check('quantity').notEmpty(),
    async (req, res) => {
      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      let cartId = (await app.db.findOne('shopping_carts', { userId: req.session.user.id })).id
      if (!cartId) await app.db.insert('shopping_carts', { userId: req.session.user.id }).then(id => (cartId = id))

      await app.db.insert('cart_items', {
        cartId,
        productId: req.body.productId,
        quantity: req.body.quantity
      })

      res.json({ status: 'success' })
    }
  )

  api.put('/cart/:productId',
    UserMiddleware,
    check('quantity').notEmpty(),
    async (req, res) => {
      const product = await app.db.findOne('products', { id: req.params.productId })
      if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

      const error = validationResult(req)
      if (error) return res.json({ status: 'error', error: error.msg })

      let cartId = (await app.db.findOne('shopping_carts', { userId: req.session.user.id })).id
      if (!cartId) await app.db.insert('shopping_carts', { userId: req.session.user.id }).then(id => (cartId = id))

      const cartItem = await app.db.findOne('cart_items', { cartId, productId: req.params.productId })
      if (!cartItem) return res.json({ status: 'error', error: 'Этот товар в корзине не найден' })

      await app.db.update('cart_items', cartItem.id, { quantity: req.body.quantity })
      res.json({ status: 'success' })
    }
  )

  api.delete('/cart/:productId', UserMiddleware, async (req, res) => {
    const product = await app.db.findOne('products', { id: req.params.productId })
    if (!product) return res.json({ status: 'error', error: 'Такого товара не существует' })

    const error = validationResult(req)
    if (error) return res.json({ status: 'error', error: error.msg })

    let cartId = (await app.db.findOne('shopping_carts', { userId: req.session.user.id })).id
    if (!cartId) await app.db.insert('shopping_carts', { userId: req.session.user.id }).then(id => (cartId = id))

    const cartItem = await app.db.findOne('cart_items', { cartId, productId: req.params.productId })
    if (!cartItem) return res.json({ status: 'error', error: 'Этот товар в корзине не найден' })

    await app.db.delete('cart_items', cartItem.id)
    res.json({ status: 'success' })
  })
}
