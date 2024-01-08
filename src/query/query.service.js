const sql = require("mssql");
const _ = require("lodash");
const stringSimilarity = require("string-similarity");

function createConfig(user, password) {
  return {
    user: process.env[user],
    password: process.env[password],
    server: process.env.SERVER,
    database: process.env.DATABASE_NAME,
    port: 1433,
  };
}

class QueryService {
  constructor() {
    this.configAdmin = createConfig("ADMIN_SERVER_ACCOUNT", "PASSWORD");
    this.configUser = createConfig("USER_SERVER_ACCOUNT", "PASSWORD");

    this.poolAdmin = new sql.ConnectionPool(this.configAdmin);
    this.poolUser = new sql.ConnectionPool(this.configUser);
  }

  query = async (query, parameters, TypeUser = "Admin") => {
    try {
      let pool = TypeUser == "Admin" ? this.poolAdmin : this.poolUser;
      await pool.connect();

      let request = new sql.Request(pool);

      if (!parameters) parameters = {};
      for (let name in parameters)
        request.input(name, sql.NVarChar, parameters[name]);

      let queryResult = await request.query(query);

      return (
        (queryResult.recordset &&
          queryResult.recordset.length &&
          (queryResult.recordset.length === 1
            ? queryResult.recordset[0]
            : queryResult.recordset)) ||
        (queryResult.rowsAffected[0] ? true : null)
      );
    } catch (err) {
      return null;
    }
  };

  testQuery = async (MaCH, SQLQueryClient, user) => {
    SQLQueryClient = SQLQueryClient.toLowerCase();

    let resultClient = await this.query(SQLQueryClient, null, "User");
    const resultOutput = await this.getOutput(MaCH);

    let comparePercent =
      stringSimilarity.compareTwoStrings(
        JSON.stringify(resultClient),
        resultOutput.Output
      ) * 100;

    await this.LuuKetQuaTruyVan(
      user.username,
      MaCH,
      SQLQueryClient,
      comparePercent
    );
    return comparePercent;
  };

  getOutput = async (MaCH) => {
    let SQLQuery = `select Output from Admin_TestCase where MaCH = ${MaCH}`;
    console.log(SQLQuery);
    return await this.query(SQLQuery);
  };

  LuuKetQuaTruyVan = async (Username, MaCH, SQLQuery, KetQua) => {
    let sql = `GETDATE() AT TIME ZONE 'N. Central Asia Standard Time'`;
    SQLQuery = SQLQuery.replace(/'/g, '"');

    let SQLQueryInsert = `insert into Admin_SQLSubmitHistory(Username, MaCH, SQLQuery, KetQua, ThoiGian) 
            values(N'${Username}', ${MaCH}, N'${SQLQuery}', N'${KetQua}', ${sql})`;

    let queryResult = await this.query(SQLQueryInsert);

    return queryResult;
  };
}

module.exports = QueryService;
