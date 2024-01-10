const QueryService = require("../../query/query.service");
const ConvertSQLQuery = require("../../common/query.convert");

class QuestionModel {
  constructor() {
    this.queryService = new QueryService();
    this.convertQuery = new ConvertSQLQuery();
  }

  LayCauHoi = async (MaCH) => {
    let SQLQuery = `SELECT TieuDe, MucDo, NoiDung, LuocDo, Input, InputData, RandomString
              FROM dbo.Admin_CauHoi LEFT JOIN dbo.Admin_TestCase ON Admin_TestCase.MaCH = Admin_CauHoi.MaCH
              WHERE Admin_CauHoi.MaCH = '${MaCH}'`;

    return await this.queryService.query(SQLQuery);
  };

  ThemCauHoi = async (data) => {
    let InputData = data.InputData.replace(/'/g, '"');

    let SQLQuery = `INSERT INTO Admin_CauHoi (MucDo, TieuDe, NoiDung, LuocDo, TinhTrang, InputData, RandomString) 
    OUTPUT INSERTED.MaCH
    VALUES (@MucDo, @TieuDe, @NoiDung, @LuocDo, @TinhTrang, @InputData, @RandomString)`;

    let parameters = {
      MucDo: data.MucDo,
      TieuDe: data.TieuDe,
      NoiDung: data.NoiDung,
      LuocDo: data.LuocDo,
      TinhTrang: data.TinhTrang ? "1" : "0",
      InputData: InputData,
      RandomString: data.randomString,
    };

    let insertedData = await this.queryService.query(SQLQuery, parameters);

    data.MaCH = insertedData.MaCH;
    if (!insertedData) throw new Error("Thêm câu hỏi thất bại");

    await this.ThemTestCase(data);

    return insertedData;
  };

  ThemTestCase = async (data) => {
    const KiemThuTestCase = await this.KiemThuTestCase(data);

    let SQLQuery = data.SQLQuery.replace(/'/g, '"');
    let insertSQLQuery = `insert into Admin_TestCase (MaCH, Input, Output) 
      values ('${data.MaCH}', '${SQLQuery}', '${JSON.stringify(
      KiemThuTestCase
    )}')`;

    return await this.queryService.query(insertSQLQuery);
  };

  KiemThuTestCase = async (data) => {
    let SQLQuery = this.convertQuery.convertSQLQuery(
      data.randomString,
      data.SQLQuery
    );

    return await this.queryService.query(SQLQuery);
  };

  SuaTestCase = async (data) => {
    const KiemThuTestCase = await this.KiemThuTestCase(data);

    let SQLQuery = data.SQLQuery.replace(/'/g, '"');

    let updateSQLQuery = `update Admin_TestCase 
              set Input = '${SQLQuery}', Output = '${JSON.stringify(
      KiemThuTestCase
    )}' where MaCH = '${data.MaCH}'`;

    return await this.queryService.query(updateSQLQuery);
  };

  TaoQuanHe = async (data) => {
    let SQLSchema = this.convertQuery.convertSQLQuery(
      data.randomString,
      data.SQLSchema
    );
    let result = await this.queryService.query(SQLSchema);
    return result;
  };

  ChinhSuaCauHoi = async (MaCH, data) => {
    let SQLQuery = `update Admin_CauHoi 
              set LuocDo =  N'${data.LuocDo}', InputData = N'${data.InputData}', MucDo = N'${data.MucDo}', TieuDe = N'${data.TieuDe}', NoiDung = N'${data.NoiDung}', TinhTrang = '${data.TinhTrang}'
              where MaCH = '${MaCH}'`;

    const updateResult = await this.queryService.query(SQLQuery);
    const updateTestCase = await this.SuaTestCase(data);

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
