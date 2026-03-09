const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

// Ensure the output directory exists
if (!fs.existsSync("reels")) fs.mkdirSync("reels");

const quotes = JSON.parse(fs.readFileSync("quotes.json"));

function wrapText(text, maxChars = 32) {
  const words = text.split(" ");
  let lines = [];
  let current = "";
  for (let word of words) {
    if ((current + word).length > maxChars) {
      lines.push(current.trim());
      current = "";
    }
    current += word + " ";
  }
  if (current) lines.push(current.trim());
  return lines;
}

async function generateReels() {
  for (let index = 0; index < quotes.length; index++) {
    const quote = quotes[index];
    const lines = wrapText(quote);

    let filterChain = [
      {
        filter: "scale",
        options: { w: 120, h: -1 },
        inputs: "[1:v]",
        outputs: "[icon]",
      },
      {
        filter: "overlay",
        options: { x: 110, y: 700 },
        inputs: ["[0:v]", "[icon]"],
        outputs: "[bg]",
      },
    ];

    lines.forEach((line, i) => {
      const inputLabel = i === 0 ? "[bg]" : `[v${i - 1}]`;
      const outputLabel = `[v${i}]`;

      const escapedLine = line.replace(/:/g, "\\:").replace(/'/g, "'\\''");

      filterChain.push({
        filter: "drawtext",
        options: {
          fontfile: "fonts/Poppins-Regular.ttf",
          text: escapedLine,
          fontsize: 40,
          fontcolor: "white",
          x: 130,
          y: 850 + i * 55,
        },
        inputs: inputLabel,
        outputs: outputLabel,
      });
    });

    const lastTextLabel = `[v${lines.length - 1}]`;

    filterChain.push({
      filter: "drawtext",
      options: {
        fontfile: "fonts/Poppins-Light.ttf",
        text: "- Infinite Mentalities",
        fontsize: 35,
        fontcolor: "white",
        x: 130,
        y: 850 + lines.length * 55 + 40,
      },
      inputs: lastTextLabel,
    });

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input("black.jpg")
        .inputOptions(["-loop 1", "-t 5"])
        .input("q.png")
        .complexFilter(filterChain)
        .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-r 30"])
        .output(`reels/reel_${index}.mp4`)
        .on("start", (cmd) => console.log("Started FFmpeg:", cmd))
        .on("error", reject)
        .on("end", () => {
          console.log("Reel created:", index);
          resolve();
        })
        .run();
    });
  }
}

generateReels();
