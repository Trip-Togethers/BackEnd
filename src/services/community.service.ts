import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Posts, Comments, Likes } from "../entities/community.entity";
import { User } from "../entities/user.entity";

export class CommunityServices {
  static async getAllPosts() {
    try {
      const postRepository = AppDataSource.getRepository(Posts);
      const commentRepository = AppDataSource.getRepository(Comments);
      const likeRepository = AppDataSource.getRepository(Likes);

      // 전체 게시글 조회
      const posts = await postRepository.find({
        relations: ["user"], // 작성자 정보를 가져옴
      });

      const results = await Promise.all(
        posts.map(async (post) => {
          try {
            // 댓글 수 가져오기
            const commentsCount = await commentRepository
              .createQueryBuilder("comments")
              .where("comments.post_id = :post_id", { post_id: post.id })
              .getCount();

            // 좋아요 수 가져오기
            const likesCount = await likeRepository
              .createQueryBuilder("likes")
              .where("likes.post_id = :post_id", { post_id: post.id })
              .getCount();

            // 작성자 정보 가져오기
            const author = {
              name: post.user.nickname || "Unknown",
              profile_picture: post.user?.profile_picture || "",
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
                nick: "Unknown",
                profile: "",
              },
              created_at: post.created_at,
              likes: 0,
              comments_count: 0,
            };
          }
        })
      );

      return {
        message: "게시글 목록 불러오기 완료",
        statusCode: StatusCodes.OK,
        posts: results,
      };
    } catch (error) {
      return {
        message: "게시글 목록 불러오기 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async createPost(params: { [key: string]: any }) {
    const postRepository = AppDataSource.getRepository(Posts);

    try {
      const newPost = new Posts();
      newPost.post_title = params.post_title;
      newPost.post_photo_url = params.imageUrl;
      newPost.post_content = params.post_content;
      newPost.user_id = params.userId;
      newPost.trip_id = params.trip_id;

      await postRepository.save(newPost);
      return {
        message: "게시글 작성 완료",
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      return {
        message: "게시글 작성 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getPostById(postId: number) {
    const postRepository = AppDataSource.getRepository(Posts);
    const commentRepository = AppDataSource.getRepository(Comments);
    const likeRepository = AppDataSource.getRepository(Likes);

    try {
      const post = await postRepository.findOne({
        relations: ["user"],
        where: { id: postId },
      });

      if (!post) {
        return {
          message: "해당 게시글을 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 댓글 수 가져오기
      const commentsCount = await commentRepository
        .createQueryBuilder("comments")
        .where("comments.post_id = :post_id", { post_id: postId })
        .getCount();
      // 좋아요 수 가져오기
      const likesCount = await likeRepository
        .createQueryBuilder("likes")
        .where("likes.post_id = :post_id", { post_id: postId })
        .getCount();
      // 작성자 정보 가져오기
      const author = {
        name: post?.user?.nickname || "Unknown",
        profilePicture: post?.user?.profile_picture || "",
      };

      return {
        message: "게시글 상세정보 불러오기 완료",
        statusCode: StatusCodes.OK,
        post: {
          id: postId,
          post_title: post?.post_title,
          post_content: post?.post_content,
          post_photo_url: post?.post_photo_url,
          author: {
            nick: author.name,
            profile: author.profilePicture,
          },
          created_at: post?.created_at,
          updated_at: post?.updated_at,
          likes: likesCount,
          comments_count: commentsCount,
        },
      };
    } catch (error) {
      return {
        message: "게시글 불러오기 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async updatePostById(params: { [key: string]: any }, postId: number, userId: number) {
    const postRepository = AppDataSource.getRepository(Posts);

    try {
      // 게시글 조회
      const post = await postRepository.findOne({ where: { id: postId } });

      // 게시글이 존재하지 않거나, 게시글 작성자가 userId와 다른경우
      if (!post) {
        return {
          message: "게시글을 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      if (post.user_id !== userId) {
        return {
          message: "작성만 수정할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      await postRepository.update({ id: postId }, params);

      return {
        message: "게시글 수정 완료",
        statusCode: StatusCodes.OK,
        post: {
          id: postId,
          post_title: post?.post_title,
          post_content: post?.post_content,
          post_photo_url: post?.post_photo_url,
          updated_at: post?.updated_at,
        },
      };
    } catch (error) {
      return {
        message: "게시글 수정 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deletePostById(postId: number, userId: number) {
    const postRepository = AppDataSource.getRepository(Posts);
    try {
      // 게시글 조회
      const post = await postRepository.findOne({ where: { id: postId } });

      // 게시글이 존재하지 않거나, 게시글 작성자가 userId와 다른경우
      if (!post) {
        return {
          message: "게시글을 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 이건 버튼을 보이지않게 하면 될 듯 싶다.
      if (post.user_id !== userId) {
        return {
          message:
            "삭제 권한이 없습니다. 다른 사용자의 게시글은 삭제할 수 없습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      await postRepository.delete({ id: postId });

      return {
        message: "게시글 삭제 완료",
        statusCode: StatusCodes.OK,
        post: {
          id: postId,
        },
      };
    } catch (error) {
      return {
        message: "게시글 삭제 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async likePost(postId: number, userId: number) {
    const postRepository = AppDataSource.getRepository(Posts);
    const likeRepository = AppDataSource.getRepository(Likes);
    try {
      // 1. 게시글 존재 여부 확인
      const post = await postRepository.findOne({ where: { id: postId } });
  
      if (!post) {
        return {
          message: "해당 게시글을 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }
  
      // 2. 사용자가 이미 좋아요를 눌렀는지 확인
      const existingLike = await likeRepository.findOne({
        where: { post_id: postId, user_id: userId },
      });
  
      if (existingLike) {
        // 이미 좋아요를 눌렀다면 -> 좋아요 취소
        await likeRepository.delete({ post_id: postId, user_id: userId });
  
        // 삭제 후 좋아요 수 갱신
        const updatedLikes = await likeRepository.count({ where: { post_id: postId } });
  
        return {
          message: "좋아요 취소 완료",
          statusCode: StatusCodes.OK,
          post: { id: postId, likes: updatedLikes },
        };
      } else {
        // 좋아요 추가
        await likeRepository.insert({ post_id: postId, user_id: userId });
  
        // 좋아요 수 갱신
        const updatedLikes = await likeRepository.count({ where: { post_id: postId } });
  
        return {
          message: "좋아요 추가 완료",
          statusCode: StatusCodes.OK,
          post: { id: postId, likes: updatedLikes },
        };
      }
    } catch (error) {
      return {
        message: "좋아요 추가 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async getCommentsForPost(postId: number) {
    try {
      const commentRepository = AppDataSource.getRepository(Comments);

      const comments = await commentRepository.find({
        relations: ["user"],
        where: { post_id: postId },
      });

      const results = await Promise.all(
        comments.map(async (comment) => {
          try {
            // 작성자 정보 가져오기
            const author = {
              name: comment?.user?.nickname || "Unknown",
              profile_picture: comment?.user?.profile_picture || "",
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
                nick: "Unknown",
                profile: "",
              },
              created_at: comment.created_at,
            };
          }
        })
      );

      return {
        message: "댓글 불러오기 완료",
        statusCode: StatusCodes.OK,
        posts: results,
      };
    } catch (error) {
      return {
        message: "댓글 불러오기 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async addCommentToPost(
    postId: number,
    userId: number,
    comment: string
  ) {
    const postRepository = AppDataSource.getRepository(Posts);
    const commentRepository = AppDataSource.getRepository(Comments);
    try {
      const post = await postRepository.findOne({ where: { id: postId } });

      if (!post) {
        return {
          message: "게시글을 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 로그인한 사용자가 댓글을 달 수 있는지 확인
      if (!userId) {
        return {
          message: "로그인한 사용자만 댓글을 달 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      const newCommentst = new Comments();
      (newCommentst.post_id = postId),
        (newCommentst.user_id = userId),
        (newCommentst.content = comment);

      const savedComment = await commentRepository.save(newCommentst);

      return {
        message: "댓글 작성 완료",
        statusCode: StatusCodes.OK,
        comment: {
          content: savedComment.content,
          created_at: savedComment.created_at,
        },
      };
    } catch (error) {
      return {
        message: "댓글 작성 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async updateComment(commentId: number, userId: number, comment: string) {
    const commentRepository = AppDataSource.getRepository(Comments);

    try {
      // 해당 댓글을 먼저 조회하여 작성자 ID 확인
      const existingComment = await commentRepository.findOne({
        where: { id: commentId },
      });

      if (!existingComment) {
        return {
          message: "수정할 댓글이 존재하지 않습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 댓글 작성자 ID가 로그인한 사용자 ID와 일치하는지 확인
      if (existingComment.user_id !== userId) {
        return {
          message: "댓글 작성자만 댓글을 수정할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // 댓글 내용 수정
      await commentRepository.update(
        { id: commentId },
        { content: comment } // 수정할 댓글 내용
      );

      // 수정된 댓글 정보 반환
      const updatedComment = await commentRepository.findOne({
        where: { id: commentId },
      });

      return {
        message: "댓글 수정 완료",
        statusCode: StatusCodes.OK,
        comment: {
          id: commentId,
          content: updatedComment?.content,
          created_at: updatedComment?.created_at,
          updated_at: updatedComment?.updated_at,
        },
      };
    } catch (error) {
      return {
        message: "댓글 수정 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteComment(postId: number, userId: number) {
    const commentRepository = AppDataSource.getRepository(Comments);

    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          message: "사용자를 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 해당 댓글을 먼저 조회하여 작성자 ID 확인
      const existingComment = await commentRepository.findOne({
        where: { id: postId },
      });

      if (!existingComment) {
        return {
          message: "수정할 댓글이 존재하지 않습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 댓글 작성자 ID가 로그인한 사용자 ID와 일치하는지 확인
      if (existingComment.user_id !== userId) {
        return {
          message: "댓글 작성자만 댓글을 삭제할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      const comment = await commentRepository.delete({
        id: postId,
        user: user,
      });

      return {
        message: "댓글 삭제 완료",
        statusCode: StatusCodes.OK,
        comment: {
          id: postId,
        },
      };
    } catch (error) {
      return {
        message: "댓글 삭제 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
