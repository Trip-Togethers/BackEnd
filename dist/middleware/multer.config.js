"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Multer 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // 파일을 저장할 디렉토리 설정
    },
    filename: (req, file, cb) => {
        const unique_suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique_suffix}${path_1.default.extname(file.originalname)}`);
    },
});
// 파일 필터 설정
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true); // 이미지 파일은 허용
    }
    else {
        cb(null, false); // 이미지가 아닌 경우 요청을 거부
        // 또는 에러를 명시적으로 생성
        req.fileValidationError = "Only image files are allowed!"; // 커스텀 속성 설정
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
});
//# sourceMappingURL=multer.config.js.map