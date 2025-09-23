import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Spacer, Button } from "@chakra-ui/react";

export const Navigation = () => {
  return (
    <Box as="nav" bg="teal.500" p={4} color="white">
      <Flex align="center">
        <Button as={Link} to="/" variant="ghost" color="white" mr={4}>
          Events
        </Button>
        <Button as={Link} to="/event/1" variant="ghost" color="white">
          Event
        </Button>
        <Spacer />
      </Flex>
    </Box>
  );
};
