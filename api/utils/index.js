exports.multipleColumnSet = (object) => {
  if (typeof object !== 'object') {
    throw new TypeError('Неверный тип ввода')
  }

  const keys = Object.keys(object)
  const values = Object.values(object)

  const columnSet = keys.map(key => `${key} = ?`).join(', ')

  return { columnSet, values }
}
