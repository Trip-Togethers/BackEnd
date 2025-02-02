export interface GetPostByIdParams {
    postId: string;
}
  
export interface UpdatePostBody {
  postTitle?: string;
  postContent?: string;
  postPhotoUrl?: string;
}

export interface addCommentToPostBody {
  content?: string;
  postId?: number;
  userId?: number;
}

export interface GetCommentByIdParams {
  commentId: number;
}

export interface updateCommentBody {
  content?: string;
}

export interface GetCalendarByIdParams {
  userId: number;
}