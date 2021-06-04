module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Order",
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.User,
          key: "id"
        }
      },
      status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
      },
      cartItems: DataTypes.JSON,
      deliveryAddress: DataTypes.STRING
    },
    { timestamps: false }
  );
};
