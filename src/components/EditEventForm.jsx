import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Checkbox,
  CheckboxGroup,
  Select,
  useToast,
} from "@chakra-ui/react";
import { DataContext } from "../context/DataContext";

const EditEventForm = ({ event, onClose, onEventUpdated }) => {
  const { users, categories } = useContext(DataContext);
  const toast = useToast();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [categoryIds, setCategoryIds] = useState(event.categoryIds);
  const [createdBy, setCreatedBy] = useState(event.createdBy);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [image, setImage] = useState(event.image);
  const [availableImages, setAvailableImages] = useState([]);

  // Fetch all image URLs dynamically from static JSON
  useEffect(() => {
    fetch("/events.json")
      .then((response) => response.json())
      .then((data) => {
        const images = data.events.map((event) => event.image); // Extract image URLs
        setAvailableImages(images);
      })
      .catch(() => {
        // Handle error silently for image fetching
        setAvailableImages([]);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !description || !startTime || !endTime) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Create updated event object
    const updatedEvent = {
      ...event,
      title,
      description,
      startTime,
      endTime,
      categoryIds,
      createdBy: Number(createdBy),
      image: image || event.image,
    };

    // Check if this is a local event (from localStorage)
    const localEvents = JSON.parse(localStorage.getItem('localEvents') || '[]');
    const localEventIndex = localEvents.findIndex(e => e.id === event.id);
    
    if (localEventIndex !== -1) {
      // Update local event
      localEvents[localEventIndex] = updatedEvent;
      localStorage.setItem('localEvents', JSON.stringify(localEvents));
      
      toast({
        title: "Event Updated Successfully!",
        description: `"${title}" has been updated.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      
      // Update the event in the parent component
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      }
      
      // Trigger refresh on the main page
      window.dispatchEvent(new CustomEvent('refreshEvents'));
    } else {
      // This is a static event - cannot be edited
      toast({
        title: "Cannot Edit Static Event",
        description: "This event is from the demo data and cannot be edited. Only events you've added can be modified.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }

    onClose(); // Close the modal
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        {/* Title */}
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
          />
        </FormControl>

        {/* Description */}
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
          />
        </FormControl>

        {/* Start Time */}
        <FormControl>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              // If end time is before new start time, reset end time
              if (endTime && e.target.value > endTime) {
                setEndTime("");
              }
            }}
          />
        </FormControl>

        {/* End Time */}
        <FormControl>
          <FormLabel>End Time</FormLabel>
          <Input
            type="datetime-local"
            value={endTime}
            min={startTime} // Prevent selecting end time before start time
            onChange={(e) => setEndTime(e.target.value)}
          />
        </FormControl>

        {/* Image */}
        <FormControl>
          <FormLabel>Image</FormLabel>
          <Select
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Select an image"
          >
            {availableImages.map((img, index) => (
              <option key={index} value={img}>
                {img}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Categories */}
        <FormControl>
          <FormLabel>Categories</FormLabel>
          <CheckboxGroup
            value={categoryIds.map(String)} // Convert category IDs to strings for proper matching
            onChange={(selected) => setCategoryIds(selected.map(Number))} // Convert selected values back to numbers
          >
            <VStack align="start">
              {categories.map((category) => (
                <Checkbox key={category.id} value={String(category.id)}>
                  {category.name}
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        </FormControl>

        {/* Creator */}
        <FormControl>
          <FormLabel>Created By</FormLabel>
          <Select
            value={createdBy}
            onChange={(e) => setCreatedBy(Number(e.target.value))}
            placeholder="Select an existing creator"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Submit Button */}
        <Button type="submit" colorScheme="blue" width="full">
          Save Changes
        </Button>
      </VStack>
    </Box>
  );
};

export default EditEventForm;
