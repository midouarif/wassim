// ShopPage.js
import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import ProductItem from "../components/ProductItem";

const ITEMS_PER_PAGE = 50;

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Fetch initial data (genders and products)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [gendersRes, productsRes] = await Promise.all([
          fetch("http://localhost:3000/genders"),
          fetch("http://localhost:3000/products"),
        ]);
        const gendersData = await gendersRes.json();
        const productsData = await productsRes.json();

        setGenders(gendersData);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch categories based on selected gender
  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedGender === "All") {
        setCategories([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/categories?gender=${selectedGender}`
        );
        const data = await response.json();
        setCategories(data);
        setSelectedCategory("");
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [selectedGender]);

  // Fetch subcategories based on selected gender and category
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory || selectedGender === "All") {
        setSubcategories([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3000/subcategories?gender=${selectedGender}&category=${selectedCategory}`
        );
        const data = await response.json();
        setSubcategories(data);
        setSelectedSubcategory("");
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
      }
    };
    fetchSubcategories();
  }, [selectedGender, selectedCategory]);

  // Fetch products based on filters and search term
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedGender !== "All") params.append("gender", selectedGender);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
        if (searchTerm) params.append("search", searchTerm);

        const response = await fetch(`http://localhost:3000/products?${params}`);
        const data = await response.json();

        setProducts(data);
        setFilteredProducts(data);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedGender, selectedCategory, selectedSubcategory, searchTerm]);

  // Fetch suggestions (autocomplete and did-you-mean) using new /search endpoints
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        // Try autocomplete endpoint first (note the updated URL)
        const autoResponse = await fetch(
          `http://localhost:3000/search/autocomplete?q=${searchTerm}`
        );
        const autoData = await autoResponse.json();

        if (autoData.suggestions && autoData.suggestions.length > 0) {
          setSuggestions(autoData.suggestions);
        } else {
          // Fallback to did-you-mean endpoint if no autocomplete suggestions
          const levenResponse = await fetch(
            `http://localhost:3000/search/levenshtein?q=${searchTerm}`
          );
          const levenData = await levenResponse.json();

          if (levenData.didYouMean) {
            setSuggestions([`Did you mean: ${levenData.didYouMean}?`]);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [searchTerm]);

  // Click outside handler to hide suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Handler to apply a suggestion from the "Did you mean..." text
  const applySuggestion = (suggestionText) => {
    const cleanSuggestion = suggestionText
      .replace("Did you mean: ", "")
      .replace("?", "");
    setSearchTerm(cleanSuggestion);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-center">Shop Page</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-6">
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        applySuggestion(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-semibold mb-4">Gender</h2>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Category</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
                disabled={selectedGender === "All"}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="font-semibold mb-4">Subcategory</h2>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
                disabled={!selectedCategory}
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>{filteredProducts.length} products found</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 rounded border bg-gray-100 hover:bg-gray-200"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="p-2 rounded border bg-gray-100 hover:bg-gray-200"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Display suggestion if no products are found */}
{!loading && !error && filteredProducts.length === 0 && (
  <div className="text-center mt-4">
    {suggestions.length > 0 ? (
      <p className="text-gray-600">
        {suggestions[0]}{" "}
        <button
          onClick={() => applySuggestion(suggestions[0])}
          className="underline text-blue-500 ml-2"
        >
          
          Apply suggestion
        </button>
      </p>
    ) : (
      <p className="text-gray-600">No products found</p>
    )}
  </div>
)}




            {loading && <p className="text-center">Loading products...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
          

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading &&
                !error &&
                displayedProducts.map((product) => (
                  <ProductItem key={product.ProductId} product={product} />
                ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
  
};

export default ShopPage;
