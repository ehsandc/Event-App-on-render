import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Checkbox,
  CheckboxGroup,
} from "@chakra-ui/react";
import { DataContext } from "../context/DataContext";

const AddEventForm = ({ onClose, refreshEvents }) => {
  const { categories, users } = useContext(DataContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState("");
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

    const newEvent = {
      title,
      description,
      categoryIds,
      createdBy: Number(createdBy),
      startTime,
      endTime,
      image,
    };

    fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
      .then((response) => {
        if (response.ok) {
          refreshEvents(); // Refresh the events list
          onClose(); // Close the modal
        } else {
          console.error("Failed to add event");
        }
      })
      .catch((error) => console.error("Error adding event:", error));
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        {/* Title */}
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
          />
        </FormControl>

        {/* Description */}
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
          />
        </FormControl>

        {/* Start Time */}
        <FormControl isRequired>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </FormControl>

        {/* End Time */}
        <FormControl isRequired>
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
            placeholder="Select an image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
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
            value={categoryIds.map(String)}
            onChange={(selected) => setCategoryIds(selected.map(Number))}
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

        {/* Created By */}
        <FormControl isRequired>
          <FormLabel>Created By</FormLabel>
          <Select
            placeholder="Select a creator"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
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
          Add Event
        </Button>
      </VStack>
    </Box>
  );
};

export default AddEventForm;
