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
  useToast,
} from "@chakra-ui/react";
import { DataContext } from "../context/DataContext";

const AddEventForm = ({ onClose, refreshEvents }) => {
  const { categories, users } = useContext(DataContext);
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState("");
  const [availableImages, setAvailableImages] = useState([]);

  // Fetch all image URLs dynamically from static JSON
  useEffect(() => {
    fetch("/events.json")
      .then((response) => response.json())
      .then((data) => {
        const images = data.events.map((event) => event.image); // Extract image URLs
        setAvailableImages(images);
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // For static deployment, just show a message instead of actually submitting
    toast({
      title: "Add Event Not Available",
      description: "This is a static demo. Adding events requires a backend server.",
      status: "info",
      duration: 4000,
      isClosable: true,
    });
    
    onClose(); // Close the modal
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
        <FormControl isRequired>
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
