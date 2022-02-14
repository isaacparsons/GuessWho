import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import CreateRoundModal from "./CreateRoundModal";
import AnswerRoundModal from "./AnswerRoundModal";

const Round = ({ round, joinedUsers, user, onCreateRound, onSubmitRoundAnswer }) => {
  const [createRoundModal, setCreateRoundModal] = useState(false);
  const [roundSelectionModal, setRoundSelectionModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [userAnswer, setUserAnswer] = useState(false);
  const [selectedUsersAnswer, setSelectedUsersAnswer] = useState([]);

  useEffect(() => {
    if (round) {
      if (round.started && !round.expired) {
        setRoundSelectionModal(true);
      } else {
        setRoundSelectionModal(false);
      }
    }
  }, [round]);

  useEffect(() => {
    if (round) {
      if (round.selectedUser === user._id && !round.started) {
        setCreateRoundModal(true);
      } else {
        setCreateRoundModal(false);
      }
    }
  }, [round, user]);

  const handleSubmitRound = () => {
    round.prompt = prompt;
    onCreateRound(round);
    setCreateRoundModal(false);
  };

  const handleSubmitRoundAnswer = () => {
    round.answers.push({
      userId: user._id,
      userAnswer: userAnswer === "yes" ? true : false,
      selectedUsers: selectedUsersAnswer,
    });
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
          handleSubmitRound={handleSubmitRound}
        />
        <AnswerRoundModal
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          roundSelectionModal={roundSelectionModal}
          roundNumber={roundNumber}
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
