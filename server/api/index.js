const express = require("express");
const api = express.Router();

const fs = require("fs");
const path = require("path");

module.exports = app => {
  fs.readdirSync(path.join(__dirname, "routes")).forEach(file => {
    const filePath = path.join(__dirname, "routes", file);
    if (fs.statSync(filePath).isFile() && path.extname(filePath) === ".js") {
      require(filePath)(api, app);
    }
  });

  app.use("/api", api);
};
