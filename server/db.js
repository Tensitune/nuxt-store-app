const Sequelize = require("sequelize");
const fs = require("fs");
const consola = require("consola");

const { join } = require("path");

const requireModels = ["User", "Category", "Product", "Review", "Cart", "CartItem", "Order"];

module.exports = async (app) => {
  const sequelize = new Sequelize({
    database: app.config.mysql.database,
    username: app.config.mysql.username,
    password: app.config.mysql.password,
    host: app.config.mysql.host,
    port: app.config.mysql.port,
    dialect: "mysql",
    logging: false,
    operatorsAliases: "0",
    query: { raw: true }
  });

  const models = {};
  requireModels.forEach(modelName => {
    const modelPath = join(__dirname, "models", modelName + ".js");
    if (fs.statSync(modelPath).isFile()) {
      const model = require(modelPath)(sequelize, Sequelize.DataTypes);
      models[modelName] = model;
    }
  });

  await sequelize.sync()
    .then(() => consola.ready({ message: `Успешное подключение к базе данных '${app.config.mysql.database}'`, badge: true }))
    .catch(console.error.bind(console, "Ошибка подключения:"));

  return { models, sequelize };
};
