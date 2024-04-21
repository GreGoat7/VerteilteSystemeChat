import React, { useState } from "react";
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Stelle sicher, dass der Pfad korrekt ist

function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, googleLogin } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    try {
      await login(username, password);
      toast({ title: "Erfolgreich eingeloggt.", status: "success" });
    } catch (error) {
      toast({
        title: "Login fehlgeschlagen.",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleRegister = async () => {
    try {
      await register(username, password);
      toast({ title: "Registrierung erfolgreich.", status: "success" });
    } catch (error) {
      toast({
        title: "Registrierung fehlgeschlagen.",
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <Flex
      height="80vh" // Use full view height
      width="100vw" // Use full view width
      align="center" // Vertically center the children
      justify="center" // Horizontally center the children
    >
      <Box borderRadius="30px" shadow="md" p={6} bg="green.600" width="50%">
        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab color="white">Login</Tab>
            <Tab color="white">Registrieren</Tab>
            <Tab color="white" onClick={googleLogin}>
              Google
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <FormControl>
                <FormLabel color="white">Benutzername</FormLabel>
                <Input
                  _placeholder={{ color: "white" }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Benutzername"
                  _focus={{ borderColor: "white" }}
                />
                <FormLabel mt={4} color="white">
                  Passwort
                </FormLabel>
                <Input
                  _placeholder={{ color: "white" }} // Placeholder color
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort"
                  type="password"
                  _focus={{ borderColor: "white" }}
                />
                <Button mt={4} colorScheme="teal" onClick={handleLogin}>
                  Einloggen
                </Button>
              </FormControl>
            </TabPanel>
            <TabPanel>
              <FormControl>
                <FormLabel color="white">Benutzername</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Benutzername"
                  _placeholder={{ color: "white" }}
                  _focus={{ borderColor: "white" }}
                />
                <FormLabel mt={4} color="white">
                  Passwort
                </FormLabel>
                <Input
                  _placeholder={{ color: "white" }}
                  _focus={{ borderColor: "white" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort"
                  type="password"
                />
                <Button mt={4} colorScheme="teal" onClick={handleRegister}>
                  Registrieren
                </Button>
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
}

export default AuthForm;
