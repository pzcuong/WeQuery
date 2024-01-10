const QueryService = require("../../query/query.service");

class QuestionModel {
  constructor() {
    this.queryService = new QueryService();
  }

  LayCauHoi = async (MaCH) => {
    let SQLQuery = `SELECT TieuDe, MucDo, NoiDung, LuocDo, Input
              FROM dbo.Admin_CauHoi LEFT JOIN dbo.Admin_TestCase ON Admin_TestCase.MaCH = Admin_CauHoi.MaCH
              WHERE Admin_CauHoi.MaCH = '${MaCH}'`;

    return await this.queryService.query(SQLQuery);
  };

  ThemCauHoi = async (data) => {
    let SQLQuery = `insert into Admin_CauHoi (MucDo, TieuDe, NoiDung, LuocDo, TinhTrang, InputData) 
              OUTPUT INSERTED.MaCH
              values (N'${data.MucDo}', N'${data.TieuDe}', N'${data.NoiDung}', N'${data.LuocDo}', '${data.TinhTrang}', '${data.InputData}')`;
    let insertedData = await this.queryService.query(SQLQuery);

    return await this.ThemTestCase(insertedData.MaCH, data.SQLQuery);
  };

  ThemTestCase = async (MaCH, SQLQuery) => {
    let queryData = await this.queryService.query(SQLQuery);
    if (!queryData) return null;

    SQLQuery = SQLQuery.replace(/'/g, '"');
    let insertSQLQuery = `insert into Admin_TestCase (MaCH, Input, Output) 
              values ('${MaCH}', '${SQLQuery}', '${JSON.stringify(
      queryData
    )}')`;

    return await this.queryService.query(insertSQLQuery);
  };

  KiemThuTestCase = async (SQLQuery) => {
    return await this.queryService.query(SQLQuery);
  };

  SuaTestCase = async (MaCH, SQLQuery) => {
    let queryData = await this.queryService.query(SQLQuery);
    if (!queryData) return null;

    SQLQuery = SQLQuery.replace(/'/g, '"');

    let updateSQLQuery = `update Admin_TestCase 
              set Input = '${SQLQuery}', Output = '${JSON.stringify(
      queryData
    )}' where MaCH = '${MaCH}'`;

    return await this.queryService.query(updateSQLQuery);
  };

  TaoQuanHe = async (SQLSchema) => {
    let result = await this.queryService.query(SQLSchema);
    return result;
  };

  ChinhSuaCauHoi = async (MaCH, data) => {
    let SQLQuery = `update Admin_CauHoi 
              set LuocDo =  N'${data.LuocDo}', InputData = N'${data.InputData}', MucDo = N'${data.MucDo}', TieuDe = N'${data.TieuDe}', NoiDung = N'${data.NoiDung}', TinhTrang = '${data.TinhTrang}'
              where MaCH = '${MaCH}'`;

    const updateResult = await this.queryService.query(SQLQuery);
    const updateTestCase = await this.SuaTestCase(MaCH, data.SQLQuery);

    return { updateResult, updateTestCase };
  };

  DanhSachCauHoi = async () => {
    let SQLQuery = `SELECT * FROM dbo.Admin_CauHoi`;
    let result = await this.queryService.query(SQLQuery);
    return result;
  };

  BangXepHang = async (MaBT) => {
    let SQLQuery = `SELECT Admin_Users.username, fullname, KQ.KetQua, Admin_BaiTapCauHoi.MaCH, MaBT
          FROM dbo.Admin_ThanhVienNhom INNER JOIN dbo.Admin_Users ON Admin_Users.username = Admin_ThanhVienNhom.Username LEFT JOIN (
              SELECT Username, MAX(KetQua) AS KetQua, MaCH
              FROM dbo.Admin_SQLSubmitHistory
              GROUP BY Username, MaCH) KQ ON KQ.Username = Admin_Users.username LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaCH = KQ.MaCH
          WHERE MaBT = N'${MaBT}'
          ORDER BY Admin_BaiTapCauHoi.MaCH ASC`;
    let result = await this.queryService.query(SQLQuery);
    let user = {};
    let dsCH = [];
    for (let i = 0; i < result?.length; i++)
      if (!dsCH.includes(result[i].MaCH)) dsCH.push(result[i].MaCH);

    for (let i = 0; i < result?.length; i++) {
      if (!user[result[i].username]) user[result[i].username] = [];

      user[result[i].username].push({
        username: result[i].username,
        fullname: result[i].fullname,
        MaCH: result[i].MaCH,
        KetQua: result[i].KetQua,
      });
    }
    let data = {
      dsCH: dsCH,
      user: user,
    };
    return data;
  };

  XoaCauHoi = async (MaCH) => {
    let SQLQuery = `DELETE FROM Admin_CauHoi WHERE MaCH = '${MaCH}'`;
    let result = await this.queryService.query(SQLQuery);
    return result;
  };
}

module.exports = QuestionModel;
