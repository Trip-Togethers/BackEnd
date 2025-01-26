import { Request, Response } from 'express';
import { CommunityServices } from '../services/community.service';
import { GetPostByIdParams, UpdatePostBody, addCommentToPostBody, GetCommentByIdParams, updateCommentBody } from '../types/params.type';

export const allPosts = async (req: Request, res: Response) => {
    const posts = await CommunityServices.getAllPosts();
    res.json(posts);
};

export const createPost = async (req: Request, res: Response) => {
    const post = await CommunityServices.createPost(req.body);
    res.json(post);
};

export const getPostById = async (req: Request<GetPostByIdParams>, res: Response) => {
    const post = await CommunityServices.getPostById(req.params);
    res.json(post);
};

export const updatePostById = async (req: Request<GetPostByIdParams, {}, UpdatePostBody>, res: Response) => {
    const post = await CommunityServices.updatePostById(req.params, req.body);
    res.json(post);
};

export const deletePostById = async (req: Request<GetPostByIdParams>, res: Response) => {
    const post = await CommunityServices.deletePostById(req.params);
    res.json(post);
};

export const likePost = async (req: Request<GetPostByIdParams>, res: Response) => {
    const like = await CommunityServices.likePost(req.params);
    res.json(like);
};

export const unlikePost = async (req: Request<GetPostByIdParams>, res: Response) => {
    const like = await CommunityServices.unlikePost(req.params);
    res.json(like);
};

export const getCommentsForPost = async (req: Request<GetPostByIdParams>, res: Response) => {
    const comment = await CommunityServices.getCommentsForPost(req.params);
    res.json(comment);
};

export const addCommentToPost = async (req: Request<GetPostByIdParams, {}, addCommentToPostBody>, res: Response) => {
    const comment = await CommunityServices.addCommentToPost(req.params, req.body);
    res.json(comment);
};

export const updateComment = async (req: Request<GetCommentByIdParams, {}, updateCommentBody>, res: Response) => {
    const comment = await CommunityServices.updateComment(req.params, req.body);
    res.json(comment);
};

export const deleteComment = async (req: Request<GetCommentByIdParams>, res: Response) => {
    const comment = await CommunityServices.deleteComment(req.params);
    res.json(comment);
};
