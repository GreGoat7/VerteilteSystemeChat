import React from "react";
import { Flex, Text, Box, IconButton, useColorMode } from "@chakra-ui/react";
import { ArrowRightIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout, isLoggedIn, username } = useAuth();
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="4"
      bgGradient="linear(to-r, teal.700, green.600)"
      color="white"
    >
      <Text fontSize="lg" fontWeight="bold" color={"white"}>
        Meine Webseite
      </Text>
      <Flex>
        <Text paddingTop="9px" paddingRight="10px">
          {username}
        </Text>
        {isLoggedIn ? (
          <IconButton
            icon={<ArrowRightIcon />}
            onClick={logout}
            variant="ghost"
          />
        ) : (
          <></>
        )}
      </Flex>
    </Flex>
  );
}

export default Header;
