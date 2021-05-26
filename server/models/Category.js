module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Category",
    {
      title: DataTypes.STRING(50),
      icon: DataTypes.STRING(25)
    },
    { timestamps: false }
  );
};
