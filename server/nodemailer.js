const nodemailer = require("nodemailer");

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport(
      {
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: process.env.MAILER_PORT === "465", // true для 465, false для других портов
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS
        }
      },
      {
        from: `Node Mailer <${process.env.MAILER_USER}>`
      }
    );
  }

  sendMail = (message) => {
    this.transporter.sendMail(message, err => {
      if (err) console.error(err);
    });
  }
}

module.exports = new Mailer().sendMail;
