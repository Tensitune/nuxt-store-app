const { body } = require("express-validator");
const { validationResult } = require("../helpers");

const { UserMiddleware } = require("../middleware");

function formatCurrency(price) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(price);
}

module.exports = (api, app) => {
  const Cart = app.db.models.Cart;
  const CartItem = app.db.models.CartItem;
  const Product = app.db.models.Product;
  const Order = app.db.models.Order;

  api.get("/cart", UserMiddleware, async (req, res) => {
    const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;
    const cartItems = await CartItem.findAll({ where: { cartId } });

    const newCartItems = [];
    for (let i = 0; i < cartItems.length; i++) {
      const product = await Product.findByPk(cartItems[i].productId);
      const quantity = cartItems[i].quantity;

      newCartItems.push({ ...product, quantity });
    }

    res.json(newCartItems);
  });

  api.post("/cart/checkout",
    UserMiddleware,
    body("email").normalizeEmail().isEmail(),
    body("address").notEmpty(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;
      const cartItems = await CartItem.findAll({ where: { cartId } });

      if (!cartItems.length) return res.json({ success: false, error: "Товары в корзине не найдены" });

      const deliveryPrice = req.body.address ? 500 : 0;

      let itemsText = "";
      let productsTotal = 0;

      for (const item of cartItems) {
        const product = await Product.findByPk(item.productId);
        if (!product) continue;

        itemsText += `
          <tr>
            <td align="center">${item.productId}</td>
            <td>${product.title}</td>
            <td align="center">${formatCurrency(product.price)}</td>
            <td align="center">${item.quantity} шт.</td>
          </tr>
        `;

        productsTotal += product.price * item.quantity;
      }

      const order = await Order.create({
        userId: req.session.user.id,
        cartItems,
        deliveryAddress: req.body.address
      });

      const message = {
        to: req.body.email,
        subject: `Чек оплаты Nuxt Store`,
        html: `
          <h2>Чек оплаты товаров для ${req.session.user.username}</h2>
          <h2>Код заказа: ${order.id}</h2>

          <hr>

          <h4>Магазин: Nuxt Store</h4>
          <h4>Эл. почта: ${process.env.MAILER_USER}</h4>
          <h4>Адрес доставки: ${req.body.address}</h4>

          <hr>

          <h4>Товары:</h4>
          <table border="1" cellspacing="0">
            <tr>
              <th>#</th>
              <th>Наименование товара</th>
              <th>Цена</th>
              <th>Количество</th>
            </tr>
            ${itemsText}
          </table>

          <h4>Цена за товары: ${formatCurrency(productsTotal)}</h4>
          <h4>Цена за доставку: ${formatCurrency(deliveryPrice)}</h4>
          <h4>Итого: ${formatCurrency(productsTotal + deliveryPrice)}</h4>
        `
      };

      app.sendMail(message);
      await CartItem.destroy({ where: { cartId } });

      res.json({ success: true });
    }
  );

  api.post("/cart",
    UserMiddleware,
    body("productId").notEmpty().isInt().custom(async (value, { req }) => {
      const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;
      const cartItem = await CartItem.findOne({ where: { cartId, productId: value } });

      if (cartItem) return Promise.reject(new Error("Этот товар уже есть в вашей корзине"));
    }),
    body("quantity", "Требуется количество").notEmpty().isInt(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;
      await CartItem.create({
        cartId,
        productId: req.body.productId,
        quantity: req.body.quantity
      });

      res.json({ success: true });
    }
  );

  api.put("/cart/:productId",
    UserMiddleware,
    body("quantity").notEmpty().isInt(),
    async (req, res) => {
      const product = await Product.findByPk(req.params.productId);
      if (!product) return res.json({ success: false, error: "Такого товара не существует" });

      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;

      const cartItem = await CartItem.findOne({ where: { cartId, productId: req.params.productId } });
      if (!cartItem) return res.json({ success: false, error: "Этот товар в корзине не найден" });

      await CartItem.update({ quantity: req.body.quantity }, { where: { id: cartItem.id } });
      res.json({ success: true });
    }
  );

  api.delete("/cart/:productId", UserMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const cartId = (await Cart.findOrCreate({ where: { userId: req.session.user.id } }))[0].id;
    await CartItem.destroy({ where: { cartId, productId: req.params.productId } });

    res.json({ success: true });
  });
};
