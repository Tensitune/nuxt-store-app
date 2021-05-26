const { body } = require("express-validator");
const { validationResult } = require("../helpers");

module.exports = (api, app) => {
  api.post("/feedback",
    body("email").normalizeEmail().isEmail(),
    body("text", "Требуется текст").notEmpty(),
    (req, res) => {
      const error = validationResult(req);
      if (error) return res.json({ success: false, error: error.msg });

      const message = {
        to: process.env.MAILER_USER,
        subject: "Обратная связь Nuxt Store",
        html: `
          <h2>Обратная связь Nuxt Store</h2>
          <div>
            <h4>Сообщение:</h4>
            <p>${req.body.text}</p>
            <hr>
            <h4>Отправитель: ${req.body.email}</h4>
          </div>
        `
      };

      app.sendMail(message);
      res.json({ success: true });
    }
  );
};
