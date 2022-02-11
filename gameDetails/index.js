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

    var userIds = joinedUsers.map((user) => user._id);
    var roundUserIds = rounds.map((round) => round.selectedUser);
    var usersNotSelected = userIds.filter((userId) => {
      if (!roundUserIds.find((item) => item === userId)) {
        return userId;
      }
    });

    var randomSelection = Math.floor(Math.random() * (usersNotSelected.length - 1));
    if (randomSelection >= 0) {
      var selectedUser = usersNotSelected[randomSelection];
      round.selectedUser = selectedUser;
      await axios.post("http://event-bus-srv:4005/events", {
        type: "RoundUserSelected",
        data: round,
      });
    }
  }
  if (type === "RoundUpdated") {
    var round = data;
    var gameDetails = await GameDetail.findOne({ "game.gameCode": round.gameCode });
    var newRounds = gameDetails.rounds.map((item) => {
      if (item._id === round._id) {
        item = round;
      }
      return round;
    });
    gameDetails.rounds = newRounds;
    await GameDetail.updateOne({ "game.gameCode": round.gameCode }, gameDetails);
    var newGameDetails = await GameDetail.findOne({ "game.gameCode": data.gameCode });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "GameDetailsUpdated",
      data: newGameDetails._doc,
    });
    console.log(newGameDetails);
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
