const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const { Users } = require("../models");
const { loginSchema } = require("../middlewares/auth.validation.js");

dotenv.config();

const router = express.Router();

// 로그인
router.post("/", async (req, res) => {
  try {
    const { nickname, password } = req.body;
    const { error } = loginSchema.validate({ nickname, password });

    if (error) {
      return res.status(412).json({ errorMessage: error.details[0].message });
    }

    const findUser = await Users.findOne({
      where: { nickname },
    });

    const validPassword = await bcrypt.compare(password, findUser.password);
    if (!findUser || !validPassword) {
      return res
        .status(400)
        .json({ errorMessage: "이메일이나 비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign({ nickname }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("Authorization", `Bearer ${token}`);

    return res.status(200).json({ token: token });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
