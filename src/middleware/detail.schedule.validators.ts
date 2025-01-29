import { body } from "express-validator";

export const validateDetailTrip = [
  body("scheduleDate")
    .notEmpty()
    .withMessage("일정 날짜를 입력해주세요.")
    .isDate()
    .withMessage("올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요."),
  body("scheduleTime").notEmpty().withMessage("일정 시간을 입력해주세요."),
  body("scheduleContent")
    .notEmpty()
    .withMessage("일정 내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("내용은 2글자 이상으로 입력해주세요."),
];

export const validateEditDetailTrip = [
  body("detailId").notEmpty().withMessage("일정 아이디를 입력해주세요."),
  body("scheduleDate")
    .notEmpty()
    .withMessage("날짜를 입력해주세요.")
    .isDate()
    .withMessage("올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요."),
  body("scheduleTime").notEmpty().withMessage("시간을 입력해주세요."),
  body("scheduleContent")
    .notEmpty()
    .withMessage("내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("내용은 2글자 이상으로 입력해주세요."),
];

export const validateRemoveDetailTrip = [
  body("detailId").notEmpty().withMessage("일정 아이디를 입력해주세요."),
]