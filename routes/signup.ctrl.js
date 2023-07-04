const express = require("express");

const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { signupSchema } = require("../middlewares/auth.validation.js");
const { Users } = require("../models");

dotenv.config();

const router = express.Router();

// 회원가입
router.post("/", async (req, res) => {
  try {
    const { nickname, password, confirmPassword } = req.body;
    const isExistUser = await Users.findOne({ where: { nickname } });
    const regexp = new RegExp(`${nickname}`);
    const { error } = signupSchema.validate({
      nickname,
      password,
      confirmPassword,
    });
    if (error) {
      return res.status(412).json({ errorMessage: error.details[0].message });
    }
    if (isExistUser) {
      return res.status(412).json({ errorMessage: "중복된 닉네임 입니다." });
    }
    if (regexp.test(password)) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    await Users.create({
      nickname,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다. " });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
