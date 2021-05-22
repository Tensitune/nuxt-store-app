const { body } = require("express-validator");
const { getPagedRows, validationResult } = require("../helpers");

const { AdminMiddleware } = require("../middleware");

module.exports = (api, app) => {
  api.get("/categories", async (req, res) => {
    const categories = await app.db.find("categories");
    res.json({ status: "success", data: categories });
  });

  api.get("/categories/:categoryId", async (req, res) => {
    const whereParams = { catId: req.params.categoryId };

    if (req.query.title) {
      whereParams.title = { like: req.query.title };
    }

    if (req.query.priceFrom || req.query.priceTo) {
      whereParams.price = {};
      if (req.query.priceFrom) whereParams.price.greaterThan = req.query.priceFrom;
      if (req.query.priceTo) whereParams.price.lessThan = req.query.priceTo;
    }

    const orderParam = {};
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(",");
      orderParam.by = orderBy[0];
      orderParam.desc = orderBy[1] === "true";
    }

    const products = await getPagedRows(app.db, "products", whereParams, req.query, orderParam);
    res.json({ status: "success", data: products });
  });

  api.post("/categories",
    AdminMiddleware,
    body("title").notEmpty().isLength({ max: 50 }).trim().escape(),
    body("icon").notEmpty().isLength({ max: 25 }),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      await app.db.insert("categories", {
        title: req.body.title,
        icon: req.body.icon
      });

      res.json({ status: "success" });
    }
  );

  api.put("/categories/:categoryId",
    AdminMiddleware,
    body("title").notEmpty().isLength({ max: 50 }).trim().escape(),
    body("icon").notEmpty().isLength({ max: 25 }),
    async (req, res) => {
      const category = await app.db.findOne("categories", { id: req.params.categoryId });
      if (!category) return res.json({ status: "error", error: "Такой категории не существует" });

      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      await app.db.update("categories", req.params.categoryId, {
        title: req.body.title,
        icon: req.body.icon
      });

      res.json({ status: "success" });
    }
  );

  api.delete("/categories/:categoryId", AdminMiddleware, async (req, res) => {
    const category = await app.db.findOne("categories", { id: req.params.categoryId });
    if (!category) return res.json({ status: "error", error: "Такой категории не существует" });

    const error = validationResult(req);
    if (error) return res.json({ status: "error", error: error.msg });

    await app.db.delete("categories", req.params.categoryId);
    res.json({ status: "success" });
  });
};
