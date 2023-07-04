const Joi = require("joi");

const signupSchema = Joi.object({
  nickname: Joi.string().alphanum().min(3).required().messages({
    "string.base": "닉네임은 문자열이어야 합니다.",
    "string.min": "닉네임은 최소 3자 이상이여야 합니다.",
    "string.alphanum": "닉네임은 알파벳 문자와 숫자만 포함해야 합니다.",
    "any.required": "요청한 데이터 형식이 올바르지 않습니다.",
    "string.empty": "닉네임은 필수 항목입니다.",
  }),
  password: Joi.string().min(4).required().messages({
    "string.base": "비밀번호는 문자열이어야 합니다.",
    "string.min": "비밀번호는 최소 4자 이상이어야 합니다.",
    "any.required": "요청한 데이터 형식이 올바르지 않습니다.",
    "string.empty": "비밀번호는 필수 항목입니다.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.base": "비밀번호 확인은 문자열이어야 합니다.",
    "any.only": "비밀번호와 일치해야 합니다.",
    "any.required": "요청한 데이터 형식이 올바르지 않습니다.",
    "string.empty": "비밀번호 확인은 필수 항목입니다.",
  }),
});

const loginSchema = Joi.object({
  nickname: Joi.string().required().messages({
    "any.required": "로그인에 실패하였습니다.",
    "string.empty": "로그인에 실패하였습니다.",
  }),
  password: Joi.string().required().messages({
    "any.required": "로그인에 실패하였습니다.",
    "string.empty": "로그인에 실패하였습니다.",
  }),
});

const postSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "요청한 데이터 형식이 올바르지 않습니다.",
    "string.empty": "게시글 제목의 형식이 일치하지 않습니다.",
  }),
  content: Joi.string().required().messages({
    "any.required": "요청한 데이터 형식이 올바르지 않습니다.",
    "string.empty": "게시글 내용의 형식이 일치하지 않습니다.",
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  postSchema,
};
