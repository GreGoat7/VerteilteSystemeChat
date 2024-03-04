import React from "react";
import { Flex, Text, Box, IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="4"
      bgGradient="linear(to-r, teal.700, green.600)"
      color="white"
      borderRadius="20px"
    >
      <Text fontSize="lg" fontWeight="bold">
        Meine Webseite
      </Text>
      <Box>
        <IconButton
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
        />
      </Box>
    </Flex>
  );
}

export default Header;
