const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

exports.setProductQueryOptions = (query, options, productModel) => {
  if (query.title) options.where.title = { [Op.substring]: query.title };

  if (query.priceFrom || query.priceTo) {
    const priceFrom = parseInt(query.priceFrom) || 0;
    const priceTo = parseInt(query.priceTo) || 999999;

    options.where.price = {};
    if (query.priceFrom) options.where.price[Op.gte] = priceFrom;
    if (query.priceTo) options.where.price[Op.lte] = priceTo;
  }

  if (query.order) {
    const order = query.order.split(",");
    order[0] = order[0] && Object.keys(productModel.rawAttributes).includes(order[0]) ? order[0] : "id";
    order[1] = order[1] && order[1].toLowerCase() === "desc" ? "DESC" : "ASC";

    options.order = [order];
  }

  if (query.page) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.perPage) || 9;

    options.limit = limit;
    options.offset = (page - 1) * limit;
  }
};

exports.setProductsRating = async (products, reviewModel) => {
  for (let i = 0; i < products.length; i++) {
    const reviews = await reviewModel.findAll({ attributes: ["rating"], where: { productId: products[i].id } });

    if (reviews.length) {
      const rating = [];
      reviews.map(review => rating.push(review.rating));
      products[i].rating = rating.reduce((a, b) => a + b) / rating.length;
    } else {
      products[i].rating = 0;
    }
  }
};

exports.validationResult = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array()[0];
  }

  return false;
};
