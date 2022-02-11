const { Schema, SchemaTypes, model } = require("mongoose");

const gameDetails = new Schema(
  {
    game: {
      type: Object,
      required: true,
    },
    rounds: {
      type: Array,
      required: true,
    },
    joinedUsers: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

const GameDetail = model("GameDetails", gameDetails);

module.exports = { GameDetail };
