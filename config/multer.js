const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { filesize: 5 * 1024 * 1024 }, // File size limit to 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed!"), false);
        }
    },
})

module.exports = upload;