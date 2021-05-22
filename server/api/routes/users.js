module.exports = (api, app) => {
  api.get("/users/:userId", async (req, res) => {
    const user = await app.db.findOne("users", { id: req.params.userId });

    const data = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      admin: user.admin
    };

    res.json({ status: "success", data });
  });
};
