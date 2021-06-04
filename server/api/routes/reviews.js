const { body } = require("express-validator");
const { validationResult } = require("../helpers");

const { UserMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const Product = app.db.models.Product;
  const Review = app.db.models.Review;

  api.get("/reviews/:productId", async (req, res) => {
    let reviews = null;

    const options = { where: { productId: req.params.productId }, order: [["publishedAt", "DESC"]] };
    if (req.query.rating && typeof req.query.rating === "number") options.where.rating = req.query.rating;

    if (req.query.page) {
      const limit = req.query.limit && typeof req.query.limit === "number" ? req.query.limit : 9;
      reviews = await Review.findAndCountAll({
        ...options,
        limit,
        offset: typeof req.query.page === "number" ? (req.query.page - 1) * limit : 0
      });
    } else {
      reviews = await Review.findAndCountAll(options);
    }

    res.json(reviews);
  });

  api.post("/reviews/:productId",
    UserMiddleware,
    body("rating").notEmpty().isFloat(),
    body("text").notEmpty(),
    async (req, res) => {
      const product = await Product.findByPk(req.params.productId);
      if (!product) return res.json({ success: false, error: "Такого товара не существует" });

      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Review.create({
        productId: req.params.productId,
        userId: req.session.user.id,
        rating: req.body.rating,
        text: req.body.text
      });

      res.json({ success: true });
    }
  );

  api.put("/reviews/:reviewId",
    UserMiddleware,
    body("rating").notEmpty().isFloat(),
    body("text").notEmpty(),
    async (req, res) => {
      const review = await Review.findByPk(req.params.reviewId);
      if (!review) return res.json({ success: false, error: "Такого отзыва не существует" });

      if (review.userId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.json({ success: false, error: "Вы не можете изменить чужой отзыв" });
      }

      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      await Review.update({
        rating: req.body.rating,
        text: req.body.text
      }, { where: { id: req.params.reviewId } });

      res.json({ success: true });
    }
  );

  api.delete("/reviews/:reviewId", UserMiddleware, async (req, res) => {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.json({ success: false, error: "Такого отзыва не существует" });

    if (review.userId !== req.session.user.id && !req.session.user.isAdmin) {
      return res.json({ success: false, error: "Вы не можете удалить чужой отзыв" });
    }

    await Review.destroy({ where: { id: req.params.reviewId } });
    res.json({ success: true });
  });
};
