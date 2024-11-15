import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const RoomManager = () => {
  const [socket, setSocket] = useState(null);
  const [teamSize, setTeamSize] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isContestJoined, setIsContestJoined] = useState(false);
  const [isTeamJoined, setIsTeamJoined] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [teamNotifications, setTeamNotifications] = useState([]);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Cleanup on component unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for contest joined events
      socket.on('roomJoined', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsContestJoined(true);
      });

      // Listen for team created events
      socket.on('subroomCreated', ({ subroomId, teamName }) => {
        setMessages((prevMessages) => [...prevMessages, `Team ${teamName} created with ID: ${subroomId}`]);
        setTeamId(subroomId);  // Display the team ID
      });

      // Listen for team creation notifications
      socket.on('teamCreated', ({ subroomId, teamName }) => {
        setTeamNotifications((prevNotifications) => [
          ...prevNotifications,
          `Team ${teamName} (ID: ${subroomId}) has been created.`,
        ]);
      });

      // Listen for team join notifications
      socket.on('teamMemberJoined', ({ subroomId, teamName }) => {
        setTeamNotifications((prevNotifications) => [
          ...prevNotifications,
          `A new member has joined team ${teamName} (ID: ${subroomId}).`,
        ]);
      });

      // Listen for team joined events
      socket.on('subroomJoined', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsTeamJoined(true);
      });

      // Listen for chat messages
      socket.on('receiveMessage', ({ sender, message }) => {
        setMessages((prevMessages) => [...prevMessages, `${sender}: ${message}`]);
      });

      // Listen for errors
      socket.on('error', (message) => {
        setMessages((prevMessages) => [...prevMessages, `Error: ${message}`]);
      });
    }
  }, [socket]);

  const handleJoinContest = (e) => {
    e.preventDefault();
    const contestRoom = 'contest';
    socket.emit('createOrJoinRoom', contestRoom);
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (teamSize > 4 || teamSize < 1) {
      alert('Team size must be between 1 and 4.');
    } else if (!teamName.trim()) {
      alert('Please enter a valid team name.');
    } else {
      socket.emit('createSubroom', { mainRoom: 'contest', teamSize: parseInt(teamSize), teamName });
    }
  };

  const handleJoinTeam = () => {
    if (teamId) {
      socket.emit('joinSubroom', { mainRoom: 'contest', subroomId: teamId });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      socket.emit('sendMessage', { mainRoom: 'contest', subroomId: teamId, message: chatMessage });
      setChatMessage(''); // Clear the input field
    }
  };

  return (
    <div>
      <h1>Contest Room</h1>
      {!isContestJoined && (
        <form onSubmit={handleJoinContest}>
          <button type="submit">Join Contest Room</button>
        </form>
      )}

      {isContestJoined && !isTeamJoined && (
        <div>
          <h2>Create a Team</h2>
          <form onSubmit={handleCreateTeam}>
  <label>
    Team Name:
    <input
      type="text"
      value={teamName || ''}  // Ensure teamName is always a string
      onChange={(e) => setTeamName(e.target.value)}
      required
    />
  </label>
  <label>
    Team Size (1-4):
    <input
      type="number"
      value={teamSize || ''}  // Ensure teamSize is always a string (even if it's empty)
      onChange={(e) => setTeamSize(e.target.value)}
      required
    />
  </label>
  <button type="submit">Create Team</button>
</form>

          <h3>Or join an existing team with ID:</h3>
          <input
            type="text"
            placeholder="Enter team ID"
            value={teamId || ''}  // Ensure teamId is always a string
            onChange={(e) => setTeamId(e.target.value)}
/>
          <button onClick={handleJoinTeam}>Join Team</button>
        </div>
      )}

      {isTeamJoined && (
        <div>
          <h2>Team Chat</h2>
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Enter message"
              required
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      <div>
        <h3>Notifications:</h3>
        <ul>
          {teamNotifications.map((notif, idx) => (
            <li key={idx}>{notif}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomManager;
