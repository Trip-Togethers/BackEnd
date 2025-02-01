import { body } from "express-validator";

export const validateInsertMap = [
  body("name")
    .notEmpty()
    .withMessage("장소 이름을 입력해주세요."),
  
  body("address_name")
    .notEmpty()
    .withMessage("주소를 입력해주세요."),
  
  body("latitude")
    .notEmpty()
    .withMessage("위도를 입력해주세요.")
    .isInt()
    .withMessage("위도는 숫자 형식이어야 합니다."),
  
    body("longitude")
    .notEmpty()
    .withMessage("경도를 입력해주세요..")
    .isInt()
    .withMessage("경도는 숫자 형식이어야 합니다."),
];
