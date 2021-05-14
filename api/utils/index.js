const { validationResult } = require('express-validator')

exports.multipleColumns = (object, usingCommas = true) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип параметра, должен быть объект')
  }

  const keys = Object.keys(object)
  const values = Object.values(object)

  const columns = keys.map(key => `${key} = ?`).join(`${usingCommas ? ', ' : ' AND '}`)
  return { columns, values }
}

exports.validationResult = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errors.array()[0]
  }

  return false
}
