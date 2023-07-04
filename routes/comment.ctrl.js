const express = require('express');

const { Posts, Users, Comments } = require('../models');
const authmiddleware = require('../middlewares/auth-middleware');
const { Op } = require('sequelize');

const router = express.Router();

// 댓글 생성
router.post('/:postId/comments', authmiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const { userId } = res.locals.user;

    if (!req.body) {
      return res
        .status(412)
        .json({ errorMessage: '데이터 형식이 올바르지 않습니다. ' });
    }

    const findPost = await Posts.findOne({
      where: { postId },
    });
    if (!findPost) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다. ' });
    }

    await Comments.create({
      userId,
      postId,
      comment,
    });

    return res.status(201).json({ message: '댓글을 작성하였습니다. ' });
  } catch (err) {
    console.error(err);
  }
});

// 댓글 조회
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const findPost = await Posts.findOne({
      where: { postId },
    });
    if (!findPost) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다. ' });
    }

    const comment = await Comments.findAll({
      attributes: ['commentId', 'userId', 'comment', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Users,
          attributes: ['nickname'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const data = await comment.map((item) => {
      return {
        commentId: item.commentId,
        userId: item.userId,
        nickname: item.nickname,
        comment: item.comment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return res.status(200).json({ comments: data });
  } catch (err) {
    console.error(err);
  }
});

// 댓글 수정
router.put('/:postId/comments/:commentId', authmiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    const findPost = await Posts.findOne({
      where: { postId },
    });
    if (!findPost) {
      return res
        .status(404)
        .json({ errorMessage: '게시글을 찾을 수 없습니다. ' });
    }
    const findComment = await Comments.findOne({
      where: { commentId },
    });
    if (!findComment) {
      return res
        .status(404)
        .json({ errorMessage: '댓글을 찾을 수 없습니다. ' });
    }

    await Comments.update(
      {
        comment,
      },
      {
        where: {
          [Op.and]: [{ postId, commentId }],
        },
      }
    );

    return res.status(200).json({ message: '댓글을 수정하였습니다. ' });
  } catch (err) {
    console.error(err);
  }
});

// 댓글 삭제
router.delete(
  '/:postId/comments/:commentId',
  authmiddleware,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;

      const findPost = await Posts.findOne({
        where: { postId },
      });
      if (!findPost) {
        return res
          .status(404)
          .json({ errorMessage: '게시글을 찾을 수 없습니다. ' });
      }
      const findComment = await Comments.findOne({
        where: { commentId },
      });
      if (!findComment) {
        return res
          .status(404)
          .json({ errorMessage: '댓글을 찾을 수 없습니다. ' });
      }

      await Comments.destroy({
        where: {
          [Op.and]: [{ postId, commentId }],
        },
      });

      return res.status(200).json({ message: '댓글을 삭제하였습니다. ' });
    } catch (err) {
      console.error(err);
    }
  }
);

module.exports = router;
