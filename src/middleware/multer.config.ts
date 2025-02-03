import multer from "multer";
import path from "path";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv"; 

dotenv.config();

// S3 객체 생성
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: `${process.env.MINIO_ACCESS_KEY}`,
    secretAccessKey: `${process.env.MINIO_SECRET_KEY}`,
  },
  forcePathStyle: true, // path style 사용
});

// S3 객체 사용
export const uploadParams = async (filePath: string, fileName: string) => {
  try {
    const fileStream = fs.createReadStream(filePath);

    const upload = new Upload({
      client: s3,
      params: { Bucket: process.env.BUCKET_NAME, Key: fileName, Body: fileStream },
    });

    const data = await upload.done();
    console.log("파일 업로드 성공:");

    const fileUrl = `${process.env.BUCKET_NAME}/${fileName}`;

    // 업로드 완료 후 로컬 파일 삭제
    fs.unlinkSync(filePath); // 로컬 파일 삭제
    console.log("로컬 파일 삭제 완료");

    return fileUrl;
  } catch (err) {
    console.error("파일 업로드 실패:", err);
  }
};

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일을 저장할 디렉토리 설정
  },
  filename: (req, file, cb) => {
    const unique_suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한
});