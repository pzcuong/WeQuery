const express = require("express");
var pug = require("pug");

const router = express.Router();

const authMiddleware = require("../auth/auth.middlewares");
const UserController = require("./users.controller");
const getQuestionValidations = require("./dto/getQuestion.dto");

const middleware = new authMiddleware();
const userController = new UserController();

const isAuth = middleware.isAuth;

router.get("/profile", isAuth, async (req, res) => {
  let html = pug.renderFile("public/user/profile.pug", {
    user: req.user,
    image: req.image,
  });
  res.send(html);
});

router
  .route("/DoiThongTin")
  .get(isAuth, async (req, res) => {
    let html = pug.renderFile("public/DoiThongTin.pug", {
      user: req.user,
    });
    res.send(html);
  })
  .post(isAuth, userController.DoiThongTin);

router.get(
  "/TestSQL",
  isAuth,
  getQuestionValidations,
  userController.LayDanhSachCauHoi
);

router.get("/BaiTap", isAuth, userController.LayDanhSachBaiTap);

router
  .route("/BaiTap/:MaBT/:MaCH")
  .get(isAuth, userController.LayNoiDungBaiTap)
  .post(isAuth, userController.NopBaiTap);

router
  .route("/TestSQL/:MaCH")
  .get(isAuth, userController.LayCauHoi)
  .post(isAuth, userController.TestSQL);

module.exports = router;
