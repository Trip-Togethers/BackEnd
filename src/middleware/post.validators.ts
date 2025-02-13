import { body } from "express-validator";

export const validateCreatePost = [
  body("postTitle")
    .notEmpty()
    .withMessage("게시글 제목을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("게시글 제목은 1글자 이상으로 입력해주세요."),
  
  body("postContent")
    .notEmpty()
    .withMessage("게시글 내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("게시글 내용은 2글자 이상으로 입력해주세요."),
];
