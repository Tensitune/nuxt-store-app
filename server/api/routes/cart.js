const { body } = require("express-validator");
const { validationResult } = require("../helpers");

const { UserMiddleware } = require("../middleware");

function formatCurrency(price) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(price);
}

function makeRandomId(length) {
  const result = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }

  return result.join("");
}

module.exports = (api, app) => {
  const Cart = app.db.models.Cart;
  const CartItem = app.db.models.CartItem;
  const Product = app.db.models.Product;

  api.get("/cart", UserMiddleware, async (req, res) => {
    let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
    if (!cartId) {
      cartId = (await Cart.create({ userId: req.session.user.id })).id;
    }

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
    body("address").isString(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
      if (!cartId) {
        cartId = (await Cart.create({ userId: req.session.user.id })).id;
      }

      const cartItems = await CartItem.findAll({ where: { cartId } });
      const deliveryPrice = req.body.address ? 500 : 0;

      let itemsText = "";
      let deliveryText = "";
      let productsTotal = 0;

      if (req.body.address) deliveryText = `<h4>Адрес доставки: ${req.body.address}</h4>`;
      else deliveryText = "<h4>Вы можете забрать товары в любом нашем магазине, если они есть на складе</h4>";

      if (cartItems) {
        itemsText += "<ul>";

        for (const item of cartItems) {
          const product = await Product.findByPk(item.productId);
          if (!product) continue;

          itemsText += `<li>${product.title} - ${formatCurrency(product.price)} - ${item.quantity} шт.</li><br>`;
          productsTotal += product.price * item.quantity;
        }

        itemsText += "</ul>";
      }

      const chequeId = makeRandomId(8);

      const message = {
        to: req.body.email,
        subject: `Чек оплаты Nuxt Store #${chequeId}`,
        html: `
          <h2>Чек оплаты товаров для ${req.session.user.username}</h2>
          <h2>ID чека: #${chequeId}</h2>
          <hr>
          <h4>Магазин: Nuxt Store</h4>
          <h4>Эл. почта: ${process.env.MAILER_USER}</h4>
          ${deliveryText}
          <hr>
          <h4>Товары:</h4>
          ${itemsText}
          <hr>
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
      let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
      if (!cartId) {
        cartId = (await Cart.create({ userId: req.session.user.id })).id;
      }

      const cartItem = await CartItem.findOne({ where: { cartId, productId: value } });
      if (cartItem) return Promise.reject(new Error("Этот товар уже есть в вашей корзине"));
    }),
    body("quantity", "Требуется количество").notEmpty().isInt(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
      if (!cartId) {
        cartId = (await Cart.create({ userId: req.session.user.id })).id;
      }

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

      let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
      if (!cartId) {
        cartId = (await Cart.create({ userId: req.session.user.id })).id;
      }

      const cartItem = await CartItem.findOne({ where: { cartId, productId: req.params.productId } });
      if (!cartItem) return res.json({ success: false, error: "Этот товар в корзине не найден" });

      await CartItem.update({ quantity: req.body.quantity }, { where: { id: cartItem.id } });
      res.json({ success: true });
    }
  );

  api.delete("/cart/:productId", UserMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const error = validationResult(req);
    if (error) return res.json({ success: false, error: error.msg });

    let cartId = (await Cart.findOne({ where: { userId: req.session.user.id } }))?.id;
    if (!cartId) {
      cartId = (await Cart.create({ userId: req.session.user.id })).id;
    }

    await CartItem.destroy({ where: { cartId, productId: req.params.productId } });
    res.json({ success: true });
  });
};
