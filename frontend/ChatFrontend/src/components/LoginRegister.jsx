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
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext"; // Stelle sicher, dass der Pfad korrekt ist

function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
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
    <Box shadow="md" p={6} rounded="md" bg="lightgrey">
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Login</Tab>
          <Tab>Registrieren</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormControl>
              <FormLabel>Benutzername</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername"
              />
              <FormLabel mt={4}>Passwort</FormLabel>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                type="password"
              />
              <Button mt={4} colorScheme="teal" onClick={handleLogin}>
                Einloggen
              </Button>
            </FormControl>
          </TabPanel>
          <TabPanel>
            <FormControl>
              <FormLabel>Benutzername</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Benutzername"
              />
              <FormLabel mt={4}>Passwort</FormLabel>
              <Input
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
  );
}

export default AuthForm;
