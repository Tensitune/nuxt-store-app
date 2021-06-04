const bcrypt = require("bcrypt");

const { body } = require("express-validator");
const { validationResult } = require("../helpers");

const { UserMiddleware } = require("../middleware");

module.exports = (api, app) => {
  const User = app.db.models.User;
  const Cart = app.db.models.Cart;

  api.post("/auth/signin",
    body("username", "Требуется имя пользователя").notEmpty(),
    body("password", "Требуется пароль").notEmpty(),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const user = await User.findOne({ where: { username: req.body.username } });
      if (!user) return res.json({ success: false, error: "Такого пользователя не существует" });

      const passwordCheck = await bcrypt.compare(req.body.password, user.password);
      if (!passwordCheck) {
        return res.json({ success: false, error: "Неверный пароль" });
      }

      delete user.password;
      req.session.user = user;

      res.json({ success: true });
    }
  );

  api.post("/auth/signup",
    body("username", "Требуется имя пользователя").notEmpty().isLength({ max: 25 }).custom(async value => {
      const user = await User.findOne({ where: { username: value } });
      if (user) return Promise.reject(new Error("Имя пользователя уже занято"));
    }),
    body("password", "Требуется пароль").notEmpty().isLength({ min: 3 }),
    body("firstname", "Требуется имя").notEmpty().isLength({ max: 25 }),
    body("lastname", "Требуется фамилия").notEmpty().isLength({ max: 25 }),
    body("phone", "Требуется номер телефона").notEmpty().isLength({ max: 16 }),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const password = bcrypt.hashSync(req.body.password, 10);
      const user = await User.create({
        username: req.body.username,
        password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone
      });

      await Cart.create({ userId: user.id });

      delete user.password;
      req.session.user = user;

      res.json({ success: true });
    }
  );

  api.get("/auth/signout", (req, res) => {
    if (req.session.user) delete req.session.user;
    res.redirect("/");
  });

  api.put("/auth",
    UserMiddleware,
    body("username", "Требуется имя пользователя").notEmpty().isLength({ max: 25 }).custom(async (value, { req }) => {
      if (req.session.user.username === value) return Promise.resolve();

      const user = await User.findOne({ where: { username: value } });
      if (user) return Promise.reject(new Error("Имя пользователя уже занято"));
    }),
    body("password", "Требуется пароль").notEmpty().isLength({ min: 3 }),
    body("firstname", "Требуется имя").notEmpty().isLength({ max: 25 }),
    body("lastname", "Требуется фамилия").notEmpty().isLength({ max: 25 }),
    body("phone", "Требуется номер телефона").notEmpty().isLength({ max: 16 }),
    async (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const password = bcrypt.hashSync(req.body.password, 10);
      const data = {
        username: req.body.username,
        password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone ?? ""
      };

      await User.update(data, { where: { id: req.session.user.id } });

      req.session.user = { ...req.session.user, ...data };

      res.json({ success: true });
    }
  );
};
