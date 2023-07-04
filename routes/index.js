const express = require('express');
const postRouter = require('./post.ctrl');
const loginRouter = require('./login.ctrl');
const signupRouter = require('./signup.ctrl');
const commentRouter = require('./comment.ctrl');
const likeRouter = require('./like.ctrl');

const router = express.Router();

router.use('/login', loginRouter);
router.use('/signup', signupRouter);
router.use('/posts', likeRouter, postRouter, commentRouter);

module.exports = router;
