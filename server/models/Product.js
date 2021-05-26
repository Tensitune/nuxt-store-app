module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Product",
    {
      categoryId: {
        type: DataTypes.INTEGER,
        references: {
          model: sequelize.models.Category,
          key: "id"
        }
      },
      title: DataTypes.STRING(80),
      description: DataTypes.TEXT,
      price: DataTypes.INTEGER,
      stock: DataTypes.INTEGER,
      thumbnail: DataTypes.STRING,
      isRecommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    { timestamps: false }
  );
};
