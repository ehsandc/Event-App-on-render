import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Box, 
  Button, 
  Image, 
  Text, 
  Input, 
  Select, 
  Spinner, 
  Alert, 
  AlertIcon,
  HStack,
  VStack,
  FormLabel,
  SimpleGrid,
  Badge,
  useColorModeValue
} from "@chakra-ui/react";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]); // Assuming creators are stored in a "users" array
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch events from the server
  const fetchEvents = () => {
    setLoading(true);
    fetch("/events.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        return response.json();
      })
      .then((data) => {
        // Get locally added events
        const localEvents = JSON.parse(
          localStorage.getItem("localEvents") || "[]"
        );

        // Combine local events with static events (local events first)
        const allEvents = [...localEvents, ...data.events];

        setEvents(allEvents);
        setCategories(data.categories);
        setUsers(data.users);
        setError(null); // Clear any previous errors
      })
      .catch((error) => {
        console.error("EventsPage: Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch categories from the server
  // Now handled in fetchEvents()

  // Fetch users (creators) from the server
  // Now handled in fetchEvents()

  useEffect(() => {
    fetchEvents();
  }, []);

  // Listen for reset filters event from Navigation
  useEffect(() => {
    const handleResetFilters = () => {
      setSearchQuery("");
      setCategoryFilter("all");
      setCreatorFilter("all");
      setDateFilter("all");
    };

    const handleRefreshEvents = () => {
      fetchEvents();
    };

    window.addEventListener("resetFilters", handleResetFilters);
    window.addEventListener("refreshEvents", handleRefreshEvents);

    return () => {
      window.removeEventListener("resetFilters", handleResetFilters);
      window.removeEventListener("refreshEvents", handleRefreshEvents);
    };
  }, []);

  // Filter events based on search query and filters
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

      const matchesCreator =
        creatorFilter === "all" ||
        event.createdBy === Number(creatorFilter);

      const now = new Date();
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      let matchesDate = true;
      if (dateFilter === "upcoming") {
        matchesDate = eventStart > now;
      } else if (dateFilter === "past") {
        matchesDate = eventEnd < now;
      } else if (dateFilter === "ongoing") {
        matchesDate = eventStart <= now && eventEnd >= now;
      } else if (dateFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = eventStart >= today && eventStart < tomorrow;
      } else if (dateFilter === "this-week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        matchesDate = eventStart >= weekStart && eventStart < weekEnd;
      }

      return matchesSearch && matchesCategory && matchesCreator && matchesDate;
    });
  }, [searchQuery, categoryFilter, creatorFilter, dateFilter, events, categories, users]);

  return (
    <Box>
      <Box p={4}>
        {/* Enhanced Filters Section */}
        <VStack spacing={4} align="stretch" mb={6}>
          {/* Search Input */}
          <Box>
            <FormLabel>Search Events</FormLabel>
            <Input
              placeholder="Search by title, description, category, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          {/* Filter Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {/* Category Filter */}
            <Box>
              <FormLabel>Category</FormLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Creator Filter */}
            <Box>
              <FormLabel>Creator</FormLabel>
              <Select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
              >
                <option value="all">All Creators</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Date Filter */}
            <Box>
              <FormLabel>Time Period</FormLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
              </Select>
            </Box>
          </SimpleGrid>

          {/* Active Filters Display */}
          {(searchQuery || categoryFilter !== "all" || creatorFilter !== "all" || dateFilter !== "all") && (
            <HStack spacing={2} flexWrap="wrap">
              <Text fontSize="sm" color="gray.600">Active filters:</Text>
              {searchQuery && (
                <Badge colorScheme="blue" variant="subtle">
                  Search: &ldquo;{searchQuery}&rdquo;
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge colorScheme="green" variant="subtle">
                  Category: {categories.find(cat => cat.id === Number(categoryFilter))?.name}
                </Badge>
              )}
              {creatorFilter !== "all" && (
                <Badge colorScheme="purple" variant="subtle">
                  Creator: {users.find(user => user.id === Number(creatorFilter))?.name}
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge colorScheme="orange" variant="subtle">
                  Period: {dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1).replace('-', ' ')}
                </Badge>
              )}
            </HStack>
          )}
        </VStack>

        {/* Error Message */}
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box flex="1">
              <Text color="red.500" mb={2}>
                {error}
              </Text>
              <Button colorScheme="red" size="sm" onClick={fetchEvents}>
                Retry
              </Button>
            </Box>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </Box>
        ) : (
          /* Events List */
          <Box>
            {filteredEvents.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500">
                  {searchQuery || categoryFilter !== "all" || creatorFilter !== "all" || dateFilter !== "all"
                    ? "No events found matching your criteria." 
                    : "No events available."}
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredEvents.map((event) => {
                  const eventCategories = event.categoryIds
                    .map((id) => categories.find((cat) => cat.id === id)?.name)
                    .filter(Boolean);
                  const creator = users.find((user) => user.id === event.createdBy);
                  const cardBg = useColorModeValue("white", "gray.800");
                  const borderColor = useColorModeValue("gray.200", "gray.600");

                  return (
                    <Box
                      key={event.id}
                      bg={cardBg}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="lg"
                      overflow="hidden"
                      shadow="md"
                      transition="all 0.2s"
                      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                    >
                      <Image 
                        src={event.image} 
                        alt={event.title} 
                        height="200px" 
                        width="100%" 
                        objectFit="cover" 
                      />
                      <Box p={4}>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="xl" fontWeight="bold" noOfLines={2}>
                            {event.title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={3}>
                            {event.description}
                          </Text>
                          
                          <HStack spacing={2} flexWrap="wrap">
                            {eventCategories.map((categoryName, index) => (
                              <Badge key={index} colorScheme="blue" variant="subtle" fontSize="xs">
                                {categoryName}
                              </Badge>
                            ))}
                          </HStack>

                          <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                            <Text>
                              <strong>Start:</strong> {new Date(event.startTime).toLocaleString()}
                            </Text>
                            <Text>
                              <strong>End:</strong> {new Date(event.endTime).toLocaleString()}
                            </Text>
                            <Text>
                              <strong>Creator:</strong> {creator?.name || "Unknown"}
                            </Text>
                          </VStack>

                          <Button
                            as={Link}
                            to={`/event/${event.id}`}
                            colorScheme="teal"
                            size="sm"
                            width="full"
                            mt={3}
                          >
                            View Details
                          </Button>
                        </VStack>
                      </Box>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EventsPage;
