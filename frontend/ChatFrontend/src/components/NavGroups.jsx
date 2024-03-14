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
} from "@chakra-ui/react";
import useCreateGroup from "../hooks/useCreateGroup";
import useGroups from "../hooks/useGroups";
import useGetUsers from "../hooks/useGetUsers";
import { Input, List, ListItem } from "@chakra-ui/react";

function Nav({ groups, setGroups, activeGroupId, setActiveGroupId }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { users, loading, error } = useGetUsers();

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
                className={activeGroupId === singlechat._id ? "active" : ""}
                onClick={() => setActiveGroupId(singlechat._id)}
              ></a>
            ))}

          <hr />
          {groups
            .filter((group) => group.type === "group")
            .map((group) => (
              <a
                href="#"
                className={activeGroupId === group._id ? "active" : ""}
                onClick={() => setActiveGroupId(group._id)}
              ></a>
            ))}

          <CreateGroupModal setGroups={setGroups} />
        </div>
        <div className="nav-info">
          {groups
            .filter((group) => group.type === "chat")
            .map((singlechat) => (
              <div className="info-container">
                <span>{singlechat.name}</span>
                <AddMemberModal
                  groupId={singlechat._id}
                  groupName={group.name}
                />
              </div>
            ))}
          <hr />
          {groups
            .filter((group) => group.type === "group")
            .map((group) => (
              <div className="info-container">
                <span>{group.name}</span>
                <AddMemberModal groupId={group._id} groupName={group.name} />
              </div>
            ))}
        </div>
      </nav>
    </>
  );
}

function CreateGroupModal({ setGroups }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupName, setGroupName] = useState("");
  const { createGroup, loading, error } = useGroups();

  const handleSave = async () => {
    const newGroup = await createGroup(groupName);

    setGroups((prevGroups) => [...prevGroups, newGroup]);

    onClose();
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
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
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
function UserSearchWithChakra() {
  const { users } = useGetUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users
    .filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  return (
    <div>
      <Input
        placeholder="Benutzer suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <List spacing={2}>
        {filteredUsers.map((user) => (
          <ListItem key={user.id}>{user.username}</ListItem>
        ))}
      </List>
    </div>
  );
}

function AddMemberModal({ groupId, groupName }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userToAdd, setUserToAdd] = useState("");
  const { users, loading, error } = useGetUsers();

  const filteredUsers = users
    .filter((user) =>
      user.username.toLowerCase().includes(userToAdd.toLowerCase())
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  const handleSave = async () => {
    onClose();
  };

  return (
    <>
      <a href="#" className={"add"} onClick={onOpen}>
        <AddIcon boxSize={6} color={"#3ba55d"} id="add-icon" />
      </a>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User zur Gruppe {groupName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <UserSearchWithChakra />
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
