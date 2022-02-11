import React, { useEffect, useState } from "react";

const JoinedUsers = ({ joinedUsers }) => {
  return (
    <div className="container">
      <ul>
        {joinedUsers.map((user) => {
          return <li>{`${user._id} has joined the room`}</li>;
        })}
      </ul>
    </div>
  );
};
export default JoinedUsers;
