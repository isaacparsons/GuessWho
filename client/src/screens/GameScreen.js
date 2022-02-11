import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import JoinedUsers from "../JoinedUsers/JoinedUsers";
import Modal from "@mui/material/Modal";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

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

  const onSubmitRound = (round) => {
    console.log(round);
    socket.emit("edit-round-prompt", round);
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
      <Round round={currentRound} user={user} onSubmitRound={onSubmitRound} />
    </Box>
  );
};
export default GameScreen;
const Round = ({ round, user, onSubmitRound }) => {
  const [createRoundModal, setCreateRoundModal] = useState(false);
  const [roundSelectionModal, setRoundSelectionModal] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    console.log(round);

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
    console.log("test");
    round.prompt = prompt;
    onSubmitRound(round);
    setCreateRoundModal(false);
  };
  if (round) {
    var { roundNumber } = round;
    if (createRoundModal) {
      return (
        <Modal
          open={createRoundModal}
          // onClose={() => setCreateRoundModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <Box
            height={400}
            width={400}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Typography style={{ padding: 5, fontSize: 20 }}>{`Round ${roundNumber}`}</Typography>
            <TextField
              required
              id="outlined-required"
              label="Prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <Button onClick={handleSubmitRound}>Submit</Button>
          </Box>
        </Modal>
      );
    }
    if (roundSelectionModal) {
      return (
        <Modal
          open={roundSelectionModal}
          // onClose={() => setRoundSelectionModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <Box
            height={400}
            width={400}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Typography style={{ padding: 5, fontSize: 20 }}>{`Round ${roundNumber}`}</Typography>

            <Button>Submit</Button>
          </Box>
        </Modal>
      );
    }
  }
  return null;
};

const CreateRound = ({ round, onSubmitRound, createRoundModal, setCreateRoundModal }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmitRound = () => {
    console.log("test");
    round.prompt = prompt;
    onSubmitRound(round);
    setCreateRoundModal(false);
  };
  if (round) {
    var { roundNumber } = round;
    return (
      <Modal
        open={createRoundModal}
        onClose={() => setCreateRoundModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box
          height={400}
          width={400}
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Typography style={{ padding: 5, fontSize: 20 }}>{`Round ${roundNumber}`}</Typography>
          <TextField
            required
            id="outlined-required"
            label="Prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <Button onClick={handleSubmitRound}>Submit</Button>
        </Box>
      </Modal>
    );
  }
  return null;
};
const RoundAnswer = ({ round, onSubmitRound, roundSelectionModal, setRoundSelectionModal }) => {
  if (round) {
    var { roundNumber } = round;
    return (
      <Modal
        open={roundSelectionModal}
        onClose={() => setRoundSelectionModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box
          height={400}
          width={400}
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Typography style={{ padding: 5, fontSize: 20 }}>{`Round ${roundNumber}`}</Typography>
          <TextField required id="outlined-required" label="Prompt" />
          <Button>Submit</Button>
        </Box>
      </Modal>
    );
  }
  return null;
};
{
  /* <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
        <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="no" name="radio-buttons-group">
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl> */
}
