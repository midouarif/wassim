const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "m12032003",
  database: "ecommerce",
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.stack);
    process.exit(1);
  }
  console.log("Connected to MySQL with ID", connection.threadId);
});

module.exports = connection;
