const express = require("express");
const cors = require("cors");

const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const subcategoriesRoutes = require("./routes/subcategories");
const gendersRoutes = require("./routes/genders");
const searchRoutes = require("./routes/search");
const wordsRoutes = require("./routes/words"); // ✅ Words endpoint
const clientsRoutes = require("./routes/clients"); // ✅ Clients endpoint
const compareRoutes = require("./routes/compare");
 // ✅ Compare endpoint

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/subcategories", subcategoriesRoutes);
app.use("/genders", gendersRoutes);
app.use("/search", searchRoutes);
app.use("/words", wordsRoutes);
app.use("/clients", clientsRoutes); // ✅ Add clients endpoint
app.use("/compare", compareRoutes); // ✅ Add compare endpoint

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
