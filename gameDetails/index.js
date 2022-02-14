const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const { GameDetail } = require("./models/gameDetails");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/gameDetails/:gameId", async (req, res) => {
  var { gameId } = req.params;
  var gameDetails = await GameDetail.findOne({ "game.gameId": gameId });
  res.send(gameDetails);
});

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "GameCreated") {
    var gameDetails = await new GameDetail({
      game: data,
      rounds: [],
      joinedUsers: [],
    }).save();
    await axios.post("http://event-bus-srv:4005/events", {
      type: "GameDetailsUpdated",
      data: gameDetails._doc,
    });
  }
  if (type === "JoinedUserCreated") {
    var gameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
    if (gameDetails) {
      gameDetails.joinedUsers.push(data);
      await GameDetail.updateOne({ _id: gameDetails._id }, { $set: { joinedUsers: gameDetails.joinedUsers } });
      var newGameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
      await axios.post("http://event-bus-srv:4005/events", {
        type: "GameDetailsUpdated",
        data: newGameDetails._doc,
      });
    }
  }
  if (type === "JoinedUserUpdated") {
    var gameDetails = await GameDetail.findOne({ "joinedUsers._id": data._id });
    var { joinedUsers } = gameDetails;
    var updatedJoinedUsers = joinedUsers.map((item) => {
      if (item._id === data._id) {
        return data;
      }
      return item;
    });
    gameDetails.joinedUsers = updatedJoinedUsers;
    console.log(gameDetails);
    await axios.post("http://event-bus-srv:4005/events", {
      type: "GameDetailsUpdated",
      data: gameDetails,
    });

    await GameDetail.updateOne({ _id: gameDetails._id }, gameDetails);
    var newGameDetails = await GameDetail.findOne({ _id: gameDetails._id });
  }
  if (type === "RoundCreated") {
    var round = data;
    var gameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
    var rounds = gameDetails.rounds;
    var joinedUsers = gameDetails.joinedUsers;

    gameDetails.rounds.push(round);
    await GameDetail.updateOne({ _id: gameDetails._id }, { $set: { rounds: gameDetails.rounds } });
    var newGameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "GameDetailsUpdated",
      data: newGameDetails._doc,
    });

    var selectedUser = selectRoundUser(rounds, joinedUsers);
    round.selectedUser = selectedUser;
    await axios.post("http://event-bus-srv:4005/events", {
      type: "RoundUserSelected",
      data: round,
    });
  }
  if (type === "RoundUpdated") {
    var round = data;
    var gameDetails = await GameDetail.findOne({ "game.gameCode": round.gameCode });
    var { joinedUsers, rounds, game } = gameDetails;

    var updatedRounds = updateRounds(rounds, round);
    gameDetails.rounds = updatedRounds;
    await GameDetail.updateOne({ "game.gameCode": round.gameCode }, gameDetails);

    var newGameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "GameDetailsUpdated",
      data: newGameDetails._doc,
    });

    var roundCompleted = isRoundComplete(round, joinedUsers);
    if (roundCompleted && !round.expired) {
      var updatedUsers = updateUserPoints(round, joinedUsers);
      updatedUsers.forEach(async (user) => {
        await axios.post("http://event-bus-srv:4005/events", {
          type: "UserPointsChanged",
          data: user,
        });
      });

      await axios.post("http://event-bus-srv:4005/events", {
        type: "RoundComplete",
        data: round,
      });
    }

    // check if any users have reached the game point limit
    var winners = getGameWinners(game, joinedUsers);
    game.winners = winners;

    if (winners.length > 0) {
      await axios.post("http://event-bus-srv:4005/events", {
        type: "GameComplete",
        data: game,
      });
    }
  }
  if (type === "UserLeft") {
    var gameDetails = await GameDetail.findOne({ "joinedUsers.socketId": data });
    if (gameDetails) {
      var joinedUsers = gameDetails.joinedUsers;
      var newJoinedUsers = joinedUsers.filter((item) => {
        if (item.socketId !== data) {
          return item;
        }
      });
      await GameDetail.updateOne({ _id: gameDetails._id }, { $set: { joinedUsers: newJoinedUsers } });
      var newGameDetails = await GameDetail.findOne({ _id: gameDetails._id });
      await axios.post("http://event-bus-srv:4005/events", {
        type: "GameDetailsUpdated",
        data: newGameDetails._doc,
      });
    }
  }
  if (type === "GameEmpty") {
    var gameCode = data;
    await GameDetail.deleteOne({ "game.gameCode": gameCode });
  }
  res.send({});
});

const updateRounds = (rounds, newRound) => {
  return rounds.map((item) => {
    if (item._id === newRound._id) {
      return newRound;
    }
    return item;
  });
};
const selectRoundUser = (rounds, joinedUsers) => {
  var userIds = joinedUsers.map((user) => user._id);
  var selectedUser = Math.floor(Math.random() * (userIds.length - 1));
  return userIds[selectedUser];
};
const isRoundComplete = (round, joinedUsers) => {
  var userIds = joinedUsers.map((item) => item._id);
  var answerSubmittedUserIds = round.answers.map((item) => item.userId);
  if (userIds.length === answerSubmittedUserIds.length) {
    return true;
  }
  return false;
};
const updateUserPoints = (round, joinedUsers) => {
  var usersVotedYes = [];
  round.answers.forEach((item) => {
    if (item.userAnswer) {
      usersVotedYes.push(item.userId);
    }
  });

  var updatedJoinedUsers = [];
  joinedUsers.forEach((user) => {
    var { _id } = user;
    var userAnswer = round.answers.find((item) => item.userId === _id);
    var points = 0;
    userAnswer.selectedUsers.forEach((item) => {
      if (usersVotedYes.indexOf(item) >= 0) {
        points += 10;
      }
    });
    user.points = points;
    updatedJoinedUsers.push(user);
  });
  return updatedJoinedUsers;
};
const getGameWinners = (game, joinedUsers) => {
  var winners = [];
  var pointsMax = game.pointsMax;
  joinedUsers.forEach((user) => {
    if (user.points >= pointsMax) {
      winners.push(user._id);
    }
  });
  return winners;
};

const start = async () => {
  try {
    await mongoose.connect("mongodb://game-details-mongo-srv:27017/gameDetail");
  } catch (error) {
    console.log(error);
  }

  app.listen(4009, () => {
    console.log("Listening on 4009");
  });
};

start();
