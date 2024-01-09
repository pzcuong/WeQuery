const express = require("express");
var pug = require("pug");

const router = express.Router();

const authMiddleware = require("../auth/auth.middlewares");
const UsersController = require("./users.controller");
const getQuestionValidations = require("./dto/getQuestion.dto");
const changeInfoValidations = require("./dto/changeInfo.dto");

const middleware = new authMiddleware();
const userController = new UsersController();

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
  .post(
    isAuth,
    changeInfoValidations,
    userController.userController.DoiThongTin
  );

router.get(
  "/TestSQL",
  isAuth,
  getQuestionValidations,
  userController.questionController.LayDanhSachCauHoi
);

router.get(
  "/BaiTap",
  isAuth,
  userController.questionController.LayDanhSachBaiTap
);

router
  .route("/BaiTap/:MaBT/:MaCH")
  .get(isAuth, userController.questionController.LayNoiDungBaiTap)
  .post(isAuth, userController.questionController.NopBaiTap);

router
  .route("/TestSQL/:MaCH")
  .get(isAuth, userController.questionController.LayCauHoi)
  .post(isAuth, userController.questionController.TestSQL);

module.exports = router;
