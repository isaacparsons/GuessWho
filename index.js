const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const express = require("express");
const app = express();
app.use(bodyParser.json());
app.use(cors());
const http = require("http").createServer(app);

const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

// round = {
//   gameCode
//   roundNumber,
//   selectedUser,
//   started,
//   expired,
//   prompt,
//   answers
// }
// answers = {
//   selectedUsers,
//   userId,
//   userAnswer
// }
// user = {
//   socketId
//   displayName,
//   points,
//   host,
// }

class Game {
  constructor() {
    this.gameCode = null;
    this.gameStarted = false;
    this.winners = [];
    this.maxPoints = 20;
    this.rounds = [];
    this.joinedUsers = [];
    this.gameFinished = false;
  }
  setGameCode(gameCode) {
    this.gameCode = gameCode;
  }
  getGameCode() {
    return this.gameCode;
  }
  getGameStarted() {
    return this.started;
  }
  addUser(gameCode, displayName, host, socketId) {
    this.joinedUsers.push({
      gameCode: gameCode,
      displayName: displayName,
      socketId: socketId,
      points: 0,
      host: host,
    });
  }
  getJoinedUsers() {
    return this.joinedUsers;
  }
  startGame() {
    this.gameStarted = true;
    this.createRound();
  }
  createRound() {
    var roundNumber = this.rounds.length + 1;
    this.rounds.push({
      gameCode: this.gameCode,
      roundNumber: roundNumber,
      selectedUser: null,
      started: false,
      expired: false,
      prompt: "",
      answers: [],
    });
    var selectedUserIndex = null;
    if (this.rounds.length > this.joinedUsers.length) {
      selectedUserIndex = (this.rounds.length - 1) % this.joinedUsers.length;
    } else {
      selectedUserIndex = this.rounds.length - 1;
    }
    this.rounds[this.rounds.length - 1].selectedUser = this.joinedUsers[selectedUserIndex].displayName;
  }
  startRound(round) {
    var newRounds = this.rounds.map((item) => {
      if (item.roundNumber === round.roundNumber) {
        round.started = true;
        return round;
      }
      return item;
    });

    this.rounds = newRounds;
  }
  editRound(round) {
    var newRounds = this.rounds.map((item) => {
      if (item.roundNumber === round.roundNumber) {
        return round;
      }
      return item;
    });

    this.rounds = newRounds;
  }
  endRound(round) {
    var newRounds = this.rounds.map((item) => {
      if (item.roundNumber === round.roundNumber) {
        round.expired = true;
        return round;
      }
      return item;
    });
    this.rounds = newRounds;
  }
  roundAnswerSubmitted(round) {
    this.editRound(round);
    var roundCompleted = this.isRoundComplete(round);
    if (roundCompleted) {
      this.endRound(round);
      this.updateUsersPoints(round);
      var gameCompleted = this.isGameComplete();
      if (gameCompleted) {
        this.updateWinners();
        this.endGame();
      }
      this.createRound();
    }
  }
  updateUsersPoints(round) {
    var correctUsers = [];
    round.answers.forEach((item) => {
      if (item.userAnswer) {
        correctUsers.push(item.userId);
      }
    });
    var newJoinedUsers = this.joinedUsers.map((user) => {
      round.answers.forEach((answer) => {
        if (answer.userId === user.displayName) {
          var points = user.points;
          console.log(answer.selectedUsers);
          answer.selectedUsers.forEach((item) => {
            if (correctUsers.indexOf(item) >= 0) {
              points += 10;
            } else {
              points -= 10;
            }
          });
          if (points > 0) {
            user.points = points;
          } else {
            user.points = 0;
          }
        }
      });
      return user;
    });
    this.joinedUsers = newJoinedUsers;
  }
  isRoundComplete(round) {
    var submittedAnswerNames = round.answers.map((item) => item.userId);
    var joinedUserIds = this.joinedUsers.map((item) => item.displayName);
    if (submittedAnswerNames.length === joinedUserIds.length) {
      return true;
    }
    return false;
  }
  isGameComplete() {
    var gameComplete = false;
    this.joinedUsers.forEach((user) => {
      if (user.points >= this.maxPoints) {
        gameComplete = true;
      }
    });
    return gameComplete;
  }
  endGame() {
    this.gameFinished = true;
    this.updateWinners();
  }
  updateWinners() {
    var winners = [];
    this.joinedUsers.forEach((user) => {
      if (user.points >= this.maxPoints) {
        winners.push(user.displayName);
      }
    });
    this.winners = winners;
  }
  getGame() {
    return {
      gameCode: this.gameCode,
      gameStarted: this.gameStarted,
      gameFinished: this.gameFinished,
      winners: this.winners,
      maxPoints: this.maxPoints,
      rounds: this.rounds,
      joinedUsers: this.joinedUsers,
    };
  }
  userDisconnected(socketId) {
    var newUsers = this.joinedUsers.filter((item) => {
      if (item.socketId !== socketId) {
        return item;
      }
    });
    this.joinedUsers = newUsers;
  }
}

