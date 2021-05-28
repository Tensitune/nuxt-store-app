module.exports = (api, app) => {
  const User = app.db.models.User;

  api.get("/users/:userId", async (req, res) => {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.json(null);

    res.json({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      isAdmin: user.isAdmin
    });
  });
};
