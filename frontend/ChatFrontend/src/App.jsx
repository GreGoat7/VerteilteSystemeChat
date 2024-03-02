import React from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
}

export default App;