class GameManager {
  constructor() {
    this.games = [];
    this.socket = null;
    this.io = null;

    io.on("connection", (socket) => {
      this.socket = socket;
      this.io = io;
      console.log("a user connected");

      socket.on("create-game", async (user) => {
        var game = new Game();
        var gameCode = Math.random().toString(36).slice(2, 6);
        game.setGameCode(gameCode);
        game.addUser(gameCode, user.displayName, user.host, socket.id);
        socket.join(gameCode);
        this.games.push(game);
        io.sockets.to(gameCode).emit("game-created", game);
      });

      socket.on("join-game", async (user) => {
        // check if game has started. If not dont join
        var game = this.getGame(user.gameCode);
        if (!game.getGameStarted()) {
          game.addUser(user.gameCode, user.displayName, user.host, socket.id);
          socket.join(user.gameCode);
          this.updateGame(game);
          io.sockets.to(user.gameCode).emit("user-joined", game.getGame());
        }
      });

      socket.on("start-game", async (gameCode) => {
        var game = this.getGame(gameCode);
        game.startGame();
        this.updateGame(game);
        io.sockets.to(gameCode).emit("game-started", game.getGame());
      });

      socket.on("start-round", async (round) => {
        var game = this.getGame(round.gameCode);
        game.startRound(round);
        this.updateGame(game);
        io.sockets.to(round.gameCode).emit("round-started", game.getGame());
      });

      socket.on("edit-round", async (round) => {
        var game = this.getGame(round.gameCode);
        game.editRound(round);
        this.updateGame(game);
        io.sockets.to(round.gameCode).emit("round-editted", game.getGame());
      });

      socket.on("round-answer-submitted", async (round) => {
        var game = this.getGame(round.gameCode);
        game.roundAnswerSubmitted(round);
        this.updateGame(game);
        io.sockets.to(round.gameCode).emit("round-editted", game.getGame());
      });

      socket.on("game-ended", async (gameCode) => {
        var newGames = this.games.filter((game) => {
          if (!game.getGameCode() === gameCode) {
            return game;
          }
        });
        this.games = newGames;
        io.sockets.to(round.gameCode).emit("game-ended", "game-ended");
      });

      socket.on("disconnect", async (err) => {
        var gameCode = null;
        this.games.forEach((game) => {
          var user = game.getJoinedUsers().find((user) => user.socketId === socket.id);
          gameCode = user.gameCode;
        });
        var game = this.getGame(gameCode);
        game.userDisconnected(socket.id);
        this.updateGame(game);
        io.sockets.to(gameCode).emit("user-left", game.getGame());
      });
    });
  }
  getGame(gameCode) {
    return this.games.find((game) => {
      if (game.getGameCode() === gameCode) {
        return game;
      }
    });
  }
  updateGame(newGame) {
    var updatedGames = this.games.map((game) => {
      if (game.getGameCode() === newGame.gameCode) {
        return newGame;
      }
      return game;
    });
    this.games = updatedGames;
  }
}

const gameManager = new GameManager();

app.use(express.static(path.join(__dirname, "./client/build")));
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

http.listen(4006, () => console.log("listening on 4006"));
