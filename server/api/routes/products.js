const { body } = require("express-validator");
const helpers = require("../helpers");

const { AdminMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const Category = app.db.models.Category;
  const Product = app.db.models.Product;
  const Review = app.db.models.Review;

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
    await helpers.setProductsRating([product], Review);

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

  api.put("/products/:productId", AdminMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    const error = helpers.validationResult(req);
    if (error) return res.json({ success: false, error: error.msg });

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
    if (req.body.thumbnail) data.thumbnail = req.body.thumbnail;
    if (req.body.isRecommended) data.thumbnail = req.body.thumbnail;

    await Product.update(data, { where: { id: req.params.productId } });
    res.json({ success: true });
  });

  api.delete("/products/:productId", AdminMiddleware, async (req, res) => {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.json({ success: false, error: "Такого товара не существует" });

    await Product.destroy({ where: { id: req.params.productId } });
    res.json({ success: true });
  });
};
