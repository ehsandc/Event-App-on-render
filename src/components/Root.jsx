import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import AddEventForm from "./AddEventForm";
import CategoryManagement from "./CategoryManagement";

export const Root = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isCategoryOpen, 
    onOpen: onCategoryOpen, 
    onClose: onCategoryClose 
  } = useDisclosure();

  // Function to refresh events (will be passed to AddEventForm)
  const refreshEvents = () => {
    // Dispatch custom event to trigger refresh in EventsPage
    window.dispatchEvent(new CustomEvent("refreshEvents"));
  };

  return (
    <Box>
      <Navigation onAddEventClick={onOpen} onCategoryManagementClick={onCategoryOpen} />
      <Outlet />

      {/* Add Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddEventForm onClose={onClose} refreshEvents={refreshEvents} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Category Management Modal */}
      <Modal isOpen={isCategoryOpen} onClose={onCategoryClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Category Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CategoryManagement onClose={onCategoryClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
