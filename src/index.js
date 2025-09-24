const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("../src/utils/message");

const app = express();
// //Passing app into http.createServer(app) wires up your Express app as the request handler for the HTTP server.
const server = http.createServer(app);

//attaches Socket.IO to the same server so you can handle both HTTP routes and WebSocket events on the same port.
const io = socketio(server);

const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

// socket is an object which contains info about each connected client
io.on("connection", (socket) => {
  console.log("New web socket connection...");

  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb("Bad words are not allowed!");
    }
    io.emit("message", generateMessage(msg)); // emits on all connections
    cb();
  });

  socket.on("sendLocation", (loc, cb) => {
    io.emit(
      "location",
      generateLocationMessage(
        `https://google.com/maps?q=${loc.lat},${loc.lang}`
      )
    );
    cb();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log("Server is running on:", port);
});
