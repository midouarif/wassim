const express = require("express");
const db = require("../config/db");
const axios = require("axios"); // Import axios to fetch existing endpoints

const router = express.Router();

// Fetch data from existing endpoints
async function fetchWords() {
  const response = await axios.get("http://localhost:3000/words");
  return response.data;
}

async function fetchClientWords() {
  const response = await axios.get("http://localhost:3000/clients");
  return response.data;
}

// Convert Product Titles into Binary Vectors
async function getProductVectors(vocabulary) {
  return new Promise((resolve, reject) => {
    db.query("SELECT ProductId, ProductTitle FROM fashion", (err, results) => {
      if (err) return reject(err);

      let productVectors = {};
      results.forEach((row) => {
        let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g) || [];
        let vector = vocabulary.map((word) => (tokens.includes(word) ? 1 : 0));
        productVectors[row.ProductId] = vector;
      });

      resolve(productVectors);
    });
  });
}

// Compare Client Vectors with Product Vectors
router.get("/", async (req, res) => {
  try {
    // Fetch data from existing endpoints
    const vocabulary = await fetchWords(); // ✅ Fetch global words
    const clientWords = await fetchClientWords(); // ✅ Fetch client words
    const productVectors = await getProductVectors(vocabulary); // ✅ Convert products to vectors

    // Convert Client Words to Binary Vectors
    let clientVectors = {};
    Object.keys(clientWords).forEach((user_id) => {
      clientVectors[user_id] = vocabulary.map((word) =>
        clientWords[user_id].includes(word) ? 1 : 0
      );
    });

    res.json({ vocabulary, clientVectors, productVectors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
