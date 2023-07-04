const express = require('express');

const { Likes, Posts, Users, sequelize } = require('../models');
const authmiddleware = require('../middlewares/auth-middleware');
const { Transaction, Op } = require('sequelize');

const router = express.Router();

// 게시글 좋아요
router.put('/:postId/like', authmiddleware, async (req, res) => {
  try {
    // 1. userId와 postId 받아오기
    const { userId } = res.locals.user;
    const { postId } = req.params;

    // 1-1 post 찾기

    const findpost = await Posts.findOne({ where: { postId } });
    if (!findpost)
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });

    // 2. Likes Table에서 동일한 항목이 있는지 받아오기
    const existLike = await Likes.findOne({
      where: {
        [Op.and]: [{ postId }, { userId }],
      },
    });
    const t = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    });

    try {
      if (!existLike) {
        // 3-1 동일한 항목이 없는 경우, Create를 진행
        await Likes.create({ postId, userId }, { transaction: t });
        res.status(200).json({ message: '게시글의 좋아요를 등록하였습니다.' });
      } else {
        // 3-1 동일한 항목이 있을 경우, Delete를 진행
        await Likes.destroy({
          where: {
            [Op.and]: [{ postId }, { userId }],
          },
          transaction: t,
        });
        res.status(200).json({ message: '게시글의 좋아요를 취소하였습니다.' });
      }
      await t.commit();
    } catch (err) {
      console.log(err);
      res.status(400).json({ errorMessage: '게시글 좋아요에 실패하였습니다.' });
      await t.rollback();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: '서버에 문제가 있습니다.' });
  }
});

// 좋아요 게시글 조회
router.get('/like', authmiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const findLikes = await Posts.findAll({
      attributes: ['postId', 'userId', 'title', 'createdAt', 'updatedAt'],
      where: { userId },
      include: [
        {
          model: Users,
          attributes: ['nickname'],
          required: false,
        },
        {
          model: Likes,
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('Likes.postId')), 'likes'],
          ],
          require: false,
        },
      ],
      group: ['postId'],
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    console.log(findLikes);
    // console.log(findLikes[0]['User.nickname']);

    const data = findLikes.map((like) => {
      return {
        postId: like.postId,
        userId: like.userId,
        nickname: like['User.nickname'],
        title: like.title,
        createdAt: like.createdAt,
        updatedAt: like.updatedAt,
        likes: like['Likes.likes'],
      };
    });

    if (!data) {
      return res.status(404).json({ errorMessage: '좋아요없숨' });
    }

    res.status(200).json({ posts: data });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
