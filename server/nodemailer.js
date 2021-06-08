const nodemailer = require("nodemailer");

class Mailer {
  constructor(config) {
    this.transporter = nodemailer.createTransport(
      {
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
          user: config.email,
          pass: config.password
        }
      },
      {
        from: `Node Mailer <${config.email}>`
      }
    );
  }

  sendMail = (message) => {
    this.transporter.sendMail(message, err => {
      if (err) console.error(err);
    });
  }
}

module.exports = app => {
  return new Mailer(app.config.mailer).sendMail;
};
