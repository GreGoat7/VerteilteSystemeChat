import React, { useEffect, useRef } from "react";
import { Avatar, Flex, Text, Tooltip, Badge, Box } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { CheckIcon, CheckCircleIcon } from "@chakra-ui/icons";

const Messages = ({ messages }) => {
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };
  const { username } = useAuth();

  const getStatusIcon = (status) => {
    if (status === "gesendet") {
      return <CheckIcon color="green.600" />;
    } else if (status === "empfangen") {
      return <CheckCircleIcon color="green.400" />;
    }
    return null; // For 'read' or other statuses you might have.
  };

  return (
    <Flex w="100%" h="80%" overflowY="scroll" flexDirection="column" p="3">
      {messages.map((item, index) => {
        const isCurrentUser = item.senderName === username; // Here is the declaration
        const initial = item.senderName.charAt(0).toUpperCase();

        return (
          <Flex
            key={index}
            w="100%"
            justify={isCurrentUser ? "flex-end" : "flex-start"}
          >
            {!isCurrentUser && (
              <Tooltip label={item.senderName} placement="top" hasArrow>
                <span>
                  <Avatar name={item.senderName} bg="blue.300">
                    {item.senderName.charAt(1).toUpperCase()}
                  </Avatar>
                </span>
              </Tooltip>
            )}
            <Flex
              bg={isCurrentUser ? "gray.700" : "gray.100"}
              color={isCurrentUser ? "white" : "black"}
              minW="100px"
              maxW="350px"
              my="1"
              p="3"
              borderRadius="10px"
              display="flex"
              justifyContent="space-between"
            >
              <Text marginRight="4px">{item.content}</Text>

              {getStatusIcon(item.status)}
            </Flex>
          </Flex>
        );
      })}
      <AlwaysScrollToBottom />
    </Flex>
  );
};

export default Messages;
// return (
//   <Flex w="100%" h="80%" overflowY="scroll" flexDirection="column" p="3">
//     {messages.map((item, index) => {
//       if (item.senderName === username) {
//         return (
//           <Flex key={index} w="100%" justify="flex-end">
//             <Flex
//               bg="green.600"
//               color="white"
//               minW="100px"
//               maxW="350px"
//               my="1"
//               p="3"
//               borderRadius="10px"
//             >
//               <Text>{item.content}</Text>
//             </Flex>
//           </Flex>
//         );
//       } else {
//         return (
//           <Flex key={index} w="100%">
//             <Avatar name={item.senderName} bg="blue.400">
//               {item.senderName.charAt(1).toUpperCase()}
//             </Avatar>
//             <Flex
//               bg="gray.100"
//               color="black"
//               minW="100px"
//               maxW="350px"
//               my="1"
//               p="3"
//               borderRadius="10px"
//             >
//               <Text>{item.content}</Text>
//             </Flex>
//           </Flex>
//         );
//       }
//     })}
//     <AlwaysScrollToBottom />
//   </Flex>
// );
