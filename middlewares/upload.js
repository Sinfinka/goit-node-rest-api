import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const uploadPath = path.resolve("tmp");
    callback(null, uploadPath);
  },
  filename(req, file, callback) {
    const extname = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extname);
    const suffix = crypto.randomUUID();
    const fileName = `${basename}-${suffix}${extname}`;
    callback(null, fileName);
  },
});

const uploadMiddleware = multer({ storage });
export default uploadMiddleware;
