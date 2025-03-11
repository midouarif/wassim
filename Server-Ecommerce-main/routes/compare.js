const express = require("express");
const db = require("../config/db");
const axios = require("axios");

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

// Convert Product Titles into TF*IDF Vectors and compute IDF values
async function getProductVectors(vocabulary) {
  return new Promise((resolve, reject) => {
    db.query("SELECT ProductId, ProductTitle FROM fashion", (err, results) => {
      if (err) return reject(err);

      const N = results.length; // Total number of documents
      const documentFrequency = {}; // Count of documents containing each word

      // document frequency for each term
      results.forEach((row) => {
        let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach((word) => {
          documentFrequency[word] = (documentFrequency[word] || 0) + 1;
        });
      });

      // Calculate IDF for each word in vocabulary
      const idf = {};
      vocabulary.forEach((word) => {
        let n = documentFrequency[word] || 1; 
        idf[word] = Math.log(N / n);
      });

      let productVectors = {};
      // TF*IDF vector
      results.forEach((row) => {
        let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g) || [];
        const tokenCount = tokens.length;
        // If no tokens
        if (tokenCount === 0) {
          productVectors[row.ProductId] = vocabulary.map(() => 0);
          return;
        }
        // Calculate tf for the document
        const tf = {};
        tokens.forEach((word) => {
          tf[word] = (tf[word] || 0) + 1;
        });

        // Build the TF*IDF vector
        let vector = vocabulary.map((word) => {
          let termFrequency = tf[word] ;
          return termFrequency * idf[word];
        });

        productVectors[row.ProductId] = vector;
      });

      resolve({ productVectors, idf });
    });
  });
}

// Compare Client Vectors with Product Vectors using TF*IDF weighting
router.get("/", async (req, res) => {
  try {
    // Fetch vocabulary and client words from endpoints
    const vocabulary = await fetchWords(); 
    const clientWords = await fetchClientWords(); 
    
    // Get product vectors along with the computed IDF values
    const { productVectors, idf } = await getProductVectors(vocabulary);

    // Convert Client Words into TF*IDF Vectors
    let clientVectors = {};
    Object.keys(clientWords).forEach((user_id) => {
      const tokens = clientWords[user_id]; // Array of words for the client
      const totalWords = tokens.length;
      // Calculate term frequency for the client's words
      const tf = {};
      tokens.forEach((word) => {
        tf[word] = (tf[word] || 0) + 1;
      });
      
      // Build the TF*IDF vector for the client using the same vocabulary and idf values
      let vector = vocabulary.map((word) => {
        let termFrequency = (tf[word] || 0) / totalWords;
        return termFrequency * (idf[word] || 0);
      });
      
      clientVectors[user_id] = vector;
    });

    // Return the results as JSON
    res.json({ vocabulary, clientVectors, productVectors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
