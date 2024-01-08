const QueryService = require("../../query/query.service");
const NodeCache = require("node-cache");

class UserInfo {
  constructor() {
    this.queryService = new QueryService();
    this.myCache = new NodeCache({ stdTTL: 100, checkperiod: 60 });
  }

  getUser = async (username) => {
    return await this.queryService.query(
      `select * from Admin_Users where username = @username`,
      { username },
      "Admin"
    );
  };

  changeInfoUser = async (username, data) => {
    let SQLQuery = `update Admin_Users set fullname = @fullname, SinhNhat = @SinhNhat, email = @email, phoneNumber = @phoneNumber where username = @username`;

    let parameters = {
      fullname: data.fullname,
      SinhNhat: data.SinhNhat,
      email: data.email,
      phoneNumber: data.phoneNumber,
      username: username,
    };

    let result = await this.queryService.query(SQLQuery, parameters);
    this.myCache.del(username + ":InfoUser");
    return result;
  };

  updatePassword = async (username, hashPassword, rawpassword) => {
    let SQLQuery = `update Admin_Users set password = @hashPassword, rawpassword = @rawpassword where username = @username`;

    let parameters = {
      hashPassword: hashPassword,
      rawpassword: rawpassword,
      username: username,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };

  updateRefreshToken = async (username, hashPassword, refreshToken) => {
    let SQLQuery = `UPDATE Admin_Users 
              SET password = @hashPassword, refreshToken = @refreshToken 
              WHERE username = @username`;

    let parameters = {
      hashPassword: hashPassword,
      refreshToken: refreshToken,
      username: username,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };

  createUser = async (data) => {
    let SQLQuery = `insert into Admin_Users
    (username, fullname, rawpassword, password, refreshToken, email, phoneNumber, role)
    values (@username, @fullname, @rawpassword, @password, @refreshToken, @email, @phoneNumber, @role)`;

    let parameters = {
      username: data.username,
      fullname: data.fullname,
      rawpassword: data.rawpassword,
      password: data.password,
      refreshToken: data.refreshToken,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };
}

module.exports = UserInfo;
