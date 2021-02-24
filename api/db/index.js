const fs = require('fs')
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

// Извлечение SQL-запросов из schema.sql.
const schemaQueries = fs.readFileSync('database/migrations/schema.sql', 'utf8')
  .replace(/(\r\n|\n|\r)/gm, ' ') // удаление новых строк
  .replace(/\s+/g, ' ') // избыточное пустое пространство
  .split(';') // разделить на все операторы
  .map(Function.prototype.call, String.prototype.trim)
  .filter(function(el) { return el.length !== 0 }) // удаляем пустые элементы

function Init() {
  if (schemaQueries === undefined) return

  // Отправка SQL-запросов в БД
  schemaQueries.forEach(query => {
    // TODO - сделать задержку или что-то подобное
    pool.query(query, err => { if (err) throw err })
  })
}

module.exports = {
  Init: Init,
  query: pool.query
}
