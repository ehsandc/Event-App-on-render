import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/events.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        
        // Load custom categories from localStorage and merge with base categories
        const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
        const allCategories = [...(data.categories || []), ...customCategories];
        setCategories(allCategories);
        
        setError(null);
      })
      .catch((error) => {
        console.error("DataContext: Error fetching data:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Listen for category updates
  useEffect(() => {
    const handleCategoryUpdate = () => {
      // Reload categories when they are updated
      fetch("/events.json")
        .then((response) => response.json())
        .then((data) => {
          const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
          const allCategories = [...(data.categories || []), ...customCategories];
          setCategories(allCategories);
        })
        .catch((error) => {
          console.error("DataContext: Error refreshing categories:", error);
        });
    };

    window.addEventListener("categoriesUpdated", handleCategoryUpdate);
    return () => {
      window.removeEventListener("categoriesUpdated", handleCategoryUpdate);
    };
  }, []);

  return (
    <DataContext.Provider value={{ users, categories, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
