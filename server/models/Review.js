module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Review",
    {
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Product,
          key: "id"
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.User,
          key: "id"
        }
      },
      rating: DataTypes.FLOAT(2, 1),
      text: DataTypes.TEXT,
      publishedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    { timestamps: false }
  );
};
