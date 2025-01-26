import express, { Request, Response } from 'express';
const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => Promise.resolve(fn(req, res, next));
import { allPosts, createPost, getPostById, updatePostById, deletePostById, likePost, unlikePost, addCommentToPost, getCommentsForPost, updateComment, deleteComment } from '../controller/community.controller';

router
    .route('/')
    .get(asyncHandler(allPosts))
    .post(asyncHandler(createPost));

router
    .route('/:post_id')
    .get(asyncHandler(getPostById))
    .put(asyncHandler(updatePostById))
    .delete(asyncHandler(deletePostById));

router
    .route('/:post_id/like')
    .post(asyncHandler(likePost))
    .delete(asyncHandler(unlikePost));

router
    .route('/:post_id/comments')
    .get(asyncHandler(getCommentsForPost))
    .post(asyncHandler(addCommentToPost));

router
    .route('/:comment_id/comment')
    .put(asyncHandler(updateComment))
    .delete(asyncHandler(deleteComment));

export default router;
