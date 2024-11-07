const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const imageKit = require("../config/imagekit");
const validateUpdateImageRequest = require("../middlewares/validateRequest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

router.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if(!req.file || !req.body.title || !req.body.description) {
            return res.status(400).json({message: "Please fill all the fields"});
        } else {
            const customName = `${Date.now()}-${uuidv4()}`;

            const result = await imageKit.upload({
                file: req.file.buffer,
                fileName: customName,
            });

            const saveImage = await prisma.image.create({
                data: {
                    title: req.body.title,
                    description: req.body.description,
                    url: result.url,
                    imageKitFileId: result.fileId
                },
            });

            res.status(200).json({ message: "File uploaded successfully", url: result.url, saveImage });
        }
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
});

router.get("/image-list", async (req, res) => {
    try {
        const imageDetails = await prisma.image.findMany();
        res.status(200).json({ message: "Image lists fetched successfully", imageDetails });
    } catch(error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});

router.get("/image-list/:title", async (req, res) => {
    const { title } = req.params;
    try {
        const imageDetails = await prisma.image.findMany({
            where: {
                title: {
                    contains: title,
                    mode: "insensitive"
                },
            },
        });

        if(imageDetails.length) {
            res.status(200).json({ message: "Image details fetched successfully", imageDetails });
        } else {
            res.status(404).json({ message: "Image details not found", imageDetails });
        }
    } catch(error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});

router.put("/image-update/:id", upload.single("image"), validateUpdateImageRequest,  async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const existingImage = await prisma.image.findUnique({
            where: { id: parseInt(id) },
        });

        if(!existingImage) {
            return res.status(404).json({ message: "Image not found" });
        }

        const oldImageFileId = existingImage.imageKitFileId;

        if(oldImageFileId) {
            try {
                await imageKit.deleteFile(oldImageFileId);
                console.log(`Deleted old image with id: ${oldImageFileId}`);
            } catch(deleteError) {
                return res.status(500).json({ message: "Failed to delete old image", deleteError });
            }
            
        }
        
        let newUrl = existingImage.url;
        let newImageFileId = oldImageFileId;

        if (req.file) {
            const customName = `${Date.now()}-${uuidv4()}`;
            const newImageUpload = await imageKit.upload({
                file: req.file.buffer,
                fileName: customName,
            });

            newUrl = newImageUpload.url;
            newImage = newImageUpload.fileId;
        }

        const updateImage = await prisma.image.update({
            where: { id: parseInt(id) },
            data: {
                title: title || existingImage.title,
                description: description || existingImage.description,
                url: newUrl,
                imageKitField: newImageFileId,
            },
        });
        res.status(200).json({ message: "Image updated", updateImage });
    } catch (error) {
        res.status(500).json({ message: "Failed to update the image", error });
    }
});

router.delete("/image-delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const image = await prisma.image.findUnique({
            where: { id: parseInt(id) },
        });

        if(!image) {
            return res.status(404).json({ message: "Image not found" });
        } else {
            const imageKitFileId = image.imageKitFileId;

            if(imageKitFileId) {
                try {
                    await imageKit.deleteFile(imageKitFileId);
                    console.log(`Deleted image with id: ${imageKitFileId}`);
                } catch(error) {
                    return res.status(500).json({ message: "Failed to delete image", error });
                }
            }

            await prisma.image.delete({
                where: { id: parseInt(id) },
            });

            res.status(200).json({ message: "Image deleted successfully" });
        }
    } catch(error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});

module.exports = router;