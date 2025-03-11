const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  const query = `
    SELECT users.user_id, users.rating, fashion.ProductTitle 
    FROM users 
    JOIN fashion ON users.product_id = fashion.ProductId
    WHERE users.rating > 5`;

  db.query(query, (err, results) => {
    if (err) {
      // Send error response and exit the function
      return res.status(500).json({ error: err.message });
    }

    // Define clientWords inside the callback
    let clientWords = {};

    results.forEach((row) => {
      // Tokenize the product title into words
      let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g);
      if (tokens) {
        // Initialize a new Set for the user if not already defined
        if (!clientWords[row.user_id]) {
          clientWords[row.user_id] = new Set();
        }
        tokens.forEach((word) => {
          clientWords[row.user_id].add(word);
        });
      }
    });

    // Convert Sets to Arrays for a JSON-friendly structure
    let clientWordsArray = {};
    for (let user in clientWords) {
      clientWordsArray[user] = Array.from(clientWords[user]);
    }

    // Send the response once
    res.json(clientWordsArray);
  });
});

module.exports = router;
