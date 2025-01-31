import { param } from "express-validator";

export const validateTripId = [
  param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
];

export const validateInvite = [
    param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
    param("userId").isInt().withMessage("유효한 초대자 ID를 입력해 주세요."),
    param("inviteCode")
      .isString()
      .isLength({ min: 16, max: 32 })
      .withMessage("올바른 초대 코드를 입력해 주세요."),
  ];

  export const validateRemoveGuest = [
    param("tripId").isInt().withMessage("유효한 여행 ID를 입력해 주세요."),
    param("guestId").isInt().withMessage("유효한 동행자 ID를 입력해 주세요."),
  ];