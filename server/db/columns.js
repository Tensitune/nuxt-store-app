exports.multipleColumnSet = (object) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип параметра, должен быть объект')
  }

  const keys = Object.keys(object)
  const values = Object.values(object)

  const columns = keys.map(key => `${key} = ?`).join(', ')

  return { columns, values }
}

exports.multipleColumnWhere = (object) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип параметра, должен быть объект')
  }

  const keys = Object.keys(object)
  let values = Object.values(object)

  const columns = keys.map(key => {
    if (typeof object[key] === 'object') {
      const tempKeys = Object.keys(object[key])
      const tempValues = Object.values(object[key])

      let tempColumns = ''
      for (let i = 0; i < tempKeys.length; i++) {
        const k = tempKeys[i]
        const value = tempValues[i]

        let keyFound = true
        switch (k) {
          case 'greaterThan':
            tempColumns += `${key} > ${value}`
            break
          case 'lessThan':
            tempColumns += `${key} < ${value}`
            break
          case 'like':
            tempColumns += `${key} LIKE '%${value}%'`
            break
          default:
            keyFound = false
            break
        }

        if (keyFound && (i < tempKeys.length - 1)) {
          tempColumns += ' AND '
        }
      }

      values = values.filter(value => value !== object[key])
      return tempColumns
    }

    return `${key} = ?`
  }).join(' AND ')

  return { columns, values }
}
