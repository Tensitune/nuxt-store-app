const mapKeys = require("lodash.mapkeys");
const snakeCase = require("lodash.snakecase");

// Преобразование camelCase ключей в snake_case у объекта
function camelToSnake(obj) {
  return mapKeys(obj, (_, k) => snakeCase(k));
}

exports.multipleColumnSet = (obj) => {
  if (typeof obj !== "object") {
    throw new TypeError("Неверный тип параметра, должен быть объект");
  }

  obj = camelToSnake(obj);

  const keys = Object.keys(obj);
  const values = Object.values(obj);

  const columns = keys.map(key => `${key} = ?`).join(", ");

  return { columns, values };
};

exports.multipleColumnWhere = (obj) => {
  if (typeof obj !== "object") {
    throw new TypeError("Неверный тип параметра, должен быть объект");
  }

  obj = camelToSnake(obj);

  const keys = Object.keys(obj);
  let values = Object.values(obj);

  const columns = keys.map(key => {
    if (typeof obj[key] === "object") {
      const tempKeys = Object.keys(obj[key]);
      const tempValues = Object.values(obj[key]);

      let tempColumns = "";
      for (let i = 0; i < tempKeys.length; i++) {
        const k = tempKeys[i];
        const value = tempValues[i];

        let keyFound = true;
        switch (k) {
          case "greaterThan":
            tempColumns += `${key} > ${value}`;
            break;
          case "lessThan":
            tempColumns += `${key} < ${value}`;
            break;
          case "like":
            tempColumns += `${key} LIKE '%${value}%'`;
            break;
          default:
            keyFound = false;
            break;
        }

        if (keyFound && (i < tempKeys.length - 1)) {
          tempColumns += " AND ";
        }
      }

      values = values.filter(value => value !== obj[key]);
      return tempColumns;
    }

    return `${key} = ?`;
  }).join(" AND ");

  return { columns, values };
};
