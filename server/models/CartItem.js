module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "CartItem",
    {
      cartId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Cart,
          key: "id"
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Product,
          key: "id"
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      }
    },
    { timestamps: false }
  );
};
