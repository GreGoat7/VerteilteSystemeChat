import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { extendTheme } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "blue",
  },
};

const theme = extendTheme({
  colors,
  fonts: {
    heading: "Montserrat, sans-serif",
    body: "Roboto, sans-serif",
  },
});

// 3. Pass the `theme` prop to the `ChakraProvider`

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
