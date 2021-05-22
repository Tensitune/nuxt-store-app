const mysql2 = require("mysql2");

const mapKeys = require("lodash.mapkeys");
const camelCase = require("lodash.camelcase");

class DBConnection {
  constructor() {
    this.db = mysql2.createPool({
      multipleStatements: true,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    this.checkConnection();
  }

  checkConnection() {
    this.db.getConnection((err, conn) => {
      if (err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST")
          console.error("Соединение с базой данных было закрыто.");
        else if (err.code === "ER_CON_COUNT_ERROR")
          console.error("База данных имеет слишком много соединений.");
        else if (err.code === "ECONNREFUSED")
          console.error("Отказано в подключении к базе данных.");

        if (conn) conn.release();
      }
    });
  }

  query = async (sql, values) => {
    return await new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (err) return reject(err);

        // Преобразование snake_case ключей в camelCase у объектов строк
        if (Array.isArray(result)) {
          result = result.map(row => mapKeys(row, (v, k) => camelCase(k)));
        }

        resolve(result);
      };

      this.db.execute(sql, values, callback);
    }).catch(err => {
      const mysqlErrorList = Object.keys(HttpStatusCodes);
      err.status = mysqlErrorList.includes(err.code) ? HttpStatusCodes[err.code] : err.status;

      throw err;
    });
  }
}

const HttpStatusCodes = Object.freeze({
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
  ER_DUP_ENTRY: 409
});

module.exports = new DBConnection().query;
