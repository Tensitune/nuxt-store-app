require("dotenv").config();

const express = require("express");
const session = require("express-session");
const app = express();

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: "auto" }
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function init() {
  app.db = await require("./db")();
  app.sendMail = require("./nodemailer");
  require("./api")(app);
}

init();

module.exports = app;
