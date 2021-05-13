const { multipleColumnSet } = require('../utils')
const query = require('./connection')

class DB {
  count = async (table, params = {}) => {
    let sql = `SELECT COUNT(id) as count FROM ${table} USE INDEX (PRIMARY)`

    if (Object.keys(params).length) {
      const { columnSet, values } = multipleColumnSet(params)
      sql = `SELECT COUNT(id) as count FROM ${table} WHERE ${columnSet}`

      const result = await query(sql, [...values])
      return result[0].count
    }

    return await query(sql)
  }

  find = async (table, params = {}) => {
    let sql = `SELECT * FROM ${table}`

    if (!Object.keys(params).length) {
      return await query(sql)
    }

    const { columnSet, values } = multipleColumnSet(params)
    sql += ` WHERE ${columnSet}`

    return await query(sql, [...values])
  }

  findOne = async (table, params) => {
    const { columnSet, values } = multipleColumnSet(params)
    const sql = `SELECT * FROM ${table} WHERE ${columnSet}`
    const result = await query(sql, [...values])

    return result[0]
  }

  getPagedRows = async (table, page = 1, perPage = 20, params = {}) => {
    let sql = `SELECT * FROM ${table} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`

    if (Object.keys(params).length) {
      const { columnSet, values } = multipleColumnSet(params)
      sql = `SELECT * FROM ${table} WHERE ${columnSet} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`
      console.log(sql)
      return await query(sql, [...values])
    }

    return await query(sql)
  }

  insert = async (table, params) => {
    const { columnSet, values } = multipleColumnSet(params)
    const sql = `INSERT INTO ${table} SET ${columnSet}`
    const result = await query(sql, [...values])
    const insertId = result ? result.insertId : false

    return insertId
  }

  update = async (table, id, params) => {
    const { columnSet, values } = multipleColumnSet(params)
    const sql = `UPDATE ${table} SET ${columnSet} WHERE id = ?`
    const result = await query(sql, [...values, id])

    return result
  }

  delete = async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE id = ?`
    const result = await query(sql, [id])
    const affectedRows = result ? result.affectedRows : 0

    return affectedRows
  }
}

module.exports = new DB()
