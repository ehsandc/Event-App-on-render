import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Spinner,
  VStack,
  HStack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import EditEventForm from "../components/EditEventForm";
import { DataContext } from "../context/DataContext";

const EventPage = () => {
  const { id } = useParams(); // Get event ID from URL
  const [event, setEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const { users, categories } = useContext(DataContext);
  const cancelRef = React.useRef();

  const handleEventUpdated = (updatedEvent) => {
    setEvent(updatedEvent); // Update the event state with the new data
  };

  // Fetch event details
  useEffect(() => {
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

        // Combine local events with static events
        const allEvents = [...localEvents, ...data.events];

        // Find the event by ID
        const foundEvent = allEvents.find((event) => event.id === parseInt(id));
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          throw new Error("Event not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
        toast({ title: "Error loading event", status: "error" });
      });
  }, [id, toast]);

  // Ensure data is loaded before rendering
  if (!users || !categories || !event) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color="gray.600">Loading event details...</Text>
        </VStack>
      </Box>
    );
  }

  // Safely find the creator of the event
  const createdBy = users?.find((user) => user.id === event?.createdBy);

  // Handle delete event - now works with localStorage
  const handleDeleteClick = () => {
    onDeleteOpen(); // Show confirmation dialog
  };

  const handleConfirmDelete = () => {
    // Get locally added events
    const localEvents = JSON.parse(localStorage.getItem("localEvents") || "[]");

    // Remove from localStorage
    const updatedLocalEvents = localEvents.filter((e) => e.id !== parseInt(id));
    localStorage.setItem("localEvents", JSON.stringify(updatedLocalEvents));

    // Show success message
    toast({
      title: "Event deleted successfully!",
      status: "success",
      description: "The event has been removed.",
    });

    // Trigger refresh on the main page
    window.dispatchEvent(new CustomEvent("refreshEvents"));

    // Close dialog and navigate back
    onDeleteClose();
    window.location.href = "/";
  };

  return (
    <Box maxWidth="4xl" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Box>
          <Heading size="xl" mb={4} color="teal.600">
            {event.title}
          </Heading>
          
          {/* Category Tags */}
          <HStack spacing={2} mb={4}>
            {event.categoryIds.map((categoryId) => {
              const category = categories.find(cat => cat.id === categoryId);
              return category ? (
                <Badge key={categoryId} colorScheme="blue" variant="subtle">
                  {category.name}
                </Badge>
              ) : null;
            })}
          </HStack>
        </Box>

        {/* Event Image */}
        <Image 
          src={event.image} 
          alt={event.title} 
          borderRadius="lg"
          maxHeight="400px"
          width="100%"
          objectFit="cover"
          shadow="md"
        />

        {/* Event Details */}
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="lg" lineHeight="tall">
              {event.description}
            </Text>
          </Box>

          <Divider />

          {/* Event Information Grid */}
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.700">Start Time:</Text>
              <Text>{new Date(event.startTime).toLocaleString()}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.700">End Time:</Text>
              <Text>{new Date(event.endTime).toLocaleString()}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.700">Duration:</Text>
              <Text>
                {Math.round((new Date(event.endTime) - new Date(event.startTime)) / (1000 * 60 * 60))} hours
              </Text>
            </HStack>
          </VStack>

          <Divider />

          {/* Creator Information */}
          <Box>
            <Text fontWeight="semibold" color="gray.700" mb={3}>Event Creator:</Text>
            <HStack spacing={4}>
              <Image
                src={createdBy?.image}
                alt={createdBy?.name}
                boxSize="60px"
                borderRadius="full"
                border="2px solid"
                borderColor="gray.200"
              />
              <Box>
                <Text fontWeight="medium" fontSize="lg">{createdBy?.name}</Text>
                <Text color="gray.600" fontSize="sm">Event Organizer</Text>
              </Box>
            </HStack>
          </Box>
        </VStack>

        <Divider />

        {/* Action Buttons */}
        <HStack spacing={4} justify="center">
          <Button colorScheme="blue" onClick={onOpen} size="lg">
            Edit Event
          </Button>
          <Button colorScheme="red" onClick={handleDeleteClick} size="lg" variant="outline">
            Delete Event
          </Button>
        </HStack>
      </VStack>

      {/* Delete Button */}
      <Button colorScheme="red" onClick={handleDeleteClick} mb={4}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete &ldquo;{event?.title}&rdquo;? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default EventPage;
