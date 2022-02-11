import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import axios from "axios";
import { Box, Button } from "@mui/material";

const App = () => {
  const [host, setHost] = useState(false);
  const [game, setGame] = useState(null);
  const [screen, setScreen] = useState("home");

  useEffect(() => {
    if (game) {
      setScreen("game");
    }
  }, [game]);

  const handleJoinPress = async (gameCode) => {
    try {
      var res = await axios.get(`http://posts.com/game/${gameCode}`);
      setGame(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateGamePress = async () => {
    try {
      setHost(true);
      var res = await axios.post(`http://posts.com/game`, {});
      setGame(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getScreen = (screen) => {
    if (screen === "home") {
      return <HomeScreen onCreateGameClick={handleCreateGamePress} onJoinClick={handleJoinPress} />;
    } else if (screen === "game") {
      return <GameScreen host={host} game={game} />;
    }
  };

  return <Box>{getScreen(screen)}</Box>;
};
export default App;
