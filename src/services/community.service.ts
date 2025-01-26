import { AppDataSource } from '../data-source';
import { Posts, Comments, Likes } from '../entities/community.entity';
import { GetPostByIdParams, UpdatePostBody, addCommentToPostBody, GetCommentByIdParams, updateCommentBody } from '../types/params.type';

export class CommunityServices {
    static async getAllPosts() {
        try {
            const postRepository = AppDataSource.getRepository(Posts);
            const commentRepository = AppDataSource.getRepository(Comments);
            const likeRepository = AppDataSource.getRepository(Likes);

            // 전체 게시글 조회
            const posts = await postRepository.find({
                relations: ['user_id'], // 작성자 정보를 가져옴
            });

            const results = await Promise.all(
                posts.map(async (post) => {
                    try {
                        // 댓글 수 가져오기
                        const commentsCount = await commentRepository.createQueryBuilder('comments').where('comments.post_id = :post_id', { post_id: post.id }).getCount();

                        // 좋아요 수 가져오기
                        const likesCount = await likeRepository.createQueryBuilder('likes').where('likes.post_id = :post_id', { post_id: post.id }).getCount();

                        // 작성자 정보 가져오기
                        const author = {
                            name: post.user_id?.name || 'Unknown',
                            profile_picture: post.user_id?.profile_picture || '',
                        };

                        return {
                            id: post.id,
                            post_title: post.post_title,
                            post_content: post.post_content,
                            author: {
                                nick: author.name,
                                profile: author.profile_picture,
                            },
                            created_at: post.created_at,
                            likes: likesCount,
                            comments_count: commentsCount,
                        };
                    } catch (error) {
                        return {
                            id: post.id,
                            post_title: post.post_title,
                            post_content: post.post_content,
                            author: {
                                nick: 'Unknown',
                                profile: '',
                            },
                            created_at: post.created_at,
                            likes: 0,
                            comments_count: 0,
                        };
                    }
                })
            );

            return {
                success: true,
                message: '게시글 목록 불러오기 완료',
                posts: results,
            };
        } catch (error) {
            return {
                success: false,
                message: '게시글 목록 불러오기 중 오류가 발생했습니다.',
            };
        }
    }

    static async createPost(params: { [key: string]: any }) {
        const postRepository = AppDataSource.getRepository(Posts);
        try {
            const savedPost = await postRepository.save(params);
            return {
                success: true,
                message: '게시글 작성 완료',
                post: savedPost,
            };
        } catch (error) {
            return {
                success: false,
                message: '게시글 작성 중 오류가 발생했습니다.',
            };
        }
    }

