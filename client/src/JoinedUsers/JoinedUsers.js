import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  usersContainer: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
  },
});

const JoinedUsers = ({ joinedUsers }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography style={{ fontSize: 16 }}>Users: </Typography>
      <Box className={classes.usersContainer} style={{}}>
        {joinedUsers.map((user) => {
          return <Typography>{`${user.displayName} has joined the room`}</Typography>;
        })}
      </Box>
    </Box>
  );
};
export default JoinedUsers;
