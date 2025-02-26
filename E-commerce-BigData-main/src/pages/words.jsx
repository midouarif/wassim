import { useEffect, useState } from "react";

function Words() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/words") // Adjust the URL if needed
      .then((response) => response.json())
      .then((data) => setWords(data))
      .catch((error) => console.error("Error fetching words:", error));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Product Words</h1>
      {words.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {words.map((word, index) => (
            <li key={index} style={{ margin: "5px 0", fontSize: "18px" }}>
              {word}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", fontSize: "18px", color: "gray" }}>
          Loading words...
        </p>
      )}
    </div>
  );
}

export default Words;
