const mysql = require('mysql')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

pool.on('connection', conn => {
  console.log('Успешное создание пула соединений MySQL!')
})

pool.on('error', err => {
  console.error(err)
})

const createTables = `
  CREATE TABLE IF NOT EXISTS \`users\` (
    \`user_id\` int NOT NULL AUTO_INCREMENT,
    \`username\` varchar(255) NOT NULL,
    \`password\` varchar(255) NOT NULL,
    \`firstname\` varchar(255),
    \`lastname\` varchar(255),
    PRIMARY KEY (\`user_id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`

function Init() {
  pool.query(createTables, err => {
    if (err) throw err
    console.log('Таблицы в базе данных были успешно созданы!')
  })
}

module.exports = {
  Init: Init,
  query: pool.query
}
