import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Chat from "./../components/Chat";
import Login from "./../components/Login";
import Header from "../components/Header";

function MainPage() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Header />
      {isLoggedIn ? <Chat /> : <Login />}
    </>
  );
}

export default MainPage;
