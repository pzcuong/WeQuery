const QueryService = require("../../query/query.service");

class ExerciseModel {
  constructor() {
    this.queryService = new QueryService();
  }

  DanhSachBaiTap = async () => {
    let SQLQuery = `SELECT DISTINCT Admin_BaiTap.MaBT, TieuDe, COUNT(DISTINCT Admin_BaiTapCauHoi.MaCH) AS SoBT, COUNT(Username) AS DaThucHien
          FROM dbo.Admin_BaiTap LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaBT = Admin_BaiTap.MaBT LEFT JOIN dbo.Admin_SQLSubmitHistory ON Admin_SQLSubmitHistory.MaCH = Admin_BaiTapCauHoi.MaCH
          GROUP BY Admin_BaiTap.MaBT, TieuDe`;
    return await this.queryService.query(SQLQuery);
  };

  ThemCauHoiVaoBaiTap = async (MaBT, MaCH) => {
    let SQLQuery = `insert into Admin_BaiTapCauHoi (MaBT, MaCH) values ('${MaBT}', '${MaCH}')`;
    return await this.queryService.query(SQLQuery);
  };

  ThemBaiTap = async (data) => {
    let SQLQuery = `INSERT INTO Admin_BaiTap (TieuDe, TgianBD, TgianKT, TrangThai)
        OUTPUT INSERTED.MaBT
        VALUES (@TieuDe, @TgianBD, @TgianKT, @TrangThai);`;

    let parameters = {
      TieuDe: data.TieuDe,
      TgianBD: data.TgianBD,
      TgianKT: data.TgianKT,
      TrangThai: data.TrangThai ? "1" : "0",
    };

    const insertedData = await this.queryService.query(SQLQuery, parameters);

    SQLQuery = `insert into Admin_BaiTapTheoNhom (MaBT, MaNhom) values (@MaBT, @MaNhom)`;
    parameters = { MaBT: insertedData.MaBT.toString(), MaNhom: data.MaNhom };
    return await this.queryService.query(SQLQuery, parameters);
  };

  SuaBaiTap = async (data, MaBT) => {
    data.TrangThai = data.TrangThai ? "1" : "0";

    let SQLQuery = `      
      UPDATE Admin_BaiTap 
      SET TieuDe = @TieuDe, TgianBD = @TgianBD, TgianKT = @TgianKT, TrangThai = @TrangThai
      FROM Admin_BaiTap 
      INNER JOIN Admin_BaiTapTheoNhom ON Admin_BaiTap.MaBT = Admin_BaiTapTheoNhom.MaBT
      WHERE Admin_BaiTap.MaBT = @MaBT;
  
      UPDATE Admin_BaiTapTheoNhom 
      SET MaNhom = @MaNhom
      WHERE MaBT = @MaBT;
    `;

    let parameters = {
      TieuDe: data.TieuDe,
      TgianBD: data.TgianBD,
      TgianKT: data.TgianKT,
      TrangThai: data.TrangThai,
      MaNhom: data.MaNhom,
      MaBT: MaBT,
    };

    return await this.queryService.query(SQLQuery, parameters);
  };

  LayBaiTap = async (MaBT) => {
    let SQLQuery = `SELECT Admin_BaiTap.TieuDe as TieuDeBaiTap, Admin_CauHoi.TieuDe, Admin_BaiTapCauHoi.MaCH, MucDo, LuocDo, TgianBD, TgianKT, TrangThai, MaNhom
          FROM dbo.Admin_BaiTap 
            LEFT JOIN dbo.Admin_BaiTapCauHoi ON Admin_BaiTapCauHoi.MaBT = Admin_BaiTap.MaBT 
            LEFT JOIN dbo.Admin_CauHoi ON Admin_CauHoi.MaCH = Admin_BaiTapCauHoi.MaCH
            LEFT JOIN dbo.Admin_BaiTapTheoNhom ON Admin_BaiTapTheoNhom.MaBT = Admin_BaiTap.MaBT
          WHERE Admin_BaiTap.MaBT = '${MaBT}'`;
    return await this.queryService.query(SQLQuery);
  };
}

module.exports = ExerciseModel;
