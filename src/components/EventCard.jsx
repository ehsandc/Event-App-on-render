import React from "react";
import PropTypes from "prop-types";
import { Box, Text, Image, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => (
  <Box
    p={[2, 4]} // Adjust padding for smaller screens
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
  >
    <Image
      src={event.image || "https://via.placeholder.com/150"}
      alt={event.title || "Event Image"}
      mb={4}
      boxSize={["100px", "150px"]} // Adjust image size for smaller screens
    />
    <Text fontSize={["md", "xl"]} fontWeight="bold">
      {event.title || "Untitled Event"}
    </Text>
    <Text fontSize={["sm", "md"]}>
      {event.description || "No description available."}
    </Text>
    <Text fontSize={["sm", "md"]}>
      Start:{" "}
      {event.startTime ? new Date(event.startTime).toLocaleString() : "N/A"}
    </Text>
    <Text fontSize={["sm", "md"]}>
      End: {event.endTime ? new Date(event.endTime).toLocaleString() : "N/A"}
    </Text>
    <Button
      as={Link}
      to={`/event/${event.id}`}
      colorScheme="teal"
      mt={4}
      size={["sm", "md"]} // Adjust button size for smaller screens
    >
      View Details
    </Button>
  </Box>
);

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }).isRequired,
};

EventCard.defaultProps = {
  event: {
    id: null,
    title: "Untitled Event",
    description: "No description available.",
    image: "https://via.placeholder.com/150",
    startTime: null,
    endTime: null,
  },
};

export default EventCard;
