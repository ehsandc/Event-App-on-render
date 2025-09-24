import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Divider,
  Badge,
} from "@chakra-ui/react";

const CategoryManagement = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [events, setEvents] = useState([]);
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load base categories from JSON
      const response = await fetch("/events.json");
      const data = await response.json();
      
      // Load events to check category usage
      const localEvents = JSON.parse(localStorage.getItem("events") || "[]");
      const allEvents = [...data.events, ...localEvents];
      setEvents(allEvents);
      
      // Load custom categories from localStorage
      const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
      const allCategories = [...data.categories, ...customCategories];
      setCategories(allCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load category data.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        title: "Category Exists",
        description: "A category with this name already exists.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newCategory = {
      id: Date.now(), // Simple ID generation
      name: newCategoryName.trim(),
      isCustom: true // Mark as custom category
    };

    // Save to localStorage
    const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
    customCategories.push(newCategory);
    localStorage.setItem("categories", JSON.stringify(customCategories));

    // Update local state
    setCategories([...categories, newCategory]);
    setNewCategoryName("");

    toast({
      title: "Category Added",
      description: `Category "${newCategory.name}" has been added successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Dispatch custom event to refresh categories in other components
    window.dispatchEvent(new CustomEvent("categoriesUpdated"));
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    onEditOpen();
  };

  const handleSaveEdit = () => {
    if (!editCategoryName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if name conflicts with existing categories (excluding current)
    if (categories.some(cat => 
      cat.id !== editingCategory.id && 
      cat.name.toLowerCase() === editCategoryName.trim().toLowerCase()
    )) {
      toast({
        title: "Category Exists",
        description: "A category with this name already exists.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Update in localStorage if it's a custom category
    if (editingCategory.isCustom) {
      const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
      const updatedCustomCategories = customCategories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: editCategoryName.trim() }
          : cat
      );
      localStorage.setItem("categories", JSON.stringify(updatedCustomCategories));
    }

    // Update local state
    const updatedCategories = categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: editCategoryName.trim() }
        : cat
    );
    setCategories(updatedCategories);

    toast({
      title: "Category Updated",
      description: `Category has been updated to "${editCategoryName.trim()}".`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onEditClose();
    setEditingCategory(null);
    setEditCategoryName("");

    // Dispatch custom event to refresh categories in other components
    window.dispatchEvent(new CustomEvent("categoriesUpdated"));
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    onDeleteOpen();
  };

  const confirmDeleteCategory = () => {
    const categoryId = categoryToDelete.id;
    
    // Check if category is used in any events
    const isUsed = events.some(event => 
      Array.isArray(event.categoryIds) && event.categoryIds.includes(categoryId)
    );

    if (isUsed) {
      toast({
        title: "Cannot Delete Category",
        description: "This category is currently being used by one or more events. Please remove it from all events before deleting.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      onDeleteClose();
      return;
    }

    // Remove from localStorage if it's a custom category
    if (categoryToDelete.isCustom) {
      const customCategories = JSON.parse(localStorage.getItem("categories") || "[]");
      const updatedCustomCategories = customCategories.filter(cat => cat.id !== categoryId);
      localStorage.setItem("categories", JSON.stringify(updatedCustomCategories));
    }

    // Update local state
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);

    toast({
      title: "Category Deleted",
      description: `Category "${categoryToDelete.name}" has been deleted.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onDeleteClose();
    setCategoryToDelete(null);

    // Dispatch custom event to refresh categories in other components
    window.dispatchEvent(new CustomEvent("categoriesUpdated"));
  };

  const getCategoryUsageCount = (categoryId) => {
    return events.filter(event => 
      Array.isArray(event.categoryIds) && event.categoryIds.includes(categoryId)
    ).length;
  };

  return (
    <Box p={6} maxWidth="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Category Management
        </Text>

        {/* Add New Category Section */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Add New Category
          </Text>
          <HStack>
            <FormControl>
              <Input
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              />
            </FormControl>
            <Button
              leftIcon={<span>+</span>}
              colorScheme="blue"
              onClick={handleAddCategory}
              minWidth="120px"
            >
              Add
            </Button>
          </HStack>
        </Box>

        <Divider />

        {/* Existing Categories Section */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            Existing Categories
          </Text>
          <VStack spacing={3} align="stretch">
            {categories.map((category) => {
              const usageCount = getCategoryUsageCount(category.id);
              return (
                <HStack
                  key={category.id}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  justify="space-between"
                  bg={category.isCustom ? "blue.50" : "gray.50"}
                >
                  <HStack spacing={3}>
                    <Text fontWeight="medium">{category.name}</Text>
                    {category.isCustom && (
                      <Badge colorScheme="blue" size="sm">Custom</Badge>
                    )}
                    <Badge colorScheme="gray" size="sm">
                      {usageCount} event{usageCount !== 1 ? 's' : ''}
                    </Badge>
                  </HStack>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<span>✏️</span>}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => handleEditCategory(category)}
                      aria-label="Edit category"
                      isDisabled={!category.isCustom}
                    />
                    <IconButton
                      icon={<span>🗑️</span>}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category)}
                      aria-label="Delete category"
                      isDisabled={!category.isCustom || usageCount > 0}
                    />
                  </HStack>
                </HStack>
              );
            })}
          </VStack>
        </Box>

        {/* Close Button */}
        <Button onClick={onClose} variant="outline" width="full">
          Close
        </Button>
      </VStack>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Category Name</FormLabel>
              <Input
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </ModalFooter>
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
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the category &ldquo;{categoryToDelete?.name}&rdquo;? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteCategory} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CategoryManagement;