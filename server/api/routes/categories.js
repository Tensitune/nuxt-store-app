const { body } = require("express-validator");
const helpers = require("../helpers");

const { AdminMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const Category = app.db.models.Category;
  const Product = app.db.models.Product;
  const Review = app.db.models.Review;

  api.get("/categories/:categoryId", async (req, res) => {
    const options = { where: { categoryId: req.params.categoryId } };
    helpers.setProductQueryOptions(req.query, options, Product);

    const products = await Product.findAndCountAll(options);
    await helpers.setProductsRating(products.rows, Review);

    res.json(products);
  });

  api.get("/categories", async (req, res) => {
    const categories = await Category.findAll();
    res.json(categories);
  });

  api.post("/categories",
    AdminMiddleware,
    body("title").notEmpty().isLength({ max: 50 }).trim().escape(),
    body("icon").notEmpty().isLength({ max: 25 }),
    async (req, res) => {
      const error = helpers.validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Category.create({
        title: req.body.title,
        icon: req.body.icon
      });

      res.json({ success: true });
    }
  );

  api.put("/categories/:categoryId",
    AdminMiddleware,
    body("title").notEmpty().isLength({ max: 50 }).trim().escape(),
    body("icon").notEmpty().isLength({ max: 25 }),
    async (req, res) => {
      const category = await Category.findByPk(req.params.categoryId);
      if (!category) return res.json({ success: false, error: "Такой категории не существует" });

      const error = helpers.validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Category.update({
        title: req.body.title,
        icon: req.body.icon
      }, { where: { id: req.params.categoryId } });

      res.json({ success: true });
    }
  );

  api.delete("/categories/:categoryId", AdminMiddleware, async (req, res) => {
    const category = await Category.findByPk(req.params.categoryId);
    if (!category) return res.json({ success: false, error: "Такой категории не существует" });

    await Category.destroy({ where: { id: req.params.categoryId } });
    res.json({ success: true });
  });
};
