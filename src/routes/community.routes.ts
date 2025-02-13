import express, { Request, Response } from "express";
const router = express.Router();

const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: Function) =>
    Promise.resolve(fn(req, res, next));
import {
  allPosts,
  createPost,
  getPostById,
  updatePostById,
  deletePostById,
  likePost,
  addCommentToPost,
  getCommentsForPost,
  updateComment,
  deleteComment,
} from "../controllers/community.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateCreatePost } from "../middleware/post.validators";
import { upload } from "../middleware/multer.config";

router
  .route("/")
  .get(asyncHandler(allPosts)) // 게시글 목록 불러오기
  .post(
    authMiddleware,
    upload.single("image"),
    validateCreatePost,
    asyncHandler(createPost)
  ); // 게시글 작성하기

router
  .route("/:postId")
  .get(asyncHandler(getPostById)) // 게시글 상세보기
  .put(authMiddleware, upload.single("image"), asyncHandler(updatePostById)) // 게시글 수정하기
  .delete(authMiddleware, asyncHandler(deletePostById)); // 게시글 삭제하기

router.route("/:postId/like").post(authMiddleware, asyncHandler(likePost)); // 좋아요 추가 및 취소

router
  .route("/:postId/comments")
  .get(asyncHandler(getCommentsForPost)) // 댓글 조회
  .post(authMiddleware, asyncHandler(addCommentToPost)); // 댓글 작성

router
  .route("/:postId/comments/:commentId")
  .put(authMiddleware, asyncHandler(updateComment)) // 댓글 수정
  .delete(authMiddleware, asyncHandler(deleteComment)); // 댓글 삭제

export default router;
