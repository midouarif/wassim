const express = require("express");
const connection = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  const { gender } = req.query;
  let query = "SELECT DISTINCT Category FROM fashion";
  const params = [];

  if (gender && gender !== "All") {
    query += " WHERE Gender = ?";
    params.push(gender);
  }

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results.map((row) => row.Category));
  });
});

module.exports = router;
