const express = require("express");
const connection = require("../config/db");
const levenshteinDistance = require("../utils/levenshtein");
const Trie = require("../utils/trie");

const router = express.Router();
const trie = new Trie();

// Build Trie with Product Titles
connection.query("SELECT DISTINCT ProductTitle FROM fashion", (err, results) => {
  if (!err) {
    results.forEach((row) => trie.insert(row.ProductTitle));
  }
});

// Autocomplete
router.get("/autocomplete", (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery)
    return res.status(400).json({ error: "Search query is required." });

  const suggestions = trie.searchPrefix(searchQuery).slice(0, 5);
  res.json({ suggestions });
});

// Levenshtein Correction
// Levenshtein "Did you mean..." Endpoint
router.get("/levenshtein", (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery)
      return res.status(400).json({ error: "Search query is required." });

  connection.query("SELECT DISTINCT ProductTitle FROM fashion", (err, results) => {
      if (err) return res.status(500).json({ error: "Database error." });

      let words = searchQuery.split(" ");
      let firstWord = words[0].toLowerCase(); // Extract first word

      // Get all unique first words from product titles
      let firstWordsSet = new Set(results.map(row => row.ProductTitle.split(" ")[0].toLowerCase()));
      let firstWords = [...firstWordsSet];

      // Compute Levenshtein distance for first words only
      let distances = firstWords.map(word => ({
          word,
          distance: levenshteinDistance(firstWord, word)
      }));

      // Sort and get the closest match
      distances.sort((a, b) => a.distance - b.distance);
      let bestMatch = distances[0];

      // Define threshold (small mistakes allowed)
      const threshold = Math.max(2, Math.floor(firstWord.length * 0.6));

      // If a good correction is found, replace first word
      let correctedFirstWord = bestMatch.distance <= threshold ? bestMatch.word : firstWord;
      words[0] = correctedFirstWord;
      let correctedQuery = words.join(" "); // Rebuild query

      // Now, fetch all products that start with the corrected first word
      connection.query(
          "SELECT ProductTitle FROM fashion WHERE ProductTitle LIKE ?",
          [`${correctedFirstWord}%`], // Fetch all products starting with corrected first word
          (err, products) => {
              if (err) return res.status(500).json({ error: "Database error." });

              res.json({
                  correctedQuery,
                  didYouMean: correctedFirstWord !== firstWord ? correctedFirstWord : null,
                  matchingProducts: products.map(p => p.ProductTitle) // Return all matching products
              });
          }
      );
  });
});

module.exports = router;
