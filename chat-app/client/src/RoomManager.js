// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');  // Adjust this to your server's address

// const RoomManager = () => {
//   const [contestId, setContestId] = useState('');  // Store contest ID internally, not displayed
//   const [teamId, setTeamId] = useState('');
//   const [teamName, setTeamName] = useState('');
//   const [teamSize, setTeamSize] = useState(2);
//   const [username, setUsername] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [chatMessage, setChatMessage] = useState('');
//   const [teamNotifications, setTeamNotifications] = useState([]);
//   const [contestStarted, setContestStarted] = useState(false);

//   useEffect(() => {
//     // Listen for notifications of new teams being created
//     socket.on('newTeamCreated', ({ subroomId, teamName }) => {
//       setTeamNotifications((prev) => [...prev, `New team "${teamName}" created with ID: ${subroomId}`]);
//     });

//     // Listen for team member joining notifications
//     socket.on('teamMemberJoined', ({ subroomId, teamName, username }) => {
//       setTeamNotifications((prev) => [...prev, `${username} joined team "${teamName}" (ID: ${subroomId})`]);
//     });

//     // Listen for incoming messages
//     socket.on('receiveMessage', (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.off('newTeamCreated');
//       socket.off('teamMemberJoined');
//       socket.off('receiveMessage');
//     };
//   }, []);

//   const handleStartContest = () => {
//     const contestRoomId = 'contest';  // You can dynamically generate this if needed
//     setContestId(contestRoomId);
//     setContestStarted(true);
//     socket.emit('joinContest', contestRoomId);
//   };

//   const handleCreateTeam = (e) => {
//     e.preventDefault();
//     if (teamSize < 1 || teamSize > 4) {
//       alert('Team size must be between 1 and 4.');
//       return;
//     }

//     socket.emit('createTeam', { mainRoom: contestId, teamSize, teamName });
//     socket.on('teamCreated', ({ subroomId, teamName }) => {
//       alert(`Team "${teamName}" created with ID: ${subroomId}`);
//       setTeamId(subroomId);  // Set the current team ID after creating it
//     });
//   };

//   const handleJoinTeam = (e) => {
//     e.preventDefault();
//     socket.emit('joinTeam', { mainRoom: contestId, subroomId: teamId, username });
//     socket.on('teamJoined', (message) => {
//       alert(message);
//     });
//   };

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (chatMessage.trim() === '') return;

//     socket.emit('sendMessage', { mainRoom: contestId, subroomId: teamId, message: chatMessage });
//     setChatMessage('');
//   };

//   return (
//     <div>
//       {!contestStarted ? (
//         <div>
//           <h1>Welcome to the Contest</h1>
//           <button onClick={handleStartContest}>Start Contest</button>
//         </div>
//       ) : (
//         <div>
//           <h2>Create a Team</h2>
//           <form onSubmit={handleCreateTeam}>
//             <input
//               type="text"
//               value={teamName}
//               onChange={(e) => setTeamName(e.target.value)}
//               placeholder="Enter Team Name"
//               required
//             />
//             <input
//               type="number"
//               value={teamSize}
//               onChange={(e) => setTeamSize(Number(e.target.value))}
//               min="1"
//               max="4"
//               placeholder="Enter Team Size (1-4)"
//               required
//             />
//             <button type="submit">Create Team</button>
//           </form>

//           <h2>Join an Existing Team</h2>
//           <form onSubmit={handleJoinTeam}>
//             <input
//               type="text"
//               value={teamId}
//               onChange={(e) => setTeamId(e.target.value)}
//               placeholder="Enter Team ID"
//               required
//             />
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Enter Your Name"
//               required
//             />
//             <button type="submit">Join Team</button>
//           </form>

//           <h2>Team Notifications</h2>
//           <ul>
//             {teamNotifications.map((notification, index) => (
//               <li key={index}>{notification}</li>
//             ))}
//           </ul>

//           <h2>Chat Room</h2>
//           <form onSubmit={handleSendMessage}>
//             <input
//               type="text"
//               value={chatMessage}
//               onChange={(e) => setChatMessage(e.target.value)}
//               placeholder="Enter a message"
//             />
//             <button type="submit">Send</button>
//           </form>

//           <div>
//             <h3>Messages</h3>
//             <ul>
//               {messages.map((msg, index) => (
//                 <li key={index}>{msg.sender}: {msg.message}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoomManager;

///Updated

import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Adjust this to your server's address

const generateContestId = () => {
  return "contest-" + Math.random().toString(36).substr(2, 9); // Generates a unique contest ID
};

const RoomManager = () => {
  const [contestId, setContestId] = useState("");
  const [teams, setTeams] = useState([]); // List of teams joining the contest
  const [teamName, setTeamName] = useState("");
  const [teamSize, setTeamSize] = useState(2);
  const [username, setUsername] = useState("");
  const [isCreator, setIsCreator] = useState(false); // To differentiate between creator and joiner
  const [contestJoined, setContestJoined] = useState(false);

  useEffect(() => {
    // Listen for new teams joining the contest
    socket.on("newTeamCreated", ({ subroomId, teamName }) => {
      setTeams((prevTeams) => [...prevTeams, { teamName, subroomId }]);
    });

    return () => {
      socket.off("newTeamCreated");
    };
  }, []);

  const handleCreateContest = () => {
    const newContestId = generateContestId(); // Generate a unique contest ID
    setContestId(newContestId);
    setIsCreator(true);
    setContestJoined(true);

    socket.emit("joinContest", newContestId);
  };

  const handleJoinContest = (e) => {
    e.preventDefault();
    socket.emit("joinContest", contestId);
    setContestJoined(true);
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (teamSize < 1 || teamSize > 4) {
      alert("Team size must be between 1 and 4.");
      return;
    }

    socket.emit("createTeam", { mainRoom: contestId, teamSize, teamName });
  };

  return (
    <div>
      {!contestJoined ? (
        <div>
          <h1>Contest Portal</h1>
          <button onClick={handleCreateContest}>Create Contest</button>

          <h2>Or Join an Existing Contest</h2>
          <form onSubmit={handleJoinContest}>
            <input
              type="text"
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              placeholder="Enter Contest ID"
              required
            />
            <button type="submit">Join Contest</button>
          </form>
        </div>
      ) : (
        <div>
          <h1>Contest Room: {contestId}</h1>

          {isCreator && (
            <div>
              <h2>Teams in this Contest</h2>
              {teams.length === 0 ? (
                <p>No teams have joined yet.</p>
              ) : (
                <ul>
                  {teams.map((team, index) => (
                    <li key={index}>
                      Team Name: {team.teamName}, Team ID: {team.subroomId}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <h2>Create a Team</h2>
          <form onSubmit={handleCreateTeam}>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name"
              required
            />
            <input
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              min="1"
              max="4"
              placeholder="Enter Team Size (1-4)"
              required
            />
            <button type="submit">Create Team</button>
          </form>

          <h2>Join a Team</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Your Name"
            required
          />
          {/* Handle team joining input and actions here */}
        </div>
      )}
    </div>
  );
};

export default RoomManager;
