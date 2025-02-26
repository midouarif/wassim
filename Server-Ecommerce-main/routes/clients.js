const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  const query = `
    SELECT users.user_id, users.rating, fashion.ProductTitle 
    FROM users 
    JOIN fashion ON users.product_id = fashion.ProductId
    WHERE users.rating > 5`;  // ✅ Fetch all high-rated products per user

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    let clientWords = {};

    results.forEach((row) => {
      let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g);
      if (tokens) {
        if (!clientWords[row.user_id]) {
          clientWords[row.user_id] = new Set(); // ✅ Accumulate words across products
        }
        tokens.forEach((word) => clientWords[row.user_id].add(word));
      }
    });

    // Convert Sets to Arrays
    let clientWordsArray = {};
    for (let user in clientWords) {
      clientWordsArray[user] = Array.from(clientWords[user]);
    }

    res.json(clientWordsArray);
  });
});

module.exports = router;
