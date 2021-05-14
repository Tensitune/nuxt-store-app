const { validationResult } = require('express-validator')

exports.multipleColumns = (object, usingCommas = true) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип параметра, должен быть объект')
  }

  const keys = Object.keys(object)
  let values = Object.values(object)

  const columns = keys.map(key => {
    if (!usingCommas && typeof object[key] === 'object') {
      const tempKeys = Object.keys(object[key])
      const tempValues = Object.values(object[key])

      let tempColumns = ''
      for (let i = 0; i < tempKeys.length; i++) {
        const k = tempKeys[i]
        const value = tempValues[i]

        if (k === 'greaterThan') tempColumns += `${key} > ${value}`
        else if (k === 'lessThan') tempColumns += `${key} < ${value}`
        else tempColumns += `${key} = ${value}`

        if (i < tempKeys.length - 1) {
          tempColumns += ' AND '
        }
      }

      values = values.filter(value => value !== object[key])
      return tempColumns
    }

    return `${key} = ?`
  }).join(`${usingCommas ? ', ' : ' AND '}`)

  return { columns, values }
}

exports.validationResult = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return errors.array()[0]
  }

  return false
}
