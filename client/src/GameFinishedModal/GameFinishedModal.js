import React from "react";
import { Box, Button, Modal, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  modalContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 400,
    height: 400,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
  },
});

const GameFinishedModal = ({ gameFinished, winners, onExit }) => {
  const classes = useStyles();
  return (
    <Modal
      open={gameFinished}
      // onClose={() => setRoundSelectionModal(false)}
      className={classes.modalContainer}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.container}>
        <Typography>Winners</Typography>
        <Box>
          {winners.map((item) => {
            return <Typography>{item}</Typography>;
          })}
        </Box>
        <Button onClick={onExit}>exit</Button>
      </Box>
    </Modal>
  );
};
export default GameFinishedModal;
