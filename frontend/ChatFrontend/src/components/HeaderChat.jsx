import React from "react";
import { Flex, Avatar, AvatarBadge, Text, Tooltip } from "@chakra-ui/react";

const HeaderChat = ({ chatName }) => {
  return (
    <Flex w="100%">
      <Avatar name={chatName} bg="blue.300">
        {chatName?.charAt(1).toUpperCase()}
      </Avatar>
      <Flex flexDirection="column" mx="5" justify="center">
        <Text fontSize="lg" fontWeight="bold">
          {chatName}
        </Text>
      </Flex>
    </Flex>
  );
};

export default HeaderChat;
