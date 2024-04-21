import React from "react";
import { Flex, Text, Box, IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logout } = useAuth();
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
      <Box>
        <IconButton
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={logout}
          variant="ghost"
        />
      </Box>
    </Flex>
  );
}

export default Header;
