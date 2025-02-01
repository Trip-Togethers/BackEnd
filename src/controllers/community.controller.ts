import { Request, Response } from "express";
import { CommunityServices } from "../services/community.service";
import { GetPostByIdParams } from "../types/params.type";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { uploadParams } from "../middleware/multer.config";

export const allPosts = async (req: Request, res: Response) => {
  const posts = await CommunityServices.getAllPosts();
  res.status(posts.statusCode).json({
    posts
  });
};

export const createPost = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  let imageUrl;

  if (req.file?.path) {
    try {
      imageUrl = await uploadParams(req.file?.path, req.file?.filename);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "파일 업로드 오류",
        error,
      });
      return;
    }
  }

  // req.body에서 trip_id를 가져와서 postParams에 포함
  const { trip_id, post_title, post_content } = req.body;
  const postParams = {
    trip_id,
    post_title,
    imageUrl,
    post_content,
    userId,
  };

  const post = await CommunityServices.createPost(postParams);
  res.status(post.statusCode).json({
    post
  });
};

export const getPostById = async (
  req: Request<GetPostByIdParams>,
  res: Response
) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const post = await CommunityServices.getPostById(postId);
  res.status(post.statusCode).json({
    post
  });
};

export const updatePostById = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const userId = (req as Request & { user: { userId: number } }).user.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  let imageUrl;

  if (req.file?.path) {
    try {
      imageUrl = await uploadParams(req.file?.path, req.file?.filename);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "파일 업로드 오류",
        error,
      });
      return;
    }
  }

  // req.body에서 trip_id를 가져와서 postParams에 포함
  const { trip_id, post_title, post_content } = req.body;
  const postParams = {
    trip_id,
    post_title,
    imageUrl,
    post_content,
  };

  const post = await CommunityServices.updatePostById(postParams, postId, userId);
  res.status(post.statusCode).json({
    post
  });
};

export const deletePostById = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const userId = (req as Request & { user: { userId: number } }).user.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const post = await CommunityServices.deletePostById(postId, userId);
  res.status(post.statusCode).json({
    post
  });
};

export const likePost = async (
  req: Request<GetPostByIdParams>,
  res: Response
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const like = await CommunityServices.likePost(postId, userId);
  res.status(like.statusCode).json({
    like
  });
};

export const getCommentsForPost = async (
  req: Request<GetPostByIdParams>,
  res: Response
) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const comment = await CommunityServices.getCommentsForPost(postId);
  res.status(comment.statusCode).json({
    comment
  });
};

export const addCommentToPost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const { comments } = req.body;

  const comment = await CommunityServices.addCommentToPost(
    postId,
    userId,
    comments
  );
  res.status(comment.statusCode).json({
    comment
  });
};

export const updateComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.comment_id);

  if (isNaN(commentId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const { comments } = req.body;

  const comment = await CommunityServices.updateComment(
    commentId,
    userId,
    comments
  );
  res.status(comment.statusCode).json({
    comment
  });
};

export const deleteComment = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }

  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const comment = await CommunityServices.deleteComment(postId, userId);
  res.status(comment.statusCode).json({
    comment
  });
};
