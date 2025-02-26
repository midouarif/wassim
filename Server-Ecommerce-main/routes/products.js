const express = require("express");
const connection = require("../config/db");

const router = express.Router();

router.get("/", (req, res) => {
  const { gender, category, subcategory, search } = req.query;
  let query = "SELECT * FROM fashion WHERE 1=1";
  const params = [];

  if (gender && gender !== "All") {
    query += " AND Gender = ?";
    params.push(gender);
  }
  if (category) {
    query += " AND Category = ?";
    params.push(category);
  }
  if (subcategory) {
    query += " AND SubCategory = ?";
    params.push(subcategory);
  }
  if (search) {
    query += " AND ProductTitle LIKE ?";
    params.push(`%${search}%`);
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Products query error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;
