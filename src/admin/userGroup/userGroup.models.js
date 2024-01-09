const QueryService = require("../../query/query.service");

class UserGroupModel {
  constructor() {
    this.queryService = new QueryService();
  }

  DanhSachNhom = async () => {
    let SQLQuery = `SELECT Admin_Nhom.MaNhom, TenNhom, COUNT(username) AS SoLuong FROM Admin_Nhom FULL JOIN dbo.Admin_ThanhVienNhom ON Admin_ThanhVienNhom.MaNhom = Admin_Nhom.MaNhom GROUP BY Admin_Nhom.MaNhom, Admin_Nhom.TenNhom`;
    let result = await this.queryService.query(SQLQuery);
    return result;
  };

  ThemNhom = async (data) => {
    let SQLQuery = `insert into Admin_Nhom (MaNhom, TenNhom) values (N'${data.MaNhom}', N'${data.TenNhom}')`;
    let result = await this.queryService.query(SQLQuery);
    return result;
  };
}

module.exports = UserGroupModel;
