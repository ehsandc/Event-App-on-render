import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/events.json")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
        setCategories(data.categories);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <DataContext.Provider value={{ users, categories }}>
      {children}
    </DataContext.Provider>
  );
};
