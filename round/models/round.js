const { Schema, SchemaTypes, model } = require("mongoose");

const round = new Schema(
  {
    roundNumber: {
      type: String,
      required: true,
    },
    gameId: {
      type: SchemaTypes.ObjectId,
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
    correct_users: {
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
