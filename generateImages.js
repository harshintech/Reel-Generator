const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

if (!fs.existsSync("reels")) fs.mkdirSync("reels");

const quotes = JSON.parse(fs.readFileSync("quotes.json"));

async function generate() {
  const background = await loadImage("black.jpg");
  const quoteIcon = await loadImage("q.png");

  for (let i = 0; i < quotes.length; i++) {
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, 1080, 1920);

    ctx.drawImage(quoteIcon, 110, 700, 120, 120);

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";

    let text = quotes[i];
    let y = 850;

    const words = text.split(" ");
    let line = "";

    words.forEach((word) => {
      const testLine = line + word + " ";
      const width = ctx.measureText(testLine).width;

      if (width > 800) {
        ctx.fillText(line, 130, y);
        line = word + " ";
        y += 55;
      } else {
        line = testLine;
      }
    });

    ctx.fillText(line, 130, y);

    ctx.font = "35px Arial";
    ctx.fillText("- Infinite Mentalities", 130, y + 70);

    const buffer = canvas.toBuffer("image/png");

    fs.writeFileSync(`reels/reel_${i}.png`, buffer);

    console.log("Image created:", i);
  }
}

generate();
