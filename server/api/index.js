const express = require("express");
const api = express.Router();

module.exports = app => {
  require("./routes/auth")(api, app);
  require("./routes/cart")(api, app);
  require("./routes/categories")(api, app);
  require("./routes/products")(api, app);
  require("./routes/reviews")(api, app);
  require("./routes/users")(api, app);

  app.use("/api", api);
};
