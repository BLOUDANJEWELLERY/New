import express from "express";
import multer from "multer";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static frontend
app.use(express.static("public"));

app.post("/ocr", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Use native fetch and FormData (Node 18+ / Node 22)
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("language", "eng+ara");
    formData.append("isOverlayRequired", "false");

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: "K89185730788957" }, // Your OCR.Space API key
      body: formData
    });

    const data = await response.json();
    fs.unlinkSync(req.file.path); // delete uploaded file

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