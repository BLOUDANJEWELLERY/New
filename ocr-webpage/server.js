import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve frontend
app.use(express.static("public"));

// OCR endpoint
app.post("/ocr", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const formData = new FormData();
  formData.append("file", fs.createReadStream(req.file.path));
  formData.append("language", "eng+ara");
  formData.append("isOverlayRequired", "false");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: "K89185730788957" }, // Replace with your API key
      body: formData
    });

    const data = await response.json();
    // Delete file after processing
    fs.unlinkSync(req.file.path);

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      res.json({ text: data.ParsedResults[0].ParsedText });
    } else {
      res.json({ text: "No text detected." });
    }
  } catch (err) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));