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

const JoinedUsers = ({ joinedUsers, maxPoints }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography style={{ fontSize: 16 }}>Users: </Typography>
      <Box className={classes.usersContainer}>
        {joinedUsers.map((user) => {
          return (
            <Box display="flex" flexDirection={"row"}>
              <Typography fontSize={22} padding={1}>{`${user.displayName} `}</Typography>
              <Points points={user.points} maxPoints={maxPoints} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

const Points = ({ maxPoints, points }) => {
  var pointsRatio = `${(points / maxPoints) * 100}%`;
  return (
    <Box display="flex" flexDirection="row" width="100%" alignItems={"center"}>
      <Typography width={100}>{`Points: ${points}`}</Typography>
      <Box style={{ backgroundColor: "#58a36c", height: 10, width: pointsRatio, borderRadius: 5 }}></Box>
    </Box>
  );
};
export default JoinedUsers;
