import express, { Request, Response } from 'express';
import upload from '../middleware/upload.middleware';

const router = express.Router();

// 단일 파일 업로드
router.post('/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = (req.file as Express.MulterS3.File).location; // S3 업로드된 파일 URL
    res.json({ message: 'File uploaded successfully', fileUrl });
});

// 다중 파일 업로드 (최대 5개)
router.post('/uploads', upload.array('images', 5), (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.MulterS3.File[]).length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = (req.files as Express.MulterS3.File[]).map((file) => file.location);
    res.json({ message: 'Files uploaded successfully', files });
});

export default router;
