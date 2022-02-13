import React from "react";
import Modal from "@mui/material/Modal";
import { Box, Button, TextField, Typography } from "@mui/material";
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

const CreateRoundModal = ({ createRoundModal, roundNumber, setPrompt, prompt, handleSubmitRound }) => {
  const classes = useStyles();
  return (
    <Modal
      open={createRoundModal}
      // onClose={() => setCreateRoundModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className={classes.modalContainer}
    >
      <Box className={classes.container}>
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
};
export default CreateRoundModal;
