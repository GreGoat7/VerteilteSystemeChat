import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Chat from "./../components/Chat";
import LoginRegister from "./../components/LoginRegister";
import Header from "../components/Header";
import { Spinner } from "@chakra-ui/react";

function MainPage() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    // Show loading feedback
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner size="xl" />
      </div>
    );
  }
  return (
    <>
      <Header />
      {isLoggedIn ? <Chat /> : <LoginRegister />}
    </>
  );
}

export default MainPage;
