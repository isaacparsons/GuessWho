import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import CreateRoundModal from "./CreateRoundModal";
import AnswerRoundModal from "./AnswerRoundModal";

const Round = ({ round, joinedUsers, user, onEditRound, onSubmitRoundAnswer }) => {
  const [createRoundModal, setCreateRoundModal] = useState(false);
  const [roundSelectionModal, setRoundSelectionModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [userAnswer, setUserAnswer] = useState(false);
  const [selectedUsersAnswer, setSelectedUsersAnswer] = useState([]);

  useEffect(() => {
    if (round) {
      var userAnswer = round.answers.find((item) => item.userId === user.displayName);
      if (round.started && !round.expire && !userAnswer) {
        setRoundSelectionModal(true);
      } else {
        setRoundSelectionModal(false);
      }
    }
  }, [round]);

  useEffect(() => {
    if (round) {
      if (round.selectedUser === user.displayName && !round.started) {
        setCreateRoundModal(true);
      } else {
        setCreateRoundModal(false);
      }
    }
  }, [round, user]);

  const handleCreateRound = () => {
    round.prompt = prompt;
    onEditRound(round);
    setCreateRoundModal(false);
  };

  const handleSubmitRoundAnswer = () => {
    round.answers.push({
      userId: user.displayName,
      userAnswer: userAnswer === "yes" ? true : false,
      selectedUsers: selectedUsersAnswer,
    });
    setUserAnswer(false);
    setSelectedUsersAnswer([]);
    onSubmitRoundAnswer(round);
    setRoundSelectionModal(false);
  };

  const selectUserClick = (e) => {
    var userId = e.target.value;
    if (selectedUsersAnswer.indexOf(userId) >= 0) {
      setSelectedUsersAnswer((prevSelectedUsers) => {
        return prevSelectedUsers.filter((item) => item !== userId);
      });
    } else {
      setSelectedUsersAnswer((prevSelectedUsers) => {
        return [...prevSelectedUsers, userId];
      });
    }
  };
  if (round) {
    var { roundNumber } = round;
    return (
      <Box>
        <CreateRoundModal
          createRoundModal={createRoundModal}
          roundNumber={roundNumber}
          prompt={prompt}
          setPrompt={setPrompt}
          handleSubmitRound={handleCreateRound}
        />
        <AnswerRoundModal
          user={user}
          round={round}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          roundSelectionModal={roundSelectionModal}
          joinedUsers={joinedUsers}
          selectedUsersAnswer={selectedUsersAnswer}
          selectUserClick={selectUserClick}
          handleSubmitRoundAnswer={handleSubmitRoundAnswer}
        />
      </Box>
    );
  }
  return null;
};
export default Round;
