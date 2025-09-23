import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Image,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from "@chakra-ui/react";
import EditEventForm from "../components/EditEventForm";
import { DataContext } from "../context/DataContext";

const EventPage = () => {
  const { id } = useParams(); // Get event ID from URL
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { users, categories } = useContext(DataContext);

  const handleEventUpdated = (updatedEvent) => {
    setEvent(updatedEvent); // Update the event state with the new data
  };

  // Fetch event details
  useEffect(() => {
    fetch(`http://localhost:3000/events/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        return response.json();
      })
      .then((data) => setEvent(data))
      .catch((error) => {
        console.error("Error fetching event:", error);
        toast({ title: "Error loading event", status: "error" });
      });
  }, [id, toast]);

  // Ensure data is loaded before rendering
  if (!users || !categories || !event) {
    return <Text>Loading...</Text>;
  }

  // Safely find the creator of the event
  const createdBy = users?.find((user) => user.id === event?.createdBy);

  // Safely map category IDs to category names
  const eventCategories = event?.categoryIds
    ?.map((id) => categories?.find((category) => category.id === id)?.name)
    .join(", ");

  // Handle delete event
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      fetch(`http://localhost:3000/events/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            toast({ title: "Event deleted successfully!", status: "success" });
            navigate("/"); // Redirect to the main page
          } else {
            toast({ title: "Failed to delete event.", status: "error" });
          }
        })
        .catch(() => toast({ title: "An error occurred.", status: "error" }));
    }
  };

  return (
    <Box p={4}>
      <Heading mb={4}>{event.title}</Heading>
      <Image src={event.image} alt={event.title} mb={4} />
      <Text fontSize="lg" mb={2}>
        {event.description}
      </Text>
      <Text mb={2}>
        <strong>Start:</strong> {new Date(event.startTime).toLocaleString()}
      </Text>
      <Text mb={4}>
        <strong>End:</strong> {new Date(event.endTime).toLocaleString()}
      </Text>
      <Text mb={4}>
        <strong>Categories:</strong> {eventCategories}
      </Text>
      <Text mb={4}>
        <strong>Created By:</strong> {createdBy?.name}
      </Text>
      <Image
        src={createdBy?.image}
        alt={createdBy?.name}
        boxSize="50px"
        borderRadius="full"
        mb={4}
      />

      {/* Edit Button */}
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        Edit Event
      </Button>

      {/* Delete Button */}
      <Button colorScheme="red" onClick={handleDelete} mb={4}>
        Delete Event
      </Button>

      {/* Edit Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <EditEventForm
              event={event}
              onClose={onClose}
              onEventUpdated={handleEventUpdated}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventPage;
