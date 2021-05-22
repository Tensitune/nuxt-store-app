const bcrypt = require("bcrypt");

const { body } = require("express-validator");
const { validationResult } = require("../helpers");

module.exports = (api, app) => {
  api.post("/auth/signin",
    body("username", "Требуется имя пользователя").notEmpty().custom(async value => {
      const user = await app.db.findOne("users", { username: value });
      if (!user) return Promise.reject(new Error("Такого пользователя не существует"));
    }),
    body("password", "Требуется пароль").notEmpty(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      const user = await app.db.findOne("users", { username: req.body.username });
      const passwordCheck = await bcrypt.compare(req.body.password, user.password);

      if (!passwordCheck) {
        return res.json({ status: "error", error: "Неверный пароль" });
      }

      delete user.password;
      req.session.user = user;

      res.json({ status: "success" });
    }
  );

  api.post("/auth/signup",
    body("username", "Требуется имя пользователя").notEmpty().isLength({ max: 25 }).custom(async value => {
      const user = await app.db.findOne("users", { username: value });
      if (user) return Promise.reject(new Error("Имя пользователя уже занято"));
    }),
    body("password", "Требуется пароль").notEmpty().isLength({ min: 3 }),
    body("firstname", "Требуется имя").notEmpty().isLength({ max: 25 }),
    body("lastname", "Требуется фамилия").notEmpty().isLength({ max: 25 }),
    body("phone").isLength({ max: 16 }),
    body("address").isLength({ max: 255 }),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ status: "error", error: error.msg });

      const password = bcrypt.hashSync(req.body.password, 10);
      await app.db.insert("users", {
        username: req.body.username,
        password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone ?? "",
        address: req.body.address ?? ""
      }).then(async (userId) => {
        await app.db.insert("shopping_carts", { userId });

        const user = await app.db.findOne("users", { id: userId });
        if (user) {
          delete user.password;
          req.session.user = user;
        }

        res.json({ status: "success" });
      });
    }
  );

  api.get("/auth/signout", (req, res) => {
    if (req.session.user) delete req.session.user;
    res.redirect("/");
  });
};
