import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Chat from "./../components/Chat";
import LoginRegister from "./../components/LoginRegister";
import Header from "../components/Header";

function MainPage() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Header />
      {isLoggedIn ? <Chat /> : <LoginRegister />}
    </>
  );
}

export default MainPage;
