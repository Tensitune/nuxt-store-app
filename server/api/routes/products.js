const fs = require("fs");
const path = require("path");

const { body } = require("express-validator");
const helpers = require("../helpers");

const Busboy = require("busboy");

const { AdminMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const Category = app.db.models.Category;
  const Product = app.db.models.Product;
  const Review = app.db.models.Review;
  const Order = app.db.models.Order;

  api.get("/products", async (req, res) => {
    const options = { where: {} };
    helpers.setProductQueryOptions(req.query, options, Product);

    if (req.query.isRecommended) options.where.isRecommended = true;

    const products = await Product.findAndCountAll(options);
    await helpers.setProductsRating(products.rows, Review);

    if (req.query.rating) {
      const rating = parseFloat(req.query.rating) || 4.0;
      products.rows = products.rows.filter(product => product.rating >= rating)
        .sort((a, b) => (a.rating > b.rating));
    }

    res.json(products);
  });

  api.get("/products/:productId", async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (product) {
      await helpers.setProductsRating([product], Review);
    }

    res.json(product);
  });

  api.post("/products",
    AdminMiddleware,
    body("categoryId").notEmpty().isInt().custom(async value => {
      const category = await Category.findByPk(value);
      if (!category) return Promise.reject(new Error("Такой категории не существует"));
    }),
    body("title").notEmpty().isLength({ max: 80 }),
    body("description").notEmpty(),
    body("price").notEmpty().isInt(),
    body("stock").notEmpty().isInt(),
    body("isRecommended").notEmpty().isBoolean(),
    async (req, res) => {
      const error = helpers.validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Product.create({
        categoryId: req.body.categoryId,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        isRecommended: req.body.isRecommended
      });

      res.json({ success: true });
    }
  );

  // something like that
  api.post("/products/:productId/upload", async (req, res) => {
    const productId = parseInt(req.params.productId);
    if (!productId) return res.json({ success: false, error: "Неверный ID товара" });

    const product = await Product.findByPk(productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const busboy = new Busboy({ headers: req.headers });

    busboy.on("file", (fieldname, file, filename) => {
      const uploadPath = path.join(__dirname, "../../../assets/products", productId + ".jpg");
      file.pipe(fs.createWriteStream(uploadPath));
    });

    busboy.on("finish", () => {
      res.json({ success: true });
    });

    return req.pipe(busboy);
  });

  api.put("/products/:productId", AdminMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const data = {};

    const categoryId = parseInt(req.body.categoryId);
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) return res.json({ success: false, error: "Такой категории не существует" });

      data.categoryId = categoryId;
    }

    if (req.body.title) data.title = req.body.title;
    if (req.body.description) data.description = req.body.description;
    if (req.body.price) data.price = req.body.price;
    if (req.body.stock) data.stock = req.body.stock;
    if (req.body.isRecommended) data.thumbnail = req.body.thumbnail;

    await Product.update(data, { where: { id: req.params.productId } });
    res.json({ success: true });
  });

  api.delete("/products/:productId", AdminMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const foundedOrders = [];
    const orders = await Order.findAll();

    for (const order of orders) {
      const orderCartItems = JSON.parse(order.cartItems);
      const filtererItems = orderCartItems.filter(item => item.id === req.params.productId);

      if (filtererItems.length) {
        foundedOrders.push(order.id);
      }
    }

    if (foundedOrders.length) {
      return res.json({ success: false, error: `Этот товар находиться в заказах c номерами ${foundedOrders}.` });
    }

    await Product.destroy({ where: { id: req.params.productId } });
    res.json({ success: true });
  });
};
