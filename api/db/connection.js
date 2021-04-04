const fs = require('fs')
const mysql = require('mysql')

const pool = mysql.createPool({
  multipleStatements: true,
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

function Init() {
  const schemaQueries = fs.readFileSync('database/migrations/schema.sql', 'utf8')
  pool.query(schemaQueries, err => {
    if (err) throw err
  })
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
      if (!results) return resolve(false)
      resolve(results[0])
    })
  })
}

function addOrUpdate(table, data) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${table} SET ? ON DUPLICATE KEY UPDATE ?`

    pool.query(query, [data, data], (err, results) => {
      if (err) return reject(err)
      resolve(results.insertId)
    })
  })
}

function deleteRows(table, data) {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM ${table} WHERE ?`

    pool.query(query, data, (err, results) => {
      if (err) return reject(err)
      resolve(results.insertId)
    })
  })
}

module.exports = {
  Init: Init,
  getRows: getRows,
  find: find,
  findOne: findOne,
  addOrUpdate: addOrUpdate,
  delete: deleteRows
}
