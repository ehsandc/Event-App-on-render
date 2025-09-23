import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from "@chakra-ui/react";
import AddEventForm from "./AddEventForm";

export const Root = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Navigation onAddEventClick={onOpen} />
      <Outlet context={{ isAddEventOpen: isOpen, onAddEventClose: onClose }} />
      
      {/* Add Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddEventForm onClose={onClose} refreshEvents={() => window.location.reload()} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
