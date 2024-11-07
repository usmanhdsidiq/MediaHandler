const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const uploadRouter = require("./routes/imageHandler");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("home");
});
app.use("/api", uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})