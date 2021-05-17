const db = require('../db')

module.exports = exports = async (table, params, query, order = {}) => {
  let result

  if (query.page) {
    result = await db.getPagedRows(table, query.page, query.perPage, params, order)
  } else if (query.getAll) {
    result = await db.find(table, params, order)
  } else {
    result = await db.count(table, params)
  }

  return result
}
