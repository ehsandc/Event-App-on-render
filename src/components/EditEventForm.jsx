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
} from "@chakra-ui/react";
import { DataContext } from "../context/DataContext";

const EditEventForm = ({ event, onClose, onEventUpdated }) => {
  const { users, categories } = useContext(DataContext);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [categoryIds, setCategoryIds] = useState(event.categoryIds);
  const [createdBy, setCreatedBy] = useState(event.createdBy);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [image, setImage] = useState(event.image);
  const [availableImages, setAvailableImages] = useState([]);

  // Fetch all image URLs dynamically
  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then((response) => response.json())
      .then((data) => {
        const images = data.map((event) => event.image); // Extract image URLs
        setAvailableImages(images);
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedEvent = {
      ...event,
      title,
      description,
      categoryIds,
      createdBy, // Use the selected existing creator
      startTime,
      endTime,
      image,
    };

    fetch(`http://localhost:3000/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    })
      .then((response) => {
        if (response.ok) {
          onEventUpdated(updatedEvent); // Notify parent component
          onClose(); // Close the modal
        } else {
          console.error("Failed to update event");
        }
      })
      .catch((error) => console.error("Error updating event:", error));
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
            onChange={(e) => setStartTime(e.target.value)}
          />
        </FormControl>

        {/* End Time */}
        <FormControl>
          <FormLabel>End Time</FormLabel>
          <Input
            type="datetime-local"
            value={endTime}
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
