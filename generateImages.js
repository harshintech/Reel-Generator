// const fs = require("fs");
// const { createCanvas, loadImage, registerFont } = require("canvas");

// registerFont("fonts/Poppins-Regular.ttf", { family: "Poppins" });
// registerFont("fonts/Poppins-Light.ttf", { family: "PoppinsLight" });

// if (!fs.existsSync("reels")) fs.mkdirSync("reels");

// const quotes = JSON.parse(fs.readFileSync("quotes.json"));

// async function generate() {
//   const background = await loadImage("black.jpg");
//   const quoteIcon = await loadImage("q.png");

//   for (let i = 0; i < quotes.length; i++) {
//     const canvas = createCanvas(1080, 1920);
//     const ctx = canvas.getContext("2d");

//     ctx.drawImage(background, 0, 0, 1080, 1920);
//     ctx.drawImage(quoteIcon, 110, 700, 120, 120);

//     ctx.fillStyle = "white";
//     ctx.font = "40px Poppins";

//     let text = quotes[i];
//     let y = 850;

//     const words = text.split(" ");
//     let line = "";

//     words.forEach((word) => {
//       const testLine = line + word + " ";
//       const width = ctx.measureText(testLine).width;

//       if (width > 800) {
//         ctx.fillText(line, 130, y);
//         line = word + " ";
//         y += 55;
//       } else {
//         line = testLine;
//       }
//     });

//     ctx.fillText(line, 130, y);

//     ctx.font = "35px PoppinsLight";
//     ctx.fillText("- Infinite Mentalities", 130, y + 70);

//     const buffer = canvas.toBuffer("image/png");

//     fs.writeFileSync(`reels/reel_${i}.png`, buffer);

//     console.log("Image created:", i);
//   }
// }

// generate();

const fs = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");

// Register fonts
registerFont("fonts/Poppins-Regular.ttf", { family: "Poppins" });
registerFont("fonts/Poppins-Light.ttf", { family: "PoppinsLight" });
registerFont("fonts/Poppins-Bold.ttf", { family: "PoppinsBold" });

// ensure reels folder exists
if (!fs.existsSync("reels")) fs.mkdirSync("reels");

const quotes = JSON.parse(fs.readFileSync("quotes.json"));

function getImportantWords(text) {
  const stopWords = [
    "the",
    "is",
    "and",
    "to",
    "of",
    "in",
    "a",
    "on",
    "for",
    "with",
    "this",
    "that",
    "i",
    "am",
  ];

  return text
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 4 && !stopWords.includes(word));
}

async function generate() {
  const background = await loadImage("black.jpg");
  const quoteIcon = await loadImage("q.png");

  for (let i = 0; i < quotes.length; i++) {
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(background, 0, 0, 1080, 1920);

    ctx.drawImage(quoteIcon, 110, 700, 120, 120);

    const text = quotes[i];

    const importantWords = getImportantWords(text);

    let x = 130;
    let y = 850;

    const words = text.split(" ");

    words.forEach((word) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "");
      const isBold = importantWords.includes(cleanWord);

      ctx.font = isBold ? "40px PoppinsBold" : "40px Poppins";
      ctx.fillStyle = "white";

      const width = ctx.measureText(word + " ").width;

      if (x + width > 900) {
        x = 130;
        y += 55;
      }

      ctx.fillText(word, x, y);

      x += width;
    });

    ctx.font = "35px PoppinsLight";
    ctx.fillText("- Infinite Mentalities", 130, y + 80);

    const buffer = canvas.toBuffer("image/png");

    fs.writeFileSync(`reels/reel_${i}.png`, buffer);

    console.log("Image created:", i);
  }
}

generate();
