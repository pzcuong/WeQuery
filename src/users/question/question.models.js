const QueryService = require("../../query/query.service");
const NodeCache = require("node-cache");

class QuestionInfo {
  constructor() {
    this.queryService = new QueryService();
    this.myCache = new NodeCache({ stdTTL: 100, checkperiod: 60 });
  }

  LayCauHoi = async (MaCH, user) => {
    let SQLQuery = `SELECT CH.MaCH, CH.MucDo, CH.TieuDe, CH.NoiDung, CH.LuocDo
              FROM Admin_CauHoi CH
              WHERE CH.MaCH = @MaCH AND CH.TinhTrang = 1`;

    let parameters = { MaCH };
    let result = await this.queryService.query(SQLQuery, parameters);

    if (result) {
      let schema = {};

      const regex = /([A-Z])\w+/g;
      const LuocDo = result.LuocDo.match(regex);

      let SQLQuery = `
              SELECT LS.SQLQuery, LS.KetQua, LS.ThoiGian
              FROM dbo.Admin_SQLSubmitHistory LS
              WHERE (Username = @username OR Username IS NULL) AND LS.MaCH = @MaCH
              ORDER BY LS.ThoiGian DESC`;

      let parameters = { username: user.username, MaCH };
      let historyResult = await this.queryService.query(SQLQuery, parameters);

      if (LuocDo != null)
        for (let i = 0; i < LuocDo.length; i++) schema[i] = LuocDo[i];

      return {
        message: result,
        schemas: schema,
        history: historyResult,
      };
    } else
      return {
        message: "Câu hỏi không tồn tại",
      };
  };

  LayDanhSachCauHoi = async (user) => {
    let SQLQuery = `SELECT CH.MaCH, KQ.KetQua, CH.MucDo, CH.TieuDe, CH.LuocDo
              FROM (SELECT DISTINCT LS.MaCH, LS.Username, LS.KetQua
                  FROM Admin_SQLSubmitHistory LS
                  WHERE LS.KetQua = N'100' AND LS.Username = @username) KQ RIGHT JOIN Admin_CauHoi CH ON CH.MaCH = KQ.MaCH
              WHERE CH.TinhTrang = 1`;

    let parameters = { username: user.username };

    return await this.queryService.query(SQLQuery, parameters);
  };

  LayDanhSachBaiTap = async (user) => {
    let SQLQuery = `
          SELECT BT.MaBT, BT.TieuDe, BT.TgianBD, BT.TgianKT, BT.TrangThai
          FROM Admin_BaiTapTheoNhom BTNhom INNER JOIN Admin_BaiTap BT ON BT.MaBT = BTNhom.MaBT
          WHERE TrangThai = '1' AND BTNhom.MaNhom IN (
              SELECT MaNhom
              FROM Admin_ThanhVienNhom
              WHERE Username = @username
          )`;

    let parameters = { username: user.username };

    return await this.queryService.query(SQLQuery, parameters);
  };

  LayNoiDungBaiTap = async (MaBT, MaCH, user) => {
    let userCache = user.MaNhom + "-BT:" + MaBT + "-CH:" + MaCH;
    let value = this.myCache.get(userCache);
    if (!value) {
      let SQLQuery = `SELECT DISTINCT CH.MaCH, CH.MucDo, CH.TieuDe, CH.NoiDung, CH.LuocDo, KQ.KetQua, BTCH.MaBT
              FROM (
                      SELECT MaCH, LS.KetQua, LS.SQLQuery, LS.ThoiGian
                      FROM Admin_SQLSubmitHistory LS 
                      WHERE LS.Username = N'${user.username}' AND LS.KetQua = N'100'
                  ) KQ RIGHT JOIN Admin_BaiTapCauHoi BTCH ON BTCH.MACH = KQ.MaCH INNER JOIN Admin_CauHoi CH ON CH.MaCH = BTCH.MACH 
              WHERE BTCH.MaBT IN (
                  SELECT BTN.MaBT
                  FROM Admin_BaiTapTheoNhom BTN INNER JOIN Admin_ThanhVienNhom TVN ON TVN.MaNhom = BTN.MaNhom
                  WHERE TVN.Username = N'${user.username}' AND BTN.MaBT = N'${MaBT}'
              )`;
      let result = await this.queryService.query(SQLQuery);

      if (result?.length) {
        let history;
        let currentQuestion = result.findIndex((item) => item.MaCH == MaCH);
        if (currentQuestion === -1) currentQuestion = 0;

        if (!result[currentQuestion]?.KetQua) history = null;
        else {
          let SQLQuery = `SELECT SQLQuery, KetQua, ThoiGian
                          FROM dbo.Admin_SQLSubmitHistory 
                          WHERE MaCH = N'${MaCH}' AND Username = N'${user.username}'
                          ORDER BY ThoiGian DESC`;
          let resultHistory = await this.queryService.query(SQLQuery);
          history = resultHistory;
        }
        let data = result[currentQuestion];
        let schema = {};

        const regex = /([A-Z])\w+/g;
        const LuocDo = data.LuocDo.match(regex);

        if (LuocDo)
          for (let i = 0; i < LuocDo.length; i++) schema[i] = LuocDo[i];

        this.myCache.set(
          userCache,
          {
            currentQuestion: result[currentQuestion],
            schemas: schema,
            anotherQuestion: result,
          },
          60 * 2
        );

        return {
          currentQuestion: result[currentQuestion],
          schemas: schema,
          history: history,
          anotherQuestion: result,
        };
      } else return null;
    } else {
      let SQLQuery = `SELECT SQLQuery, KetQua, ThoiGian
              FROM dbo.Admin_SQLSubmitHistory 
              WHERE MaCH = N'${MaCH}' AND Username = N'${user.username}'
              ORDER BY ThoiGian DESC`;
      let history = await this.queryService.query(SQLQuery);
      return {
        currentQuestion: value.currentQuestion,
        schemas: value.schemas,
        history: history,
        anotherQuestion: value.anotherQuestion,
      };
    }
  };

  GetOutputWithTime = async (MaBT, MaCH) => {
    let SQLQuery = `SELECT * 
              FROM Admin_TestCase TC INNER JOIN Admin_BaiTapCauHoi BTCH ON BTCH.MACH = TC.MaCH
              WHERE MaBT = N'${MaBT}' AND TC.MaCH = N'${MaCH}' AND BTCH.MaBT IN (
                  SELECT MaBT
                  FROM Admin_BaiTap
                  WHERE GETDATE() > TgianBD AND GETDATE() < TgianKT
              )`;
    let result = await this.queryService.query(SQLQuery);
    if (result)
      return {
        statusCode: 200,
        message: "Thành công",
        result: result,
      };
    else
      return {
        statusCode: 404,
        message: "Thời gian nộp bài không hợp lệ",
        alert: "Thời gian nộp bài không hợp lệ",
      };
  };

  NopBaiTap = async (MaBT, MaCH, SQLQueryClient, user) => {
    SQLQueryClient = SQLQueryClient.toLowerCase();

    let resultClient = await this.queryService.testQuery(
      MaCH,
      SQLQueryClient,
      user
    );

    const resultOutput = await this.GetOutputWithTime(MaBT, MaCH);

    if (resultOutput.statusCode != 200) return resultOutput;

    if (resultClient == 100)
      return {
        statusCode: 200,
        message: "Đúng",
        alert: `Đúng! Kết quả so khớp: ${resultClient}%`,
      };
    else
      return {
        statusCode: 400,
        message: "Sai",
        alert: `Sai! Kết quả so khớp: ${resultClient}%`,
      };
  };
}

module.exports = QuestionInfo;
