export interface GetPostByIdParams {
    post_id: string;
}
  
export interface UpdatePostBody {
  post_title?: string;
  post_content?: string;
  post_photoUrl?: string;
}

export interface addCommentToPostBody {
  content?: string;
  post_id?: number;
  user_id?: number;
}

export interface GetCommentByIdParams {
  comment_id: number;
}

export interface updateCommentBody {
  content?: string;
}

export interface GetCalendarByIdParams {
  user_id: number;
}