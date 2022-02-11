const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(cors());
const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

class Socket {
  constructor() {
    this.socket = null;
    this.io = null;
    io.on("connection", (socket) => {
      this.socket = socket;
      this.io = io;
      console.log("a user connected");

      socket.on("create-game", async (gameCode) => {
        await axios.post("http://event-bus-srv:4005/events", {
          type: "CreateGame",
          data: {},
        });
      });

      socket.on("join-game", async (options) => {
        await axios.post("http://event-bus-srv:4005/events", {
          type: "JoinedUser",
          data: { ...options, socketId: socket.id },
        });
      });

      socket.on("start-game", async (game) => {
        await axios.post("http://event-bus-srv:4005/events", {
          type: "StartGame",
          data: game,
        });
      });

      socket.on("edit-round-prompt", async (round) => {
        console.log(round);
        await axios.post("http://event-bus-srv:4005/events", {
          type: "RoundPromptUpdated",
          data: round,
        });
      });

      socket.on("disconnect", async (err) => {
        await axios.post("http://event-bus-srv:4005/events", {
          type: "UserLeft",
          data: socket.id,
        });
      });
    });
  }
  getSocket() {
    return this.socket;
  }
  getIO() {
    return this.io;
  }
}

const socket = new Socket();

app.post("/events", async (req, res) => {
  console.log("Event Received:", req.body.type);

  const { type, data } = req.body;

  if (type === "GameDetailsUpdated") {
    socket.getIO().sockets.to(data.game.gameCode).emit("game-details-updated", data);
  }
  if (type === "JoinedUserCreated") {
    socket.getSocket().join(data.gameCode);
    socket.getIO().sockets.to(data.gameCode).emit("user-joined", data);
  }

  res.end();
});

// app.listen(4006, () => console.log("listening on 4006"));

http.listen(4006, () => console.log("listening on 4006"));
