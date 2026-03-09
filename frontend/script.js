async function addQuote() {
  const quote = document.getElementById("quote").value;

  const res = await fetch("/add-quote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quote }),
  });

  const data = await res.json();

  document.getElementById("status").innerText = data.message;

  document.getElementById("quote").value = "";
}

async function generate() {
  document.getElementById("status").innerText = "Generating videos...";

  const response = await fetch("/generate", {
    method: "POST",
  });

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reels.zip";
  a.click();
}
