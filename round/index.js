const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const { Round } = require("./models/round");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "StartGame") {
    var round = await new Round({
      roundNumber: 1,
      gameId: data._id,
      selectedUser: null,
      prompt: " ",
      correct_users: [],
      started: false,
      expired: false,
    }).save();
    await axios.post("http://event-bus-srv:4005/events", {
      type: "RoundCreated",
      data: round._doc,
    });
  }
  if (type === "RoundUserSelected") {
    var round = data;
    await Round.updateOne({ _id: round._id }, { $set: { selectedUser: round.selectedUser } });
    var newRound = await Round.findOne({ _id: round._id });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "RoundUpdated",
      data: newRound,
    });
  }
  if (type === "RoundPromptUpdated") {
    var round = data;
    await Round.updateOne({ _id: round._id }, { $set: { prompt: round.prompt, started: true } });
    var newRound = await Round.findOne({ _id: round._id });
    await axios.post("http://event-bus-srv:4005/events", {
      type: "RoundUpdated",
      data: newRound,
    });
  }

  res.send({});
});

const start = async () => {
  try {
    await mongoose.connect("mongodb://round-mongo-srv:27017/round");
  } catch (error) {
    console.log(error);
  }

  app.listen(4010, () => {
    console.log("Listening on 4010");
  });
};

start();
