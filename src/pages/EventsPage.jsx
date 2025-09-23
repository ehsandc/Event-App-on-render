import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Image,
  Text,
  Input,
  Select,
} from "@chakra-ui/react";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]); // Assuming creators are stored in a "users" array
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState(null);

  // Fetch events from the server
  const fetchEvents = () => {
    fetch("/events.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        return response.json();
      })
      .then((data) => {
        setEvents(data.events);
        setCategories(data.categories);
        setUsers(data.users);
        setError(null); // Clear any previous errors
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
      });
  };

  // Fetch categories from the server
  // Now handled in fetchEvents()

  // Fetch users (creators) from the server
  // Now handled in fetchEvents()

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Match event title
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) || // Match event description
        event.categoryIds
          .map((id) => categories.find((cat) => cat.id === id)?.name)
          .filter(Boolean)
          .some((categoryName) =>
            categoryName.toLowerCase().includes(searchQuery.toLowerCase())
          ) || // Match category name
        users
          .find((user) => user.id === event.createdBy)
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase()); // Match creator name

      const matchesCategory =
        categoryFilter === "all" ||
        event.categoryIds.includes(Number(categoryFilter));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, events, categories, users]);

  return (
    <Box>
      <Box p={4}>
        {/* Search Input */}
        <Input
          placeholder="Search events by name, category, or creator"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb={4}
        />

        {/* Category Filter */}
        <Select
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          mb={4}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {/* Error Message */}
        {error && (
          <Box mb={4}>
            <Text color="red.500" mb={2}>
              {error}
            </Text>
            <Button colorScheme="red" onClick={fetchEvents}>
              Retry
            </Button>
          </Box>
        )}

        {/* Events List */}
        <Box className="event-grid">
          {filteredEvents.map((event) => (
            <Box key={event.id} className="event-card">
              <Image src={event.image} alt={event.title} mb={4} />
              <Text fontSize="xl" fontWeight="bold">
                {event.title}
              </Text>
              <Text>{event.description}</Text>
              <Text fontSize="sm" color="gray.600">
                Start Time: {new Date(event.startTime).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                End Time: {new Date(event.endTime).toLocaleString()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Categories:{" "}
                {event.categoryIds
                  .map((id) => categories.find((cat) => cat.id === id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Created By:{" "}
                {users.find((user) => user.id === event.createdBy)?.name ||
                  "Unknown"}
              </Text>
              <Button
                as={Link}
                to={`/event/${event.id}`}
                colorScheme="teal"
                mt={4}
              >
                View Details
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EventsPage;
