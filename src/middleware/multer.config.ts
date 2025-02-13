import multer from "multer";
import path from "path";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv"; 
//s
dotenv.config();

// S3 객체 생성
const s3 = new S3Client({
  region: `${process.env.REGION}`,
  credentials: {
    accessKeyId: `${process.env.ACCESS_KEY}`,
    secretAccessKey: `${process.env.SECRET_KEY}`,
  },
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

    const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${fileName}`;

	console.log(fileUrl);

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 파일 크기 제한
});

// S3에서 파일 삭제하는 함수
export const deleteFileFromS3 = async (fileName: string) => {
  try {
    const deleteParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName, // S3에 저장된 파일의 Key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log(`파일 삭제 성공: ${fileName}`);
  } catch (err) {
    console.error("파일 삭제 실패:", err);
  }
};
