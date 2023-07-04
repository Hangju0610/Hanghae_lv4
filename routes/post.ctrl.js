const express = require("express");

const { Posts, Users } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const { postSchema } = require("../middlewares/auth.validation");
const { Op } = require("sequelize");

const router = express.Router();

// 게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId } = res.locals.user;
    const { error } = postSchema.validate({
      title,
      content,
    });

    if (error) {
      return res.status(412).json({ errorMessage: error.details[0].message });
    }

    const createPost = await Posts.create({
      userId,
      title,
      content,
    });

    if (!createPost) {
      return res
        .status(400)
        .json({ errorMessage: "게시글 작성에 실패하였습니다. " });
    }

    return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (err) {
    console.error(err);
  }
});

// 전체 게시글 조회
router.get("/", async (_, res) => {
  try {
    const findPosts = await Posts.findAll({
      attributes: ["postId", "userId", "title", "createdAt", "updatedAt"],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const postList = findPosts.map((post) => {
      return {
        postId: post.postId,
        userId: post.userId,
        nickname: post.User.nickname,
        title: post.title,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    res.status(200).json({ posts: postList });
  } catch (error) {
    console.log(error);
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await Posts.findOne({
      where: { postId },
      attributes: [
        "postId",
        "userId",
        "title",
        "content",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Users,
          attributes: ["nickname"],
          required: false,
        },
      ],
    });

    const post = {
      postId: findPost["postId"],
      userId: findPost["userId"],
      nickname: findPost["User"]["nickname"],
      title: findPost["title"],
      content: findPost["content"],
      createdAt: findPost["createdAt"],
      updatedAt: findPost["updatedAt"],
    };

    res.status(200).json({ post: post });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ errorMessage: "게시글 상세 조회에 실패하였습니다." });
  }
});

// 게시글 수정
router.put("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const { userId } = res.locals.user;
    const { error } = postSchema.validate({
      title,
      content,
    });
    if (error) {
      return res.status(412).json({ errorMessage: error.details[0].message });
    }

    const existPost = await Posts.findOne({
      where: { postId },
    });

    if (!existPost) {
      return res.status(404).json({ errorMessage: "게시글이 없습니다. " });
    }
    const updatePost = await Posts.update(
      {
        title,
        content,
      },
      {
        where: {
          [Op.and]: [{ postId }, { userId }],
        },
      }
    );

    if (!updatePost) {
      return res
        .status(400)
        .json({ errorMessage: "게시글 수정에 실패하였습니다" });
    }

    return res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.error(err);
  }
});

// 게시글 삭제
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const existPost = await Posts.findOne({ where: { postId } });

    if (!existPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    if (existPost.userId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }

    const deletePost = await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { userId }],
      },
    });

    if (!deletePost) {
      return res
        .status(400)
        .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
    }

    res.status(200).json({ message: "게시글 삭제에 성공하였습니다." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
