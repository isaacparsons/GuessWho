import React from "react";
import Modal from "@mui/material/Modal";
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from "@mui/material";
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

const AnswerRoundModal = ({
  user,
  round,
  joinedUsers,
  selectedUsersAnswer,
  selectUserClick,
  handleSubmitRoundAnswer,
  roundSelectionModal,
  userAnswer,
  setUserAnswer,
}) => {
  const classes = useStyles();
  return (
    <Modal
      open={roundSelectionModal}
      // onClose={() => setRoundSelectionModal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className={classes.modalContainer}
    >
      <Box className={classes.container}>
        <Typography style={{ padding: 5, fontSize: 20 }}>{`Round ${round.roundNumber}`}</Typography>
        <Typography style={{ padding: 5, fontSize: 20 }}>{`${round.prompt}`}</Typography>
        <FormControl value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}>
          <FormLabel id="user-answer-buttons-group-label">Have you?</FormLabel>
          <RadioGroup aria-labelledby="user-answer-buttons-group-label" defaultValue="no" name="radio-buttons-group">
            <FormControlLabel value={"yes"} control={<Radio />} label="Yes" />
            <FormControlLabel value={"no"} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
        <Box display="flex" flexDirection="column">
          {joinedUsers
            .filter((item) => item.displayName !== user.displayName)
            .map((user) => (
              <Box display="flex" flexDirection="row">
                <Typography style={{ padding: 5, fontSize: 16 }}>{`${user.displayName}`}</Typography>
                <Checkbox
                  value={user.displayName}
                  checked={selectedUsersAnswer.indexOf(user.displayName) >= 0}
                  onChange={selectUserClick}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Box>
            ))}
        </Box>
        <Button onClick={handleSubmitRoundAnswer}>Submit</Button>
      </Box>
    </Modal>
  );
};
export default AnswerRoundModal;
