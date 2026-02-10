const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = process.env.OFFICIAL_EMAIL || "test@chitkara.edu.in";

/* ---------- Math Utilities ---------- */

function fibonacci(n) {
  const res = [];
  if (n <= 0) return res;
  res.push(0);
  if (n === 1) return res;
  res.push(1);
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res;
}

function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
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
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

/* ---------- AI (FIXED PROPERLY) ---------- */

async function askAI(question) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=` +
    process.env.GEMINI_API_KEY;

  try {
    const payload = {
      prompt: {
        text: question
      },
      temperature: 0.7,
      candidateCount: 1
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Log the full response for debugging
    console.log("Full AI API Response:", JSON.stringify(data, null, 2));

    if (data && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].output || "Unknown";
    } else {
      throw new Error("Unexpected API response format");
    }
  } catch (error) {
    console.error("Error calling AI API:", error);
    return "Error: " + error.message;
  }
}

/* ---------- Routes ---------- */

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
        error: "Exactly one key required"
      });
    }

    const key = keys[0];
    let result;

    switch (key) {
      case "fibonacci":
        result = fibonacci(body.fibonacci);
        break;

      case "prime":
        result = body.prime.filter(isPrime);
        break;

      case "lcm":
        result = lcm(body.lcm);
        break;

      case "hcf":
        result = hcf(body.hcf);
        break;

      case "AI":
        result = await askAI(body.AI);
        break;

      default:
        throw new Error("Invalid key");
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

/* ---------- Start ---------- */

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
