const pug = require("pug");
const UserGroupModel = require("./userGroup.models");
const ApiResponse = require("../../common/api.response");

class UserGroupController {
  constructor() {
    this.userGroupModel = new UserGroupModel();
  }

  ThemNhom = async (req, res) => {
    const data = req.body;

    const result = await this.userGroupModel.ThemNhom(data);
    if (result) return res.send(ApiResponse.success({ MaNhom: result.MaNhom }));
    else
      return res.send(ApiResponse.badRequest("Thêm nhóm sinh viên thất bại"));
  };

  DanhSachNhomSV = async (req, res) => {
    let groups = await this.userGroupModel.DanhSachNhom();
    let html;

    if (groups)
      html = pug.renderFile("public/admin/QuanLyNhom.pug", {
        user: req.user,
        groups,
      });
    else
      html = pug.renderFile("public/404.pug", {
        message: result.message,
        redirect: "/admin/QuanLySinhVien",
      });

    res.send(html);
  };
}

module.exports = UserGroupController;
