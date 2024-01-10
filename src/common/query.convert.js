class ConvertSQLQuery {
  constructor() {}

  convertSQLQuery = (randomString, SQLQuery) => {
    if (!SQLQuery) throw new Error("SQLQuery is null");

    SQLQuery = SQLQuery.toLowerCase();

    const regex =
      /\b(FROM|JOIN|INTO|UPDATE|DELETE FROM|CREATE TABLE)\s+(\w+)\b/gi;

    const convertedQuery = SQLQuery.replace(regex, (match, p1, p2) => {
      const tableName = p2;
      const uniqueTableName = `${tableName}_${randomString}`;
      return match.replace(tableName, uniqueTableName);
    });

    return convertedQuery;
  };
}

module.exports = ConvertSQLQuery;
