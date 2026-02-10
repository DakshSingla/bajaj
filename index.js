const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// node-fetch fix for CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config();

console.log("Starting server...");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.OFFICIAL_EMAIL || "test@chitkara.edu.in";

// ---------- Utility Functions ----------

function fibonacci(n) {
  if (n <= 0) return [];
  const res = [0];
  if (n === 1) return res;
  res.push(1);
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res;
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  const lcmTwo = (a, b) => (a * b) / gcd(a, b);
  return arr.reduce((a, b) => lcmTwo(a, b));
}

async function askAI(question) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=` +
    process.env.GEMINI_API_KEY;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }]
    })
  });

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.split(" ")[0] || "Unknown"
  );
}

// ---------- Routes ----------

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let result;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(body.fibonacci) || body.fibonacci < 0)
          throw new Error("Invalid fibonacci input");
        result = fibonacci(body.fibonacci);
        break;

      case "prime":
        if (!Array.isArray(body.prime))
          throw new Error("Invalid prime input");
        result = body.prime.filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body.lcm))
          throw new Error("Invalid lcm input");
        result = lcm(body.lcm);
        break;

      case "hcf":
        if (!Array.isArray(body.hcf))
          throw new Error("Invalid hcf input");
        result = hcf(body.hcf);
        break;

      case "AI":
        if (typeof body.AI !== "string")
          throw new Error("Invalid AI input");
        result = await askAI(body.AI);
        break;

      default:
        throw new Error("Unknown key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      error: err.message
    });
  }
});

// ---------- Start Server ----------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
