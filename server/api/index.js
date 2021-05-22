const express = require("express");
const api = express.Router();

const fs = require("fs");
const { join } = require("path");

const path = join(__dirname, `/routes`);
const routes = fs.readdirSync(path).filter(file => file.endsWith(".js"));

module.exports = app => {
  for (const route of routes) {
    require(path + `/${route}`)(api, app);
  }

  app.use("/api", api);
};
