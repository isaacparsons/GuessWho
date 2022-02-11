const { Schema, SchemaTypes, model } = require("mongoose");

const game = new Schema(
  {
    gameCode: {
      type: String,
      required: true,
    },
    gameStarted: {
      type: Boolean,
      required: true,
    },
    winners: {
      type: Array,
      required: true,
    },
    pointsMax: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Game = model("Game", game);

module.exports = { Game };
