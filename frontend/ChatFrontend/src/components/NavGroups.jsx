import React, { useState } from "react";
import "./Css/Nav.css"; // Stelle sicher, dass du deinen CSS-Pfad hier richtig angibst
import { AddIcon } from "@chakra-ui/icons";
import {
  Flex,
  Box,
  Link,
  List,
  ListItem,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import useCreateGroup from "../hooks/useCreateGroup";
import useGroups from "../hooks/useGroups";
import useGetUsers from "../hooks/useGetUsers";

import useAddGroupMember from "../hooks/useAddGroupMember";
import { useAuth } from "../context/AuthContext";

function Nav({ groups, setGroups, activeGroupId, setActiveGroupId }) {
  return (
    <Box as="nav">
      <Flex className="nav-icons" direction="column">
        {groups
          .filter((group) => group.type === "direct")
          .map((singlechat) => (
            <Link
              href="#"
              className={activeGroupId === singlechat._id ? "active" : ""}
              onClick={() => setActiveGroupId(singlechat._id)}
            />
          ))}
        <CreateDirectChatModal setGroups={setGroups} />
        <Box as="hr" />
        {groups
          .filter((group) => group.type === "group")
          .map((group) => (
            <Link
              href="#"
              className={activeGroupId === group._id ? "active" : ""}
              onClick={() => setActiveGroupId(group._id)}
            />
          ))}

        <CreateGroupModal setGroups={setGroups} />
      </Flex>
      <Flex className="nav-info" direction="column">
        {groups
          .filter((group) => group.type === "direct")
          .map((singlechat) => {
            return (
              <Box className="info-container">
                <Text color={"white"}>Chat mit {singlechat.name}</Text>
              </Box>
            );
          })}
        <Box className="info-container">
          <Text color={"white"}>Add Singlechat</Text>
        </Box>
        <Box as="hr" className="info" />
        {groups
          .filter((group) => group.type === "group")
          .map((group) => (
            <Box className="info-container">
              <Tooltip
                label={group?.groupUsernames?.join(", ")}
                placement="top"
              >
                <Text color={"white"}>{group.name}</Text>
              </Tooltip>
              <AddMemberModal
                groupId={group._id}
                groupName={group.name}
                groupMembers={group.members}
                setGroups={setGroups}
              />
            </Box>
          ))}
      </Flex>
    </Box>
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
      <Link href="#" className={"add"} onClick={onOpen}>
        <AddIcon boxSize={6} color={"#3ba55d"} id="add-icon" />
      </Link>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Neue Gruppe erstellen</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading && <div>Loading...</div>}

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
function UserSearchWithChakra({ setUserIdToAdd, excludeUsers }) {
  console.log("excludiyy", excludeUsers);
  const { users } = useGetUsers();
  const [userToAdd, setUserToAdd] = useState("");
  const { username } = useAuth();
  const filteredUsers = users
    .filter((user) => !excludeUsers?.includes(user._id)) // Exclude already added members
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

function AddMemberModal({ groupId, groupName, groupMembers, setGroups }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userIdToAdd, setUserIdToAdd] = useState("");
  const { users, loading: usersLoading, error: usersError } = useGetUsers();

  const {
    addGroupMember,
    loading: addGroupMemberLoading,
    error: addGroupMemberError,
  } = useAddGroupMember();

  const handleSave = async () => {
    try {
      const newMember = await addGroupMember(groupId, userIdToAdd);

      if (userIdToAdd) {
        setGroups((prevGroups) => {
          return prevGroups.map((group) => {
            if (group._id === groupId) {
              // Assuming the backend returns the updated group data or just the userId that was added
              // If the backend returns the updated group object
              // return newMember; // If the newMember is the entire updated group object

              // If the backend returns just the userId or similar minimal info
              return {
                ...group,
                members: [...group.members, userIdToAdd], // Adding new userId to existing members array
              };
            } else {
              return group; // Return all other groups unchanged
            }
          });
        });
      }
    } catch (error) {
      console.error("Error adding group member:", error);
      // Optionally handle errors, e.g., by displaying a message to the user
    }
  };

  return (
    <>
      <a href="#" className={"add  add-member"} onClick={onOpen}>
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
            <UserSearchWithChakra
              setUserIdToAdd={setUserIdToAdd}
              excludeUsers={groupMembers}
            />
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
