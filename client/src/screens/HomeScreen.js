import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 400,
    height: 100,
    margin: 20,
    borderRadius: 50,
    backgroundColor: "#58a36c",
    color: "white",
  },
  gameCodeContainer: {
    display: "flex",
    flexDirection: "row",
    width: 150,
  },
  gameCodeTextContainer: {
    height: 50,
    lineHeight: 1.5,
  },
  joinGameContainer: {
    display: "flex",
    flexDirection: "column",
  },
});

const HomeScreen = ({ gameCode, setGameCode, onCreateGameClick, onJoinGameClick, displayName, setDisplayName }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.gameCodeContainer}>
        <Typography>Display Name: </Typography>
        <TextField
          className={classes.gameCodeTextContainer}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </Box>
      <Button
        style={{ opacity: displayName.length === 0 ? 0.5 : 1 }}
        disabled={displayName.length === 0}
        className={classes.button}
        onClick={onCreateGameClick}
      >
        Create Game
      </Button>
      <Box className={classes.joinGameContainer}>
        <Button
          style={{ opacity: gameCode.length === 0 ? 0.5 : 1 }}
          disabled={gameCode.length === 0}
          className={classes.button}
          onClick={onJoinGameClick}
        >
          Join Game
        </Button>
        <Box className={classes.gameCodeContainer}>
          <Typography>Game Code: </Typography>
          <TextField
            className={classes.gameCodeTextContainer}
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
        </Box>
      </Box>
    </Box>
  );
};
export default HomeScreen;
