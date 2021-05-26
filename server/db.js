const Sequelize = require("sequelize");
const fs = require("fs");
const consola = require("consola");

const { join } = require("path");

const requireModels = ["User", "Category", "Product", "Review", "Cart", "CartItem"];

module.exports = async () => {
  const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
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
    .then(() => consola.ready({ message: `Успешное подключение к базе данных '${process.env.DB_NAME}'`, badge: true }))
    .catch(console.error.bind(console, "Ошибка подключения:"));

  return { models, sequelize };
};
