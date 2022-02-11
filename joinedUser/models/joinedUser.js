const { Schema, SchemaTypes, model } = require("mongoose");

const joinedUser = new Schema(
  {
    gameCode: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    host: {
      type: Boolean,
      required: false,
    },
    socketId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const JoinedUser = model("JoinedUser", joinedUser);

module.exports = { JoinedUser };
