import { body } from "express-validator";

export const validateCreatePost = [
  body("trip_id")
    .notEmpty()
    .withMessage("여행 ID를 입력해주세요.")
    .isInt()
    .withMessage("여행 ID는 숫자 형식이어야 합니다."),
  
  body("post_title")
    .notEmpty()
    .withMessage("게시글 제목을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("게시글 제목은 1글자 이상으로 입력해주세요."),
  
  body("post_content")
    .notEmpty()
    .withMessage("게시글 내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("게시글 내용은 2글자 이상으로 입력해주세요."),
];
