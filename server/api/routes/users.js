module.exports = (api, app) => {
  api.get('/users/:userId', async (req, res) => {
    const user = await app.db.findOne('users', { id: req.params.userId })
    res.json({ status: 'success', data: user })
  })
}
