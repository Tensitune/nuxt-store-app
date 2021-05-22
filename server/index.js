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

app.db = require("./db");
require("./api")(app);

module.exports = app;
if (require.main === module) {
  const host = process.env.HOST || "127.0.0.1";
  const port = process.env.PORT || 3001;

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
}
