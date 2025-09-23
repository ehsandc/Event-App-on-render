import React from "react";
import { Routes, Route } from "react-router-dom";
import { Root } from "../components/Root";
import EventsPage from "./EventsPage";
import EventPage from "./EventPage";
import "../App.css"; // Corrected import path

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Root />}>
        <Route index element={<EventsPage />} />
        <Route path="event/:id" element={<EventPage />} />
      </Route>
    </Routes>
  );
};

export default App;
