// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// // Object to store rooms and subrooms (teams)
// const rooms = {};

// // Listen for connections
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Event for joining the main contest room
//   socket.on('joinContest', (mainRoom) => {
//     if (!rooms[mainRoom]) {
//       rooms[mainRoom] = { users: [], subrooms: {} };
//     }
//     rooms[mainRoom].users.push(socket.id);
//     socket.join(mainRoom);
//     socket.emit('contestJoined', `You have joined the contest room: ${mainRoom}`);
//     console.log(`${socket.id} joined contest room ${mainRoom}`);
//   });

//   // Event for creating a subroom (team)
//   socket.on('createTeam', ({ mainRoom, teamSize, teamName }) => {
//     if (teamSize > 4 || teamSize < 1) {
//       socket.emit('error', 'Team size must be between 1 and 4');
//       return;
//     }

//     // Create a unique ID for the team (subroom)
//     const subroomId = `${mainRoom}_team_${Object.keys(rooms[mainRoom].subrooms).length + 1}`;
//     rooms[mainRoom].subrooms[subroomId] = {
//       users: [],
//       size: teamSize,
//       teamName,
//     };

//     // Emit team creation details back to the user who created the team
//     socket.emit('teamCreated', { subroomId, teamName });

//     // Notify everyone in the contest room about the new team
//     io.to(mainRoom).emit('newTeamCreated', { subroomId, teamName });
    
//     console.log(`Team "${teamName}" created in contest room ${mainRoom} with ID: ${subroomId}`);
//   });

//   // Event for joining a subroom (team) by team ID and username
//   socket.on('joinTeam', ({ mainRoom, subroomId, username }) => {
//     const subroom = rooms[mainRoom]?.subrooms[subroomId];

//     if (subroom && subroom.users.length < subroom.size) {
//       subroom.users.push({ id: socket.id, username });
//       socket.join(subroomId);
//       socket.emit('teamJoined', `You have joined the team: ${subroom.teamName}`);
      
//       // Notify everyone in the contest room that someone joined the team
//       io.to(mainRoom).emit('teamMemberJoined', { subroomId, teamName: subroom.teamName, username });
      
//       console.log(`${socket.id} (as ${username}) joined team "${subroom.teamName}" in subroom ${subroomId}`);
//     } else {
//       socket.emit('error', 'Team is full or does not exist');
//     }
//   });

//   // Event for sending a message in a subroom (team)
//   socket.on('sendMessage', ({ mainRoom, subroomId, message }) => {
//     if (rooms[mainRoom]?.subrooms[subroomId]) {
//       const sender = rooms[mainRoom].subrooms[subroomId].users.find((user) => user.id === socket.id);
//       const senderName = sender ? sender.username : 'Anonymous';

//       io.to(subroomId).emit('receiveMessage', {
//         sender: senderName,
//         message,
//       });
//     } else {
//       socket.emit('error', 'You are not in a valid team');
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);

//     // Remove the user from all rooms and subrooms
//     for (let room in rooms) {
//       rooms[room].users = rooms[room].users.filter((user) => user !== socket.id);
//       for (let subroom in rooms[room].subrooms) {
//         rooms[room].subrooms[subroom].users = rooms[room].subrooms[subroom].users.filter(
//           (user) => user.id !== socket.id
//         );
//       }
//     }
//   });
// });

// // Start the server
// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


/// Updated 

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// In-memory store for contest rooms and teams
let contests = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  // When a user joins a contest
  socket.on('joinContest', (contestId) => {
    if (!contests[contestId]) {
      contests[contestId] = { teams: [] };
    }
    socket.join(contestId);
    socket.emit('contestJoined', { message: `You joined contest: ${contestId}` });
    console.log(`User joined contest: ${contestId}`);
  });

  // When a user creates a team
  socket.on('createTeam', ({ mainRoom, teamSize, teamName }) => {
    const subroomId = 'team-' + Math.random().toString(36).substring(2, 9);  // Unique team ID
    socket.join(subroomId);

    // Add team to the contest room
    contests[mainRoom].teams.push({ subroomId, teamName });

    // Notify everyone in the contest about the new team
    io.in(mainRoom).emit('newTeamCreated', { subroomId, teamName });
    
    socket.emit('teamCreated', { subroomId, teamName });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server on port 3000
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
