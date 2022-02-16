import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import { Box } from "@mui/material";

const App = () => {
  const [screen, setScreen] = useState("home");
  const [displayName, setDisplayName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [host, setHost] = useState(false);

  const handleJoinPress = async () => {
    console.log("game");
    setScreen("game");
  };

  const handleCreateGamePress = async () => {
    setHost(true);
    setScreen("game");
  };

  const onExitGame = () => {
    setScreen("game");
  };

  const getScreen = (screen) => {
    if (screen === "home") {
      return (
        <HomeScreen
          gameCode={gameCode}
          displayName={displayName}
          setDisplayName={setDisplayName}
          setGameCode={setGameCode}
          onCreateGameClick={handleCreateGamePress}
          onJoinGameClick={handleJoinPress}
        />
      );
    } else if (screen === "game") {
      return <GameScreen onExitGame={onExitGame} gameCode={gameCode} host={host} displayName={displayName} />;
    }
  };

  return <Box>{getScreen(screen)}</Box>;
};
export default App;
