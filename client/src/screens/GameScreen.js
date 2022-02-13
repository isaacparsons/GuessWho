import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import JoinedUsers from "../JoinedUsers/JoinedUsers";
import { Box, Button, Typography } from "@mui/material";
import Round from "../Round/Round";

const GameScreen = ({ game, host, displayName }) => {
  const [socket, setSocket] = useState(null);
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);

  useEffect(() => {
    const newSocket = socketIOClient("http://posts.com/", {
      reconnection: true,
      transports: ["websocket"],
      upgrade: false,
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (game && socket) {
      socket.emit("join-game", { gameCode: game.gameCode, displayName: displayName, host: host });
    }
  }, [game, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("user-joined", (joinedUser) => {
        setUser(joinedUser);
      });
      socket.on("game-details-updated", (gameDetails) => {
        setJoinedUsers(gameDetails.joinedUsers);
        setRounds(gameDetails.rounds);
      });
      socket.on("disconnect", () => {
        socket.emit("user-left", user);
      });
    }
  }, [socket]);

  useEffect(() => {
    var _round = rounds.find((item) => !item.expired);
    setCurrentRound(_round);
  }, [rounds]);

  const startGame = () => {
    socket.emit("start-game", game);
  };

  const onCreateRound = (round) => {
    socket.emit("edit-round-prompt", round);
  };

  const onSubmitRoundAnswer = (round) => {
    socket.emit("round-answer-submitted", round);
  };

  return (
    <Box style={{ padding: 10 }}>
      {game ? <Typography style={{ fontSize: 22 }}>{`Room Code: ${game.gameCode}`}</Typography> : null}
      {user ? <Typography style={{ fontSize: 20 }}>{`User Name: ${user.displayName}`}</Typography> : null}
      <JoinedUsers joinedUsers={joinedUsers} />
      {host ? (
        <Button style={{ borderRadius: 10, backgroundColor: "#58a36c", color: "white" }} onClick={startGame}>
          startGame
        </Button>
      ) : null}
      <Round
        joinedUsers={joinedUsers}
        round={currentRound}
        user={user}
        onCreateRound={onCreateRound}
        onSubmitRoundAnswer={onSubmitRoundAnswer}
      />
    </Box>
  );
};
export default GameScreen;
