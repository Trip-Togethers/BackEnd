import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { Posts, Comments, Likes } from "../entities/community.entity";
import { User } from "../entities/user.entity";
import { deleteFileFromS3 } from "../middleware/multer.config";
export class CommunityServices {
  static async getAllPosts() {
    try {
      const postRepository = AppDataSource.getRepository(Posts);
      const commentRepository = AppDataSource.getRepository(Comments);
      const likeRepository = AppDataSource.getRepository(Likes);
      const userRepository = AppDataSource.getRepository(User);

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
              .where("comments.postId = :postId", { postId: post.id })
              .getCount();

            // 좋아요 수 가져오기
            const likesCount = await likeRepository
              .createQueryBuilder("likes")
              .where("likes.postId = :postId", { postId: post.id })
              .getCount();

              // 작성자 정보 가져오기 (User 테이블에서 nickname, profilePicture 가져오기)
            const user = await userRepository.findOne({
              where: { id: post.userId }, // 작성자의 userId로 User 테이블에서 정보 찾기
            });

            // 작성자 정보 가져오기
            const author = {
              name: user?.nickname || "Unknown",
              profilePicture: user?.profilePicture || "",
            };

            return {
              id: post.id,
              postTitle: post.postTitle,
              postContent: post.postContent,
              author: {
                nick: author.name,
                profile: author.profilePicture,
              },
              tripId: post.tripId,
              createdAt: post.createdAt,
              likes: likesCount,
              comments_count: commentsCount,
            };
          } catch (error) {
            return {
              id: post.id,
              postTitle: post.postTitle,
              postContent: post.postContent,
              author: {
                nick: "Unknown",
                profile: "",
              },
              createdAt: post.createdAt,
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
      newPost.tripId = params.tripId;
      newPost.postTitle = params.postTitle;
      newPost.postPhotoUrl = params.imageUrl;
      newPost.postContent = params.postContent;
      newPost.userId = params.userId;

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
    const userRepository =AppDataSource.getRepository(User);
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
        .where("comments.postId = :postId", { postId: postId })
        .getCount();
      // 좋아요 수 가져오기
      const likesCount = await likeRepository
        .createQueryBuilder("likes")
        .where("likes.postId = :postId", { postId: postId })
        .getCount();
      // 작성자 정보 가져오기
      // 작성자 정보 가져오기 (User 테이블에서 nickname, profilePicture 가져오기)
      const user = await userRepository.findOne({
        where: { id: post.userId }, // 작성자의 userId로 User 테이블에서 정보 찾기
      });

      // 작성자 정보 가져오기
      const author = {
        name: user?.nickname || "Unknown",
        profilePicture: user?.profilePicture || "",
      };

      return {
        message: "게시글 상세정보 불러오기 완료",
        statusCode: StatusCodes.OK,
        post: {
          id: postId,
          postTitle: post?.postTitle,
          postContent: post?.postContent,
          postPhotoUrl: post?.postPhotoUrl,
          author: {
            nick: author.name,
            profile: author.profilePicture,
          },
          createdAt: post?.createdAt,
          updatedAt: post?.updatedAt,
          likes: likesCount,
          comments_count: commentsCount,
          tripId: post.tripId
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

      if (post.userId !== userId) {
        return {
          message: "작성만 수정할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      if (params.postTitle) post.postTitle = params.postTitle
      if (params.imageUrl) post.postPhotoUrl = params.imageUrl
      if (params.postContent) post.postContent = params.postContent      
      if (params.tripId) post.tripId = params.tripId
      
      await AppDataSource.getRepository(Posts).save(post);

      return {
        message: "게시글 수정 완료",
        statusCode: StatusCodes.OK,
        post: {
          id: postId,
          postTitle: post?.postTitle,
          postContent: post?.postContent,
          postPhotoUrl: post?.postPhotoUrl,
          updatedAt: post?.updatedAt,
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
      if (post.userId !== userId) {
        return {
          message:
            "삭제 권한이 없습니다. 다른 사용자의 게시글은 삭제할 수 없습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // S3 이미지 삭제
      const fileName = post.postPhotoUrl.split("/").pop(); // URL에서 파일 이름 추출
      if (fileName) {
        await deleteFileFromS3(fileName); // S3에서 파일 삭제
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
        where: { postId: postId, userId: userId },
      });
  
      if (existingLike) {
        // 이미 좋아요를 눌렀다면 -> 좋아요 취소
        await likeRepository.delete({ postId: postId, userId: userId });
  
        // 삭제 후 좋아요 수 갱신
        const updatedLikes = await likeRepository.count({ where: { postId: postId } });
  
        return {
          message: "좋아요 취소 완료",
          statusCode: StatusCodes.OK,
          post: { id: postId, likes: updatedLikes },
        };
      } else {
        // 좋아요 추가
        await likeRepository.insert({ postId: postId, userId: userId });
  
        // 좋아요 수 갱신
        const updatedLikes = await likeRepository.count({ where: { postId: postId } });
  
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
        where: { postId: postId },
      });
      console.log("가져온 댓글 데이터:", comments);

      const results = await Promise.all(
        comments.map(async (comment) => {
          try {
            // 작성자 정보 가져오기
            const author = {
              name: comment?.nickname || "익명", // nickname을 바로 사용
              profilePicture: comment?.user?.profilePicture || "", // 프로필 사진
            };

            return {
              id: comment.id,
              content: comment.content,
              author: {
                nick: author.name,
                profile: author.profilePicture,
              },
              createdAt: comment.createdAt,
            };
          } catch (error) {
            return {
              id: comment.id,
              content: comment.content,
              author: {
                nick: "익명", // nickname을 사용할 수 없으면 익명
                profile: "",
              },
              createdAt: comment.createdAt,
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
    const userRepository = AppDataSource.getRepository(User);
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

      // 사용자의 닉네임 조회
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return {
          message: "사용자 정보를 찾을 수 없습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }
      
      const newCommentst = new Comments();
      newCommentst.postId = postId;
      newCommentst.userId = user.id;
      newCommentst.content = comment;
      newCommentst.nickname = user.nickname; // nickname 저장

      const savedComment = await commentRepository.save(newCommentst);

      return {
        message: "댓글 작성 완료",
        statusCode: StatusCodes.OK,
        comment: {
          content: savedComment.content,
          createdAt: savedComment.createdAt,
          author: {
            nick: savedComment.nickname || "익명", // 사용자의 닉네임 추가
            profile: user.profilePicture || "", // 사용자 프로필 이미지 추가 (없을 경우 빈 문자열)
          },
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
      if (existingComment.userId !== userId) {
        return {
          message: "댓글 작성자만 댓글을 수정할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // 댓글 내용 수정
      await commentRepository.update(commentId, { content: comment });

      // // 수정된 댓글 정보 반환
      // const updatedComment = await commentRepository.findOne({
      //   where: { id: commentId },
      // });

      return {
        message: "댓글 수정 완료",
        statusCode: StatusCodes.OK,
        comment: {
          id: commentId,
          content: comment, // 이미 수정된 content를 반환
          updatedAt: new Date(), // 수정된 시간
        },
      };
    } catch (error) {
      return {
        message: "댓글 수정 중 오류가 발생했습니다.",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  static async deleteComment(commentId: number,postId: number, userId: number) {
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
        where: { userId: userId },
      });

      if (!existingComment) {
        return {
          message: "수정할 댓글이 존재하지 않습니다.",
          statusCode: StatusCodes.NOT_FOUND,
        };
      }
      // 댓글 작성자 ID가 로그인한 사용자 ID와 일치하는지 확인
      if (existingComment.userId !== userId) {
        return {
          message: "댓글 작성자만 댓글을 삭제할 수 있습니다.",
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      await commentRepository.delete({ id: commentId });

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
