// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');  // Import CORS

// Setup the server
const app = express();

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow your React app's URL (Adjust if different)
  methods: ['GET', 'POST'],
  credentials: true // Allow credentials (such as cookies) if needed
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow your React app's URL (Adjust if different)
    methods: ['GET', 'POST'],
    credentials: true // Allow credentials for socket connection
  }
});

// Object to keep track of rooms and their subrooms
const rooms = {};

// Listen for connections
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Event for creating/joining a main room (contest)
  socket.on('createOrJoinRoom', (mainRoom) => {
    if (!rooms[mainRoom]) {
      rooms[mainRoom] = { users: [], subrooms: {} };
    }
    rooms[mainRoom].users.push(socket.id);
    socket.join(mainRoom);
    socket.emit('roomJoined', `Joined main room: ${mainRoom}`);
    console.log(`${socket.id} joined main room ${mainRoom}`);
  });

  // Event for creating a subroom (team) with a specific size and team name
  socket.on('createSubroom', ({ mainRoom, teamSize, teamName }) => {
    if (teamSize > 4 || teamSize < 1) {
      socket.emit('error', 'Team size must be between 1 and 4');
      return;
    }

    // Create a unique ID for the subroom (team)
    const subroomId = `${mainRoom}_subroom_${Object.keys(rooms[mainRoom].subrooms).length + 1}`;
    rooms[mainRoom].subrooms[subroomId] = { users: [], size: teamSize, teamName };

    // Emit team creation details to the creator
    socket.emit('subroomCreated', { subroomId, teamName });
    
    // Notify everyone in the main room about the new team
    io.to(mainRoom).emit('teamCreated', { subroomId, teamName });
    
    console.log(`Team ${teamName} created in main room ${mainRoom} with ID: ${subroomId}`);
  });

  // Event for joining a subroom (team) by team ID
  socket.on('joinSubroom', ({ mainRoom, subroomId }) => {
    const subroom = rooms[mainRoom].subrooms[subroomId];

    if (subroom && subroom.users.length < subroom.size) {
      subroom.users.push(socket.id);
      socket.join(subroomId);
      socket.emit('subroomJoined', `Joined team: ${subroom.teamName}`);
      
      // Notify other users in the main room that someone joined a team
      io.to(mainRoom).emit('teamMemberJoined', { subroomId, teamName: subroom.teamName });
      
      console.log(`${socket.id} joined team ${subroom.teamName} in subroom ${subroomId}`);
    } else {
      socket.emit('error', 'Team is full or does not exist');
    }
  });

  // Event for sending a message in a subroom (team)
  socket.on('sendMessage', ({ mainRoom, subroomId, message }) => {
    // Broadcast the message only to users in the same subroom (team)
    if (rooms[mainRoom] && rooms[mainRoom].subrooms[subroomId]) {
      io.to(subroomId).emit('receiveMessage', {
        sender: socket.id,
        message,
      });
    } else {
      socket.emit('error', 'You are not in a valid team');
    }
  });

  // Event for disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    // Remove user from all rooms and subrooms
    for (let room in rooms) {
      rooms[room].users = rooms[room].users.filter((user) => user !== socket.id);
      for (let subroom in rooms[room].subrooms) {
        rooms[room].subrooms[subroom].users = rooms[room].subrooms[subroom].users.filter(
          (user) => user !== socket.id
        );
      }
    }
  });
});

// Start the server
server.listen(5000, () => {
  console.log('Listening on *:3000');
});
