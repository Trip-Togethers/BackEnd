import { body, param } from "express-validator";

export const validateAddTrip = [
  param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
  body("scheduleDate")
    .notEmpty()
    .withMessage("일정 날짜를 입력해주세요.")
    .isDate()
    .withMessage("올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요."),
  body("scheduleTime")
    .optional({ checkFalsy: true })
    .notEmpty()
    .matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/)
    .withMessage("유효한 시간을 입력해 주세요. 예시: 10:00"),
  body("scheduleContent")
    .notEmpty()
    .withMessage("일정 내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("내용은 2글자 이상으로 입력해주세요."),
];

export const validateEditDetailTrip = [
  param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
  param("activityId")
    .isInt()
    .withMessage("유효한 세부 일정 ID를 입력해 주세요."),
  body("detailId")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("일정 아이디를 입력해주세요."),
  body("scheduleDate")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("날짜를 입력해주세요.")
    .isDate()
    .withMessage("올바른 날짜 형식(YYYY-MM-DD)으로 입력해주세요."),
  body("scheduleTime")
    .optional({ checkFalsy: true })
    .notEmpty()
    .matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/)
    .withMessage("유효한 시간을 입력해 주세요. 예시: 10:00"),
  body("scheduleContent")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("내용을 입력해주세요.")
    .isLength({ min: 2 })
    .withMessage("내용은 2글자 이상으로 입력해주세요."),
];

export const validateRemoveDetailTrip = [
  body("detailId").notEmpty().withMessage("일정 아이디를 입력해주세요."),
  param("activityId")
    .isInt()
    .withMessage("유효한 세부 일정 ID를 입력해 주세요."),
];

export const validateTripId = [
  param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
];
