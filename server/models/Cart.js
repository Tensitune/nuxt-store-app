module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Cart",
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.User,
          key: "id"
        }
      }
    },
    { timestamps: false }
  );
};
