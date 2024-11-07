function validateUpdateImageRequest(req, res, next) {
    const { title, description } = req.body;

    if(!title && !description && !req.file) {
        return res.status(400).json({ message: "Please fill at least one field" });
    }
    next();

}

module.exports = validateUpdateImageRequest;