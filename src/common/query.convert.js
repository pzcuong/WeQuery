class ConvertSQLQuery {
  constructor() {}

  convertSQLQuery = async (MaCH, SQLQuery) => {
    const regex = /\bFROM\s+(\w+)|JOIN\s+(\w+)\b/gi;

    const convertedQuery = SQLQuery.replace(regex, (match, p1, p2) => {
      const tableName = p1 || p2;
      const uniqueTableName = `${tableName}_${MaCH}`;
      return match.replace(tableName, uniqueTableName);
    });

    return convertedQuery;
  };
}

module.exports = new ConvertSQLQuery();
