const { body } = require("express-validator");
const helpers = require("../helpers");

const { UserMiddleware, AdminMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const Product = app.db.models.Product;
  const Order = app.db.models.Order;

  api.get("/orders", UserMiddleware, async (req, res) => {
    const options = { where: { userId: req.session.user.id } };

    if (req.session.user.isAdmin) {
      delete options.where;
    }

    if (req.query.page) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.perPage) || 9;

      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const orders = await Order.findAndCountAll(options);
    res.json(orders);
  });

  api.get("/orders/:userId", AdminMiddleware, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (!userId) return res.json({ success: false, error: "Неверный ID пользователя" });

    const options = { where: { userId } };

    if (req.query.page) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.perPage) || 9;

      options.limit = limit;
      options.offset = (page - 1) * limit;
    }

    const orders = await Order.findAndCountAll(options);
    res.json(orders);
  });

  api.put("/orders/:orderId",
    AdminMiddleware,
    body("status").notEmpty(),
    async (req, res) => {
      const order = await Order.findByPk(req.params.orderId);
      if (!order) return res.json({ success: false, error: "Такого заказа не существует" });

      const error = helpers.validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Order.update({ status: req.body.status }, { where: { id: req.params.orderId } });

      res.json({ success: true });
    }
  );

  api.delete("/orders/:orderId", AdminMiddleware, async (req, res) => {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.json({ success: false, error: "Такого заказа не существует" });

    if (order.status === 0) {
      const orderItems = JSON.parse(order.cartItems);
      for (const item of orderItems) {
        await Product.findByPk(item.productId, { raw: false }).then(obj => {
          obj.update({ stock: obj.stock + item.quantity });
        });
      }
    }

    await Order.destroy({ where: { id: req.params.orderId } });
    res.json({ success: true });
  });
};
