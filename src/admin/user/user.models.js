const QueryService = require("../../query/query.service");
const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

class UserModel {
  constructor() {
    this.queryService = new QueryService();
  }

  DanhSachSinhVien = async () => {
    let SQLQuery = `SELECT * FROM Admin_Users FULL JOIN dbo.Admin_ThanhVienNhom ON Admin_ThanhVienNhom.Username = Admin_Users.username`;
    return await this.queryService.query(SQLQuery);
  };

  ThemSinhVien = async (data) => {
    const hashPassword = bcrypt.hashSync(data.password, SALT_ROUNDS);

    let SQLQuery = `BEGIN
      INSERT INTO Admin_Users (username, rawpassword, password, fullname, email, role, phoneNumber, SinhNhat) 
      VALUES (@username, @password, @hashPassword, @fullname, @email, 'SinhVien', @phoneNumber, @SinhNhat);
  
      INSERT INTO Admin_ThanhVienNhom (Username, MaNhom) VALUES (@username, @MaNhom);
    END`;

    let parameters = {
      username: data.username,
      password: data.password,
      hashPassword: hashPassword,
      fullname: data.fullname,
      email: data.email,
      phoneNumber: data.phoneNumber,
      SinhNhat: data.SinhNhat,
      MaNhom: data.MaNhom,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };

  SuaThongTinSinhVien = async (data) => {
    const hashPassword = bcrypt.hashSync(data.password, SALT_ROUNDS);

    let SQLQuery = `UPDATE Admin_Users 
        SET fullname = @fullname, 
            email = @email, 
            phoneNumber = @phoneNumber, 
            SinhNhat = @SinhNhat,
            password = ISNULL(@password, password),
            rawpassword = ISNULL(@rawpassword, rawpassword)
        WHERE username = @username

        IF @MaNhom IS NOT NULL
        BEGIN
            MERGE Admin_ThanhVienNhom AS target
            USING (SELECT @username AS username, @MaNhom AS MaNhom) AS source
            ON (target.username = source.username)
            WHEN MATCHED THEN 
                UPDATE SET MaNhom = source.MaNhom
            WHEN NOT MATCHED THEN 
                INSERT (username, MaNhom) 
                VALUES (source.username, source.MaNhom);
        END`;

    let parameters = {
      fullname: data.fullname,
      SinhNhat: data.SinhNhat,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashPassword,
      rawpassword: data.rawpassword,
      username: data.username,
      MaNhom: data.MaNhom,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };
}

module.exports = UserModel;
