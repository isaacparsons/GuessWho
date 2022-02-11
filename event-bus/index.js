const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post("http://game-srv:4007/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://joined-user-srv:4008/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://socket-srv:4006/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://game-details-srv:4009/events", event).catch((err) => {
    console.log(err.message);
  });
  axios.post("http://round-srv:4010/events", event).catch((err) => {
    console.log(err.message);
  });
  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Listening on 4005");
});
