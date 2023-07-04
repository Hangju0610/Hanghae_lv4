const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const dotenv = require("dotenv");

dotenv.config();

const jwtValidation = async (req, res, next) => {
  try {
    const { Authorization } = req.cookies;
    const [tokenType, token] = (Authorization ?? "").split(" ");
    if (tokenType !== "Bearer" || !token) {
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const nickname = decodedToken.nickname;

    const user = await Users.findOne({ where: { nickname } });

    if (!user) {
      res.clearCookie("Authorization");
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    res.locals.user = user;

    next();
  } catch (error) {
    res.clearCookie("Authorization");
    res
      .status(403)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
  }
};

module.exports = jwtValidation;
