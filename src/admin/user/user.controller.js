const pug = require("pug");
const UserModel = require("./user.models");
const ApiResponse = require("../../common/api.response");
const UserGroupModel = require("../userGroup/userGroup.models");

class UserController {
  constructor() {
    this.userModel = new UserModel();
    this.userGroupModel = new UserGroupModel();
  }

  SuaThongTinSinhVien = async (req, res) => {
    const data = req.body;
    const result = await this.userModel.SuaThongTinSinhVien(data);
    if (result) return res.send(ApiResponse.success(result));
    else return res.send(ApiResponse.badRequest("Sửa thông tin thất bại"));
  };

  ThemSinhVien = async (req, res) => {
    const data = req.body;

    const result = await this.userModel.ThemSinhVien(data);
    if (result) return res.send(ApiResponse.success({ MaSV: result.MaSV }));
    else return res.send(ApiResponse.badRequest("Thêm sinh viên thất bại"));
  };

  DanhSachSinhVien = async (req, res) => {
    let studentList = await this.userModel.DanhSachSinhVien();
    let dsNhom = await this.userGroupModel.DanhSachNhom();
    let html;
    if (studentList && dsNhom)
      html = pug.renderFile("public/admin/QuanLySinhVien.pug", {
        user: req.user,
        studentList,
        dsNhom,
      });
    else
      html = pug.renderFile("public/404.pug", {
        message: result.message,
        redirect: "/admin/QuanLySinhVien",
      });
    res.send(html);
  };
}

module.exports = UserController;
