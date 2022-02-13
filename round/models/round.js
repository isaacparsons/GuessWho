const { Schema, SchemaTypes, model } = require("mongoose");

const round = new Schema(
  {
    roundNumber: {
      type: String,
      required: true,
    },
    gameCode: {
      type: String,
      required: true,
    },
    selectedUser: {
      type: SchemaTypes.ObjectId,
      required: false,
    },
    started: {
      type: Boolean,
      required: true,
    },
    prompt: {
      type: String,
      required: false,
    },
    answers: {
      type: Array,
      required: true,
    },
    expired: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Round = model("Round", round);

module.exports = { Round };
