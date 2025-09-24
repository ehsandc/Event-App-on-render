import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Spacer, Button } from "@chakra-ui/react";

export const Navigation = ({ onAddEventClick, onCategoryManagementClick }) => {
  const handleEventsClick = () => {
    // Dispatch a custom event to reset filters
    window.dispatchEvent(new CustomEvent("resetFilters"));
  };

  return (
    <Box as="nav" bg="teal.500" p={4} color="white">
      <Flex align="center">
        <Button
          as={Link}
          to="/"
          variant="ghost"
          color="white"
          mr={4}
          onClick={handleEventsClick}
        >
          Events
        </Button>
        <Spacer />
        <Button
          onClick={onCategoryManagementClick}
          colorScheme="green"
          variant="solid"
          size="sm"
          mr={3}
        >
          Manage Categories
        </Button>
        <Button
          onClick={onAddEventClick}
          colorScheme="blue"
          variant="solid"
          size="sm"
        >
          Add Event
        </Button>
      </Flex>
    </Box>
  );
};
