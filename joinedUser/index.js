const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const { JoinedUser } = require("./models/joinedUser");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "JoinedUser") {
    var joinedUser = await new JoinedUser({ points: 0, ...data }).save();
    await axios.post("http://event-bus-srv:4005/events", {
      type: "JoinedUserCreated",
      data: joinedUser._doc,
    });
  }
  if (type === "UserLeft") {
    await JoinedUser.deleteOne({ socketId: data });
  }
  res.send({});
});

const start = async () => {
  try {
    await mongoose.connect("mongodb://joined-user-mongo-srv:27017/joinedUser");
  } catch (error) {
    console.log(error);
  }

  app.listen(4008, () => {
    console.log("Listening on 4008");
  });
};

start();
