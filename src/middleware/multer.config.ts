import multer from "multer";
import path from "path";

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일을 저장할 디렉토리 설정 
  },
  filename: (req, file, cb) => {
    const unique_suffix  = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique_suffix}${path.extname(file.originalname)}`);
  },
});

// 파일 필터 설정
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // 이미지 파일은 허용
  } else {
    cb(null, false); // 이미지가 아닌 경우 요청을 거부
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },    // 파일 크기 제한
}); 
