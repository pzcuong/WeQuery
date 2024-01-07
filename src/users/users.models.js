// const sql = require("mssql");
// const fs = require("fs");
// // const stringComparison = require("string-comparison");
// var stringSimilarity = require("string-similarity");

// const _ = require("lodash");

// require("dotenv").config();

// async function createUser(data) {
//   try {
//     let SQLQuery = `insert into Admin_Users
//     (username, fullname, rawpassword, password, refreshToken, email, phoneNumber, role)
//     values (@username, @fullname, @rawpassword, @password, @refreshToken, @email, @phoneNumber, @role)`;

//     let parameters = {
//       username: data.username,
//       fullname: data.fullname,
//       rawpassword: data.rawpassword,
//       password: data.password,
//       refreshToken: data.refreshToken,
//       email: data.email,
//       phoneNumber: data.phoneNumber,
//       role: data.role,
//     };

//     let result = await QueryService.TruyVan(SQLQuery, parameters, "Admin");
//     return {
//       statusCode: 200,
//       message: "Thành công",
//       result: result.result.rowsAffected[0],
//     };
//   } catch (err) {
//     GhiLog(`Lỗi createUser - ${err}`);

//     return {
//       statusCode: 500,
//       message: "Lỗi hệ thống!",
//       alert: "Lỗi hệ thống",
//     };
//   }
// }

// async function updateRefreshToken(username, refreshToken) {
//   await sql.connect(configAdmin);
//   const request = await new sql.Request();
//   const result =
//     await request.query`update Admin_Users set refreshToken = ${refreshToken} where username = ${username}`;
//   await sql.close();
//   return result.rowsAffected[0];
// }

// async function getInfoUser(username) {
//   try {
//     let userCache = username + ":InfoUser";
//     let value = myCache.get(userCache);
//     if (value == undefined) {
//       if (
//         username == undefined ||
//         username.indexOf(" ") > -1 ||
//         username.indexOf("@") > -1 ||
//         username.indexOf(".") > -1
//       )
//         return {
//           statusCode: 400,
//           message: "Username không hợp lệ!",
//           alert: "Username không hợp lệ!",
//         };
//       else {
//         let SQLQuery = `
//                     SELECT Admin_Users.username, fullname, SinhNhat, email, phoneNumber, role, MaNhom
//                     FROM Admin_Users FULL JOIN dbo.Admin_ThanhVienNhom ON Admin_ThanhVienNhom.Username = Admin_Users.username
//                     WHERE Admin_Users.username = '${username}'
//                 `;
//         let result = await TruyVan("Admin", SQLQuery);
//         myCache.set(userCache, result.result.recordset, 1800);
//         console.log(result);

//         if (result.statusCode == 200)
//           return {
//             statusCode: 200,
//             message: "Thành công",
//             result: result.result.recordset[0],
//             table: result.result.recordset,
//           };
//         else
//           return {
//             statusCode: 404,
//             message: "Không tìm thấy user",
//             alert: "Không tìm thấy user",
//           };
//       }
//     } else {
//       console.log("Lấy thông tin user từ cache");
//       return {
//         statusCode: 200,
//         message: "Thành công",
//         result: value[0],
//         table: value,
//       };
//     }
//   } catch (err) {
//     console.log("Lỗi getInfoUser (users.models)", err);
//     GhiLog(`Lỗi getInfoUser - ${err}`);

//     return {
//       statusCode: 500,
//       message: "Lỗi hệ thống!",
//       alert: "Lỗi hệ thống",
//     };
//   }
// }

// exports.createUser = createUser;
// exports.updateRefreshToken = updateRefreshToken;
// exports.getInfoUser = getInfoUser;

// async function LayLichSuTruyVan(user) {
//   try {
//     let CauHoi = await LayDanhSachCauHoi(user.username);
//     /* return của CauHoi:
//         statusCode: 200,
//         message: [
//             {
//                 MaCH: 1,
//                 MucDo, TieuDe, NoiDung, LuocDo
//             },
//             ...
//         ] */
//     if (CauHoi.statusCode == 200) {
//       /* return của LichSu:
//             statusCode: 200,
//             message: {
//                 MaCH: [
//                     {}, {}, {} ... // Các lịch sử truy vấn của câu hỏi
//                 ],
//                 ...
//             } */
//       let response = {
//         statusCode: 200,
//         message: {},
//       };

//       for (let MaCH of CauHoi.message[0]) {
//         //console.log(MaCH);
//         let SQLQuery = `select * from Admin_SQLSubmitHistory where MaCH = ${MaCH.MaCH} and username = '${user.username}'`;
//         let LichSu = await TruyVan("Admin", SQLQuery);
//         if (LichSu.statusCode == 200 && LichSu.result.recordset.length > 0) {
//           response.message[MaCH.MaCH] = LichSu.result.recordset;
//           response.message[MaCH.MaCH]["TieuDe"] = MaCH.TieuDe;
//           response.message[MaCH.MaCH]["MucDo"] = MaCH.MucDo;
//           response.message[MaCH.MaCH]["MaCH"] = MaCH.MaCH;
//         }
//       }

//       return response;
//     } else
//       return {
//         statusCode: 404,
//         message: "Lấy thông tin câu hỏi thất bại",
//         alert: "Lấy thông tin câu hỏi thất bại",
//       };
//   } catch (err) {
//     console.log("Lỗi LayLichSuTruyVan (users.models)", err);
//     GhiLog(`Lỗi LayLichSuTruyVan - ${err}`);

//     return {
//       statusCode: 500,
//       message: "Lỗi truy vấn SQL!",
//       alert: "Lỗi khi lấy lịch sử truy vấn",
//     };
//   }
// }

// exports.LayLichSuTruyVan = LayLichSuTruyVan;

// const spreadsheet = require("../spreadsheets/spreadsheets.models");
// const QueryService = require("../query/query.service");
