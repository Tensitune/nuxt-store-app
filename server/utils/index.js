module.exports.DBError = (res, err) => {
  res.status(500).json({ status: 'error', error: 'Что-то пошло не так' })
  console.error(err)
}
