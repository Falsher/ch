const { Schema, model } = require("mongoose");
const randomColor = require("randomcolor");
var color = randomColor();
const userModel = new Schema({
  name: { type: "string", unique: true, required: true },
  password: { type: "string", unique: true, required: true },
  mute: { type: Boolean, default: false },
  online: { type: Boolean, default: true },
  color: { type: "string", default: color },
  dateLastMessage: { type: "string" },
  ban: { type: Boolean, default: false },
  role: { type: "string", required: true },
});

module.exports = model("userModel", userModel);
