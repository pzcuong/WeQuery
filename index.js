var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var pug = require("pug");
var compression = require("compression");

const authRoute = require("./src/auth/auth.routers");
const userRoute = require("./src/users/users.routers");
const adminRoute = require("./src/admin/admin.routers");
require("dotenv").config();

var app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(cookieParser());
app.use(cors());

app.use(compression());
app.use("/public", express.static("./public"));

var port = process.env.PORT || 8080;

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.get("/", (req, res) => {
  let x_authorization = req.cookies.x_authorization;
  let html = pug.renderFile("public/Home.pug", { x_authorization });
  res.send(html);
});

app.use((req, res, next) => {
  let html = pug.renderFile("public/404.pug", {
    message: "OOps! Page not found",
    href: "Quay về trang người dùng",
    redirect: "/auth/login",
  });
  res.send(html);
});

app.use(express.static("/public"));

app.listen(port, function () {
  console.log("Server listening on port " + port);
});
