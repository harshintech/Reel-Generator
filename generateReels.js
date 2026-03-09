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

quotes.forEach((quote, index) => {
  const lines = wrapText(quote);

  // 1. Start by overlaying the quote icon (input 1) onto the background (input 0)
  // let filterChain = ["[0:v][1:v]overlay=130:750[bg]"];

  let filterChain = [
    {
      filter: "scale",
      options: { w: 120, h: -1 }, // Change 100 to your desired width
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

  // 2. Add text lines, each building on the previous result
  lines.forEach((line, i) => {
    const inputLabel = i === 0 ? "[bg]" : `[v${i - 1}]`;
    const outputLabel = `[v${i}]`;

    // Escaping text for FFmpeg (handling colons/commas)
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

  // 3. Add Author name to the final text output
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

  ffmpeg()
    .input("black.jpg")
    .inputOptions(["-loop 1", "-t 5"]) // Loop the background for 5 seconds
    .input("q.png")
    .complexFilter(filterChain)
    .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-r 30"])
    .output(`reels/reel_${index}.mp4`)
    .on("start", (cmd) => console.log("Started FFmpeg with command: " + cmd))
    .on("error", (err) => console.error("Error: " + err.message))
    .on("end", () => console.log("Reel created:", index))
    .run();
});
