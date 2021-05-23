const { body } = require("express-validator");
const { validationResult } = require("../helpers");

const { UserMiddleware } = require("../middleware");

function formatCurrency(price) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(price);
}

module.exports = (api, app) => {
  api.get("/cart", UserMiddleware, async (req, res) => {
    let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
    if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

    const cartItems = await app.db.find("cart_items", { cartId });
    for (let i = 0; i < cartItems.length; i++) {
      const quantity = cartItems[i].quantity;
      cartItems[i] = await app.db.findOne("products", { id: cartItems[i].productId });
      cartItems[i] = { ...cartItems[i], quantity };
    }

    res.json({ status: "success", data: cartItems });
  });

  api.post("/cart/checkout",
    UserMiddleware,
    body("email").normalizeEmail().isEmail(),
    body("delivery").isBoolean(),
    body("address").isString(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
      if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

      const cartItems = await app.db.find("cart_items", { cartId });
      const deliveryPrice = req.body.delivery ? 500 : 0;

      let itemsText = "";
      let productsTotal = 0;

      if (cartItems) {
        itemsText += "<ul>";

        for (const item of cartItems) {
          const product = await app.db.findOne("products", { id: item.productId });
          if (!product) continue;

          itemsText += `<li>${product.title} - ${formatCurrency(product.price)} - ${item.quantity} шт.</li><br>`;
          productsTotal += product.price * item.quantity;
        }

        itemsText += "</ul>";
      }

      const message = {
        to: req.body.email,
        subject: "Чек оплаты товаров Nuxt Store",
        html: `
          <h2>Чек оплаты товаров для ${req.session.user.username}</h2>
          <hr>
          <h4>Магазин: Nuxt Store</h4>
          <h4>Эл. почта: ${process.env.MAILER_USER}</h4>
        ` + (req.body.delivery ? `<h4>Адрес доставки: ${req.body.address}</h4>` : "") + `
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

      await app.db.delete("cart_items", { cartId });
      res.json({ status: "success" });
    }
  );

  api.post("/cart",
    UserMiddleware,
    body("productId").notEmpty().isInt().custom(async (value, { req }) => {
      let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
      if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

      const category = await app.db.findOne("cart_items", { cartId, productId: value });
      if (category) return Promise.reject(new Error("Этот товар уже есть в вашей корзине"));
    }),
    body("quantity", "Требуется количество").notEmpty().isInt(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
      if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

      await app.db.insert("cart_items", {
        cartId,
        productId: req.body.productId,
        quantity: req.body.quantity
      });

      res.json({ status: "success" });
    }
  );

  api.put("/cart/:productId",
    UserMiddleware,
    body("quantity").notEmpty().isInt(),
    async (req, res) => {
      const product = await app.db.findOne("products", { id: req.params.productId });
      if (!product) return res.json({ status: "error", error: "Такого товара не существует" });

      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
      if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

      const cartItem = await app.db.findOne("cart_items", { cartId, productId: req.params.productId });
      if (!cartItem) return res.json({ status: "error", error: "Этот товар в корзине не найден" });

      await app.db.update("cart_items", cartItem.id, { quantity: req.body.quantity });
      res.json({ status: "success" });
    }
  );

  api.delete("/cart/:productId", UserMiddleware, async (req, res) => {
    const product = await app.db.findOne("products", { id: req.params.productId });
    if (!product) return res.json({ status: "error", error: "Такого товара не существует" });

    const error = validationResult(req);
    if (error) return res.json({ status: "error", error: error.msg });

    let cartId = (await app.db.findOne("shopping_carts", { userId: req.session.user.id })).id;
    if (!cartId) await app.db.insert("shopping_carts", { userId: req.session.user.id }).then(id => (cartId = id));

    await app.db.delete("cart_items", { cartId, productId: req.params.productId });
    res.json({ status: "success" });
  });
};
