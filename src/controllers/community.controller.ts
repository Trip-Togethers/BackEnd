import { Request, Response } from "express";
import { CommunityServices } from "../services/community.service";
import {
  GetPostByIdParams,
} from "../types/params.type";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

export const allPosts = async (req: Request, res: Response) => {
  const posts = await CommunityServices.getAllPosts();
  res.json(posts);
};

export const createPost = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    return;
  }

  const userId = (req as Request & { user: { userId: number } }).user.userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  // req.body에서 trip_id를 가져와서 postParams에 포함
  const { trip_id, post_title, post_photo_url, post_content } = req.body;
  const postParams = {
    trip_id,
    post_title,
    post_photo_url: post_photo_url || "",
    post_content,
    userId,
  };

  const post = await CommunityServices.createPost(postParams);
  res.json(post);
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
  res.json(post);
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

  const { post_title, post_photo_url, post_content } = req.body;
  const postParams = {
    post_title,
    post_photo_url: post_photo_url || "",
    post_content,
  };

  const post = await CommunityServices.updatePostById(
    postId,
    postParams,
    userId
  );
  res.json(post);
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
  res.json(post);
};

export const likePost = async (
  req: Request<GetPostByIdParams>,
  res: Response
) => {
  const userId = (req as unknown as Request & { user: { userId: number } }).user
    .userId;

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
  res.json(like);
};

export const unlikePost = async (
  req: Request<GetPostByIdParams>,
  res: Response
) => {
  const userId = (req as unknown as Request & { user: { userId: number } }).user
    .userId;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "사용자를 찾을 수 없습니다." });
  }

  const postId = parseInt(req.params.post_id);

  if (isNaN(postId)) {
    return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
  }
  const like = await CommunityServices.unlikePost(postId, userId);
  res.json(like);
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
  res.json(comment);
};

export const addCommentToPost = async (
  req: Request,
  res: Response
) => {
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

  const { comments } = req.body;

  const comment = await CommunityServices.addCommentToPost(
    postId,
    userId,
    comments
  );
  res.json(comment);
};

export const updateComment = async (
  req: Request,
  res: Response
) => {
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

  const { comments } = req.body;

  const comment = await CommunityServices.updateComment(postId,
    userId,
    comments);
  res.json(comment);
};

export const deleteComment = async (
  req: Request,
  res: Response
) => {
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
  

  const comment = await CommunityServices.deleteComment(postId, userId);
  res.json(comment);
};
