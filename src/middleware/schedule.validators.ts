import { body, header } from "express-validator";

export const validateAddTrip = [
     body("title")
        .notEmpty()
        .withMessage("제목을 입력해 주세요")
        .isLength({ min: 3, max: 50 })
        .withMessage("제목은 3자 이상, 50자 이하로 입력해 주세요."),
       body("startDate")
        .isDate()
        .withMessage("시작일을 올바르게 입력해 주세요"),
       body("endDate")
        .isDate()
        .withMessage("종료일을 올바르게 입력해 주세요")
        .custom((value, { req }) => {
          const startDate = new Date(req.body.startDate);
          const endDate = new Date(value);
    
          if (startDate > endDate) {
            throw new Error("종료일은 시작일보다 늦어야 합니다.");
          }
          return true;
        }),
       body("destination")
        .notEmpty()
        .withMessage("목적지를 입력해 주세요"),
]