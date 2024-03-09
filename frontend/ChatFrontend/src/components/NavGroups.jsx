import React, { useState } from "react";
import "./Nav.css"; // Stelle sicher, dass du deinen CSS-Pfad hier richtig angibst
import { AddIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Input,
} from "@chakra-ui/react";

function Nav({ groups, setGroups, activeGroupId, setActiveGroupId }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const addGroup = () => {
    const newGroup = { id: Date.now(), name: `Gruppe ${groups.length + 1}` };
    setGroups([...groups, newGroup]);
  };

  const deleteGroup = (groupId) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  return (
    <>
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

          <CustomModal groups={groups} setGroups={setGroups} />
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
    </>
  );
}

function CustomModal({ groups, setGroups }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupName, setGroupName] = useState("");

  const handleSave = () => {
    const newGroup = {
      type: "group",
      id: groups.length + 1,
      name: groupName,
    };
    setGroups([...groups, newGroup]);

    onClose(); // Modal schließen
  };
  return (
    <>
      <a href="#" className={"add"} onClick={onOpen}>
        <AddIcon boxSize={6} color={"#3ba55d"} id="add-icon" />
      </a>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Neue Gruppe erstellen</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Gruppenname"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Speichern
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Nav;
