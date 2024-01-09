// const sql = require("mssql");
// var fs = require("fs");
// var json2html = require("json2html");
// require("dotenv").config();
// const bcrypt = require("bcryptjs");

// const configAdmin = {
//   user: process.env.ADMIN_SERVER_ACCOUNT,
//   password: process.env.PASSWORD,
//   server: process.env.SERVER,
//   database: process.env.DATABASE_NAME,
//   port: 1433,
// };

// async function XuLySQL(SQLQuery) {
//   SQLQuery = SQLQuery.toLowerCase();
//   try {
//     const result = await TruyVan(SQLQuery);
//     console.log(result.result.recordset);
//     return {
//       statusCode: result.statusCode,
//       message: "Thành công",
//       result: result.result.recordset,
//       html: json2html.render(result.result.recordset),
//     };
//   } catch (err) {
//     console.log(err);
//     return {
//       statusCode: 400,
//       message: "Lỗi truy vấn SQL!",
//       alert: "Kiểm tra lại câu lệnh SQL!",
//     };
//   }
// }

// exports.DanhSachNhom = DanhSachNhom;

// exports.XuLySQL = XuLySQL;

//  exports.ThemNhom = ThemNhom;

// async function TruyVan(SQLQuery) {
//   try {
//     let pool = await new sql.ConnectionPool(configAdmin);
//     let result = await pool.connect();
//     let queryResult = await result.query(SQLQuery);
//     await pool.close();
//     return {
//       statusCode: 200,
//       user: "Admin",
//       message: "Thành công",
//       result: queryResult,
//     };
//   } catch (err) {
//     console.log("Lỗi TruyVan (admin.models)", SQLQuery, err);
//     GhiLog(`Lỗi truy vấn SQL - ${SQLQuery}\t${err}`);

//     return {
//       statusCode: 500,
//       message: "Lỗi truy vấn SQL!",
//     };
//   }
// }
