const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const archiver = require("archiver");

const app = express();
app.use(express.json());
app.use(express.static("frontend"));
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

console.log(__dirname + "\\frontend\\index.html");

const QUEUE_FILE = "quotes.json";

if (!fs.existsSync(QUEUE_FILE)) fs.writeFileSync(QUEUE_FILE, "[]");

// add quote to queue
app.post("/add-quote", (req, res) => {
  const { quote } = req.body;

  if (!quote) {
    return res.status(400).json({ message: "Quote is empty" });
  }

  const queue = JSON.parse(fs.readFileSync("quotes.json"));

  queue.push(quote);

  fs.writeFileSync("quotes.json", JSON.stringify(queue, null, 2));

  res.json({ message: "Quote added successfully" });
});
// generate reels
app.post("/generate", (req, res) => {
  exec("node generateReels.js", (err) => {
    if (err) return res.status(500).send("Generation failed");

    const output = fs.createWriteStream("reels.zip");
    const archive = archiver("zip");

    archive.pipe(output);
    archive.directory("reels", false);
    archive.finalize();

    output.on("close", () => {
      res.download("reels.zip", () => {
        // delete videos after download
        fs.rmSync("reels", { recursive: true, force: true });
        fs.mkdirSync("reels");

        fs.unlinkSync("reels.zip");
        fs.writeFileSync(QUEUE_FILE, "[]");
      });
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
