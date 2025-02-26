const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {  // Route is now "/words"
  db.query("SELECT ProductTitle FROM fashion", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    let words = new Set();
    results.forEach((row) => {
      let tokens = row.ProductTitle.toLowerCase().match(/\b\w+\b/g); 
      tokens?.forEach((word) => words.add(word));
    });

    res.json(Array.from(words));
  });
});

module.exports = router;
