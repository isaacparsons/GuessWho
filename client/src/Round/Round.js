import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CreateRoundModal from "./CreateRoundModal";
import AnswerRoundModal from "./AnswerRoundModal";

const Round = ({ round, joinedUsers, user, onEditRound, onSubmitRoundAnswer }) => {
  const [roundStarted, setRoundStarted] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [createRoundModal, setCreateRoundModal] = useState(false);
  const [roundSelectionModal, setRoundSelectionModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [userAnswer, setUserAnswer] = useState(false);
  const [selectedUsersAnswer, setSelectedUsersAnswer] = useState([]);

  useEffect(() => {
    if (round) {
      if (roundStarted && !round.expire && !answerSubmitted) {
        setRoundSelectionModal(true);
      } else {
        setRoundSelectionModal(false);
      }
    }
  }, [round, roundStarted, answerSubmitted]);

  useEffect(() => {
    if (round) {
      if (round.started) {
        setRoundStarted(true);
      } else {
        setRoundStarted(false);
      }
    }
  }, [round]);

  useEffect(() => {
    if (round) {
      var userAnswer = round.answers.find((item) => item.userId === user.displayName);
      if (userAnswer) {
        setAnswerSubmitted(true);
      } else {
        setAnswerSubmitted(false);
      }
    }
  }, [round]);

  useEffect(() => {
    if (round) {
      if (round.selectedUser === user.displayName && !roundStarted) {
        setCreateRoundModal(true);
      } else {
        setCreateRoundModal(false);
      }
    }
  }, [round, user, roundStarted]);

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
        {!roundStarted ? <WaitingForInput text={"Waiting for round to start..."} /> : null}
        {answerSubmitted ? <WaitingForInput text={"Waiting for opponents answers..."} /> : null}
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

const WaitingForInput = ({ text }) => {
  return (
    <Box>
      <Typography>{text}</Typography>
    </Box>
  );
};
export default Round;
