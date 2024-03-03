import React, { useState } from "react";
import "./Nav.css"; // Stelle sicher, dass du deinen CSS-Pfad hier richtig angibst
import { AddIcon } from "@chakra-ui/icons";

function Nav() {
  const [activeGroupId, setActiveGroupId] = useState(0);
  const [groups, setGroups] = useState([
    { type: "group", id: 1, name: "Gruppe 1" },
    { type: "group", id: 2, name: "Gruppe 2" },
    { type: "chat", id: 3, name: "Chat sdfsdfsdf1" },
  ]);

  const addGroup = () => {
    const newGroup = { id: Date.now(), name: `Gruppe ${groups.length + 1}` };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (groupId) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  return (
    <nav>
      <div className="nav-icons">
        {groups
          .filter((group) => group.type === "chat")
          .map((singlechat) => (
            <a
              href="#"
              className={activeGroupId === singlechat.id ? "active" : ""}
              onClick={() => setActiveGroupId(singlechat.id)}
            ></a>
          ))}

        <hr />
        {groups
          .filter((group) => group.type === "group")
          .map((group) => (
            <a
              href="#"
              className={activeGroupId === group.id ? "active" : ""}
              onClick={() => setActiveGroupId(group.id)}
            ></a>
          ))}
        <a
          href="#"
          className={"add"}
          onClick={() => setActiveGroupId(group.id)}
        >
          <AddIcon boxSize={6} color={"#3ba55d"} id="add-icon" />
        </a>
      </div>
      <div className="nav-info">
        {groups
          .filter((group) => group.type === "chat")
          .map((singlechat) => (
            <div className="info-container">
              <span>{singlechat.name}</span>
              <button onClick={() => deleteGroup(singlechat.id)}>
                Löschen
              </button>
            </div>
          ))}
        <hr />
        {groups
          .filter((group) => group.type === "group")
          .map((group) => (
            <div className="info-container">
              <span>{group.name}</span>
              <button onClick={() => deleteGroup(group.id)}>Löschen</button>
            </div>
          ))}
      </div>
    </nav>
  );
}

export default Nav;
