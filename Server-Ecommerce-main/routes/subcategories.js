const express = require("express");
const router = express.Router();
const connection = require("../config/db");

router.get("/", (req, res) => {
  const { gender, category } = req.query;
  let query = "SELECT DISTINCT SubCategory FROM fashion WHERE 1=1";
  const params = [];

  if (gender && gender !== "All") {
    query += " AND Gender = ?";
    params.push(gender);
  }
  if (category) {
    query += " AND Category = ?";
    params.push(category);
  }

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results.map((row) => row.SubCategory));
  });
});

module.exports = router;
