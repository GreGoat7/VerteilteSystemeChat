import React, { useState } from "react";
import "./Css/Nav.css"; // Stelle sicher, dass du deinen CSS-Pfad hier richtig angibst
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
import useAddGroupMember from "../hooks/useAddGroupMember";
import { useAuth } from "../context/AuthContext";

function Nav({ groups, setGroups, activeGroupId, setActiveGroupId }) {
  console.log("groups", groups);
  return (
    <>
      <nav>
        <div className="nav-icons">
          {groups
            .filter((group) => group.type === "direct")
            .map((singlechat) => (
              <a
                href="#"
                className={activeGroupId === singlechat._id ? "active" : ""}
                onClick={() => setActiveGroupId(singlechat._id)}
              ></a>
            ))}
          <CreateDirectChatModal setGroups={setGroups} />
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
            .filter((group) => group.type === "direct")
            .map((singlechat) => (
              <div className="info-container">
                <span>Chat mit {singlechat.name}</span>
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
function CreateDirectChatModal({ setGroups }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [partnerId, setPartnerId] = useState("");
  const { createDirectChat, loading, error } = useGroups();

  const handleSave = async () => {
    const newDirectChat = await createDirectChat(partnerId);

    setGroups((prevGroups) => [...prevGroups, newDirectChat]);

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
          <ModalHeader>DirectChat mit User starten</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error.message}</div>}
            <UserSearchWithChakra setUserIdToAdd={setPartnerId} />
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
function UserSearchWithChakra({ setUserIdToAdd }) {
  const { users } = useGetUsers();
  const [userToAdd, setUserToAdd] = useState("");
  const { username } = useAuth();
  console.log("usertoadd", userToAdd);
  const filteredUsers = users
    .filter((user) => user.username !== username)
    .filter((user) =>
      user.username.toLowerCase().includes(userToAdd.toLowerCase())
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  const handleOnChange = (e) => {
    setUserToAdd(e.target.value);
    const userToBeAdded = users.find((user) => {
      return user.username === userToAdd;
    });
    console.log("userIdToAdd", userToBeAdded);
    setUserIdToAdd(userToBeAdded._id);
  };

  return (
    <div>
      <Input
        placeholder="Benutzer suchen..."
        value={userToAdd}
        onChange={handleOnChange}
      />
      <List spacing={2}>
        {filteredUsers.map((user) => (
          <ListItem
            key={user.id}
            cursor="pointer"
            onClick={() => {
              setUserToAdd(user.username);
              setUserIdToAdd(user._id);
            }}
          >
            {user.username}
          </ListItem>
        ))}
      </List>
    </div>
  );
}

function AddMemberModal({ groupId, groupName }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userIdToAdd, setUserIdToAdd] = useState("");
  const { users, loading: usersLoading, error: usersError } = useGetUsers();

  const {
    addGroupMember,
    loading: addGroupMemberLoading,
    error: addGroupMemberError,
  } = useAddGroupMember();

  console.log("userIdToAdd", userIdToAdd);
  const handleSave = async () => {
    const newMember = await addGroupMember(groupId, userIdToAdd);
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
            {addGroupMemberLoading && <div>Loading...</div>}
            {addGroupMemberError && (
              <div>Error: {addGroupMemberError.message}</div>
            )}
            <UserSearchWithChakra setUserIdToAdd={setUserIdToAdd} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Hinzufügen
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
