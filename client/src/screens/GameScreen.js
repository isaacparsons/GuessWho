import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import JoinedUsers from "../JoinedUsers/JoinedUsers";
import { Box, Button, Modal, Typography } from "@mui/material";
import Round from "../Round/Round";
import GameFinishedModal from "../GameFinishedModal/GameFinishedModal";

const GameScreen = ({ gameCode, host, displayName, onExitGame }) => {
  const [game, setGame] = useState(null);
  const [socket, setSocket] = useState(null);
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [gameFinishedModal, setGameFinishedModal] = useState(false);

  useEffect(() => {
    const newSocket = socketIOClient("http://127.0.0.1:4006", {
      reconnection: true,
      transports: ["websocket"],
      upgrade: false,
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket) {
      if (host) {
        socket.emit("create-game", { displayName: displayName, host: host });
      } else {
        socket.emit("join-game", { gameCode: gameCode, displayName: displayName, host: false });
      }
    }
  }, [gameCode, socket]);

  useEffect(() => {
    if (game) {
      setJoinedUsers(game.joinedUsers);
      setRounds(game.rounds);
    }
  }, [game]);

  useEffect(() => {
    var user = joinedUsers.find((item) => item.displayName === displayName);
    setUser(user);
  }, [joinedUsers]);

  useEffect(() => {
    if (rounds.length > 0) {
      setCurrentRound(rounds[rounds.length - 1]);
    }
  }, [rounds]);

  useEffect(() => {
    if (socket) {
      socket.on("user-joined", (game) => {
        setGame(game);
      });
      socket.on("game-created", (game) => {
        setGame(game);
      });
      socket.on("game-started", (game) => {
        setGame(game);
      });
      socket.on("round-started", (game) => {
        setGame(game);
      });
      socket.on("round-editted", (game) => {
        setGame(game);
      });
      socket.on("user-left", (game) => {
        setGame(game);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (game && game.gameFinished) {
      setGameFinishedModal(true);
    }
  }, [game]);

  const startGame = () => {
    socket.emit("start-game", game.gameCode);
  };

  const startRound = (round) => {
    socket.emit("start-round", round);
  };

  const onEditRound = (round) => {
    socket.emit("edit-round", round);
    startRound(round);
  };

  const onSubmitRoundAnswer = (round) => {
    socket.emit("round-answer-submitted", round);
  };

  const onGameEnded = () => {
    socket.emit("game-ended", game.gameCode);
    onExitGame();
  };

  if (game) {
    return (
      <Box style={{ padding: 10 }}>
        <Typography style={{ fontSize: 22 }}>{`Room Code: ${game.gameCode}`}</Typography>
        <JoinedUsers joinedUsers={joinedUsers} maxPoints={game.maxPoints} />
        {host ? (
          <Button style={{ borderRadius: 10, backgroundColor: "#58a36c", color: "white" }} onClick={startGame}>
            start game
          </Button>
        ) : null}
        {!game.gameFinished ? (
          <Round
            joinedUsers={joinedUsers}
            round={currentRound}
            user={user}
            onEditRound={onEditRound}
            onSubmitRoundAnswer={onSubmitRoundAnswer}
          />
        ) : null}
        <GameFinishedModal winners={game.winners} gameFinished={gameFinishedModal} onExit={onGameEnded} />
      </Box>
    );
  } else return null;
};

export default GameScreen;
