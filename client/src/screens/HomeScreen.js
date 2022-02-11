import React, { useEffect, useState } from "react";

const HomeScreen = ({ onCreateGameClick, onJoinClick }) => {
  const [content, setContent] = useState("");
  return (
    <div className="container">
      <button className="btn btn-primary" onClick={onCreateGameClick}>
        Create Game
      </button>
      <div>
        <input value={content} onChange={(e) => setContent(e.target.value)} className="form-control" />
        <button className="btn btn-primary" onClick={() => onJoinClick(content)}>
          Join Game
        </button>
      </div>
    </div>
  );
};
export default HomeScreen;
