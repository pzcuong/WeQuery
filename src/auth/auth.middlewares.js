const UserInfo = require("../users/user/user.models");
const userModel = require("../users/users.models");
const authMethod = require("./auth.methods");
const pug = require("pug");

class authMiddleware {
  constructor() {
    this.userInfo = new UserInfo();
  }

  isAuth = async (req, res, next) => {
    const accessTokenFromHeader = req.cookies.x_authorization;
    if (!accessTokenFromHeader) return res.status(401).redirect("/auth/login");

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
      accessTokenFromHeader,
      accessTokenSecret
    );

    if (verified.statusCode === 401)
      return res.writeHead(302, { Location: "/auth/login" }).end();

    const user = await this.userInfo.getUser(verified.data.payload.username);
    req.user = user;

    return next();
  };

  isAuthAdmin = async (req, res, next) => {
    const accessTokenFromHeader = req.cookies.x_authorization;
    if (!accessTokenFromHeader)
      return res.writeHead(302, { Location: "/auth/login" }).end();

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
      accessTokenFromHeader,
      accessTokenSecret
    );

    if (verified.statusCode === 401)
      return res.writeHead(302, { Location: "/auth/login" }).end();

    const user = await this.userInfo.getUser(verified.data.payload.username);

    if (user.role !== "Admin")
      return res.writeHead(302, { Location: "/auth/login" }).end();

    req.user = user;
    return next();
  };

  isLogined = async (req, res, next) => {
    const accessTokenFromHeader = req.cookies.x_authorization;
    if (!accessTokenFromHeader) return next();

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const verified = await authMethod.verifyToken(
      accessTokenFromHeader,
      accessTokenSecret
    );

    if (verified.statusCode != 200) return next();

    return res.redirect("/user/profile");
  };
}

module.exports = authMiddleware;
