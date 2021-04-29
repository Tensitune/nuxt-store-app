const { validationResult } = require('express-validator')

exports.multipleColumnSet = (object) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип ввода')
  }

  const keys = Object.keys(object)
  const values = Object.values(object)

  const columnSet = keys.map(key => `${key} = ?`).join(', ')

  return { columnSet, values }
}

exports.validationResult = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errors.array()[0]
  }

  return false
}
