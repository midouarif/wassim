const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
  connection.query("SELECT DISTINCT Gender FROM fashion", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    // Include an "All" option for filtering on the frontend
    res.json(["All", ...results.map((row) => row.Gender)]);
  });
});

module.exports = router;
