import express from "express";
import multer from "multer";
import fs from "fs";
import { ocrSpace } from "ocr-space-api-wrapper";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/ocr", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const result = await ocrSpace(req.file.path, {
      apiKey: "K89185730788957", // Your OCR.Space API key
      language: "eng+ara",
    });

    fs.unlinkSync(req.file.path); // delete uploaded file

    if (result.ParsedResults && result.ParsedResults.length > 0) {
      res.json({ text: result.ParsedResults[0].ParsedText });
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