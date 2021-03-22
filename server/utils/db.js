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

const schemaQueries = fs.readFileSync('database/migrations/schema.sql', 'utf8')
  .replace(/(\r\n|\n|\r)/gm, ' ') // удаление новых строк
  .replace(/\s+/g, ' ') // избыточное пустое пространство
  .split(';') // разделение на все операторы
  .map(Function.prototype.call, String.prototype.trim)
  .filter(function(el) { return el.length !== 0 })

async function Init() {
  for (const query of schemaQueries) {
    await new Promise((resolve, reject) => {
      pool.query(query, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

function getRows(table) {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT * FROM ${table}`, (err, results) => {
      if (err) return reject(err)
      resolve(results)
    })
  })
}

function find(table, data) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${table} WHERE ?`
    pool.query(query, data, (err, results) => {
      if (err) return reject(err)
      if (!results[0]) return resolve(false)
      resolve(results)
    })
  })
}

function findOne(table, data) {
  return new Promise(resolve => {
    find(table, data).then(results => {
      if (!results) resolve(false)
      resolve(results[0])
    })
  })
}

async function sendEscapeQueries(query, data, escapes) {
  const escapeData = []

  for (const el of data) {
    for (let i = 0; i < escapes; i++) {
      escapeData.push(el)
    }

    await new Promise((resolve, reject) => {
      pool.query(query, escapeData, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

function addOrUpdate(table, data) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${table} SET ? ON DUPLICATE KEY UPDATE ?`

    if (Array.isArray(data)) {
      sendEscapeQueries(query, data, 2)
      resolve()
      return
    }

    pool.query(query, [data, data], err => {
      if (err) reject(err)
      resolve()
    })
  })
}

module.exports = {
  Init: Init,
  query: pool.query,
  getRows: getRows,
  find: find,
  findOne: findOne,
  addOrUpdate: addOrUpdate
}
