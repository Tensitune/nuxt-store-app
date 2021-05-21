const { multipleColumnSet, multipleColumnWhere } = require('./columns')
const query = require('./connection')

class DB {
  count = async (table, params = {}) => {
    let sql = `SELECT COUNT(id) as count FROM ${table} USE INDEX (PRIMARY)`

    let result
    if (Object.keys(params).length) {
      const { columns, values } = multipleColumnWhere(params)
      sql = `SELECT COUNT(id) as count FROM ${table} WHERE ${columns}`

      result = await query(sql, [...values])
      return result[0].count
    }

    result = await query(sql)
    return result[0].count
  }

  find = async (table, params = {}, order = {}) => {
    let sql = `SELECT * FROM ${table}`

    if (!Object.keys(params).length) {
      if (order.by) sql += ` ORDER BY ${order.by} ${order.desc ? ' DESC' : ' ASC'}`
      return await query(sql)
    }

    const { columns, values } = multipleColumnWhere(params)

    sql += ` WHERE ${columns}`
    if (order.by) sql += ` ORDER BY ${order.by} ${order.desc ? ' DESC' : ' ASC'}`

    return await query(sql, [...values])
  }

  findOne = async (table, params, order = {}) => {
    const { columns, values } = multipleColumnWhere(params)

    let sql = `SELECT * FROM ${table} WHERE ${columns}`
    if (order.by) sql += ` ORDER BY ${order.by} ${order.desc ? ' DESC' : ' ASC'}`

    const result = await query(sql, [...values])
    return result[0]
  }

  getPagedRows = async (table, page = 1, perPage = 20, params = {}, order = {}) => {
    let sql = `SELECT * FROM ${table}`
    if (order.by) sql += ` ORDER BY ${order.by} ${order.desc ? ' DESC' : ' ASC'}`
    sql += ` LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`

    if (Object.keys(params).length) {
      const { columns, values } = multipleColumnWhere(params)

      sql = `SELECT * FROM ${table} WHERE ${columns}`
      if (order.by) sql += ` ORDER BY ${order.by} ${order.desc ? ' DESC' : ' ASC'}`
      sql += ` LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`

      return await query(sql, [...values])
    }

    return await query(sql)
  }

  insert = async (table, params) => {
    const { columns, values } = multipleColumnSet(params)
    const sql = `INSERT INTO ${table} SET ${columns}`
    const result = await query(sql, [...values])
    const insertId = result ? result.insertId : false

    return insertId
  }

  update = async (table, id, params) => {
    const { columns, values } = multipleColumnSet(params)
    const sql = `UPDATE ${table} SET ${columns} WHERE id = ?`
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