    static async getPostById(params: GetPostByIdParams) {
        const postRepository = AppDataSource.getRepository(Posts);
        const commentRepository = AppDataSource.getRepository(Comments);
        const likeRepository = AppDataSource.getRepository(Likes);

        const post_id = Number(params.post_id);

        try {
            const post = await postRepository.findOne({
                relations: ['user_id'],
                where: { id: post_id },
            });

            // 댓글 수 가져오기
            const commentsCount = await commentRepository.createQueryBuilder('comments').where('comments.post_id = :post_id', { post_id: post_id }).getCount();
            // 좋아요 수 가져오기
            const likesCount = await likeRepository.createQueryBuilder('likes').where('likes.post_id = :post_id', { post_id: post_id }).getCount();
            // 작성자 정보 가져오기
            const author = {
                name: post?.user_id?.name || 'Unknown',
                profile_picture: post?.user_id?.profile_picture || '',
            };

            return {
                success: true,
                message: '게시글 상세정보 불러오기 완료',
                post: {
                    id: post_id,
                    post_title: post?.post_title,
                    post_content: post?.post_content,
                    post_photo_url: post?.post_photo_url,
                    author: {
                        nick: author.name,
                        profile: author.profile_picture,
                    },
                    created_at: post?.created_at,
                    updated_at: post?.updated_at,
                    likes: likesCount,
                    comments_count: commentsCount,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '게시글 불러오기 중 오류가 발생했습니다.',
            };
        }
    }

    static async updatePostById(params: GetPostByIdParams, body: UpdatePostBody) {
        const postRepository = AppDataSource.getRepository(Posts);
        const post_id = Number(params.post_id);

        try {
            await postRepository.update({ id: post_id }, body);

            const post = await postRepository.findOne({
                where: { id: post_id },
            });

            return {
                success: true,
                message: '게시글 수정 완료',
                post: {
                    id: post_id,
                    post_title: post?.post_title,
                    post_content: post?.post_content,
                    post_photo_url: post?.post_photo_url,
                    updated_at: post?.updated_at,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '게시글 수정 중 오류가 발생했습니다.',
            };
        }
    }

    static async deletePostById(params: GetPostByIdParams) {
        const postRepository = AppDataSource.getRepository(Posts);
        const post_id = Number(params.post_id);
        try {
            await postRepository.delete({ id: post_id });

            return {
                success: true,
                message: '게시글 삭제 완료',
                post: {
                    id: post_id,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '게시글 삭제 중 오류가 발생했습니다.',
            };
        }
    }

    static async likePost(params: GetPostByIdParams) {
        const likeRepository = AppDataSource.getRepository(Likes);
        const post_id = Number(params.post_id);
        try {
            await likeRepository.insert({
                post_id: post_id,
                user_id: 2,
            });
            const likesCount = await likeRepository.createQueryBuilder('likes').where('likes.post_id = :post_id', { post_id: post_id }).getCount();
            return {
                success: true,
                message: '좋아요 추가 완료',
                post: {
                    id: post_id,
                    likes: likesCount,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '좋아요 추가 중 오류가 발생했습니다.',
            };
        }
    }

    static async unlikePost(params: GetPostByIdParams) {
        const likeRepository = AppDataSource.getRepository(Likes);
        const post_id = Number(params.post_id);
        try {
            const unlike = await likeRepository.delete({ post_id: post_id, user_id: 2 });
            const likesCount = await likeRepository.createQueryBuilder('likes').where('likes.post_id = :post_id', { post_id: post_id }).getCount();

            return {
                success: true,
                message: unlike.affected ? '좋아요 삭제 완료' : '삭제할 데이터가 없습니다.',
                post: {
                    id: post_id,
                    likes: likesCount,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '좋아요 삭제 중 오류가 발생했습니다.',
            };
        }
    }

    static async getCommentsForPost(params: GetPostByIdParams) {
        try {
            const post_id = Number(params.post_id);
            const commentRepository = AppDataSource.getRepository(Comments);

            const comments = await commentRepository.find({
                relations: ['user'],
                where: { post_id: post_id },
            });

            const results = await Promise.all(
                comments.map(async (comment) => {
                    try {
                        // 작성자 정보 가져오기
                        const author = {
                            name: comment?.user?.name || 'Unknown',
                            profile_picture: comment?.user?.profile_picture || '',
                        };

                        return {
                            id: comment.id,
                            content: comment.content,
                            author: {
                                nick: author.name,
                                profile: author.profile_picture,
                            },
                            created_at: comment.created_at,
                        };
                    } catch (error) {
                        return {
                            id: comment.id,
                            content: comment.content,
                            author: {
                                nick: 'Unknown',
                                profile: '',
                            },
                            created_at: comment.created_at,
                        };
                    }
                })
            );

            return {
                success: true,
                message: '댓글 불러오기 완료',
                posts: results,
            };
        } catch (error) {
            return {
                success: false,
                message: '댓글 불러오기 중 오류가 발생했습니다.',
            };
        }
    }

    static async addCommentToPost(params: GetPostByIdParams, body: addCommentToPostBody) {
        const post_id = Number(params.post_id);
        let comment_data = body;
        comment_data.post_id = post_id;
        comment_data.user_id = 1;

        const commentRepository = AppDataSource.getRepository(Comments);
        try {
            const savedComment = await commentRepository.save(comment_data);

            return {
                success: true,
                message: '댓글 작성 완료',
                comment: {
                    content: savedComment.content,
                    created_at: savedComment.created_at,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '댓글 작성 중 오류가 발생했습니다.',
            };
        }
    }

    static async updateComment(params: GetCommentByIdParams, body: updateCommentBody) {
        const commentRepository = AppDataSource.getRepository(Comments);
        const comment_id = Number(params.comment_id);

        try {
            const updateComment = await commentRepository.update({ id: comment_id }, body);
            const comment = await commentRepository.findOne({
                where: { id: comment_id },
            });

            return {
                success: true,
                message: updateComment.affected ? '댓글 수정 완료' : '수정할 댓글이 존재하지 않습니다.',
                comment: {
                    id: comment_id,
                    content: comment?.content,
                    created_at: comment?.created_at,
                    updated_at: comment?.updated_at,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '댓글 수정 중 오류가 발생했습니다.',
            };
        }
    }

    static async deleteComment(params: GetCommentByIdParams) {
        const commentRepository = AppDataSource.getRepository(Comments);
        const comment_id = Number(params.comment_id);

        try {
            const comment = await commentRepository.delete({ id: comment_id, user_id: 2 });

            return {
                success: true,
                message: comment.affected ? '댓글 삭제 완료' : '삭제할 데이터가 없습니다.',
                comment: {
                    id: comment_id,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: '댓글 삭제 중 오류가 발생했습니다.',
            };
        }
    }
}
