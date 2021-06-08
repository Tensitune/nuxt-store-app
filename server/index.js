require("dotenv").config();

const express = require("express");
const session = require("express-session");
const app = express();

app.config = require("../config.json");

app.use(
  session({
    secret: app.config.secret,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: "auto" }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function init() {
  app.db = await require("./db")(app);
  app.sendMail = require("./nodemailer")(app);
  require("./api")(app);
}

init();

module.exports = app;
