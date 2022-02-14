const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const { Game } = require("./models/game");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/game", async (req, res) => {
  var game = await new Game({
    gameCode: "123",
    gameStarted: false,
    winners: [],
    pointsMax: 100,
  }).save();
  var { _id, gameCode, gameStarted, winners, pointsMax } = game._doc;
  await axios.post("http://event-bus-srv:4005/events", {
    type: "GameCreated",
    data: {
      gameId: _id,
      gameCode: gameCode,
      gameStarted: gameStarted,
      winners: winners,
      pointsMax: pointsMax,
    },
  });

  res.send(game._doc);
});
app.get("/game/:gameCode", async (req, res) => {
  var { gameCode } = req.params;
  var game = await Game.findOne({ gameCode: gameCode });
  res.send(game._doc);
});

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "GameEmpty") {
    await Game.deleteMany({ gameCode: gameCode });
  }

  if (type === "GameComplete") {
    var game = data;
    console.log(game);
    // await Game.deleteMany({ gameCode: gameCode });
  }

  res.send({});
});

const start = async () => {
  try {
    await mongoose.connect("mongodb://game-mongo-srv:27017/game");
  } catch (error) {
    console.log(error);
  }

  app.listen(4007, () => {
    console.log("Listening on 4007");
  });
};

start();
