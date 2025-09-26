const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("../src/utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("New web socket connection...");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on("sendMessage", (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb("Bad words are not allowed!");
    }

    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage(user.username, msg));
    }
    cb();
  });

  socket.on("sendLocation", (loc, cb) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "location",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${loc.lat},${loc.lang}`
        )
      );
    }
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("user leaving-----", user);
    if (user)
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log("Server is running on:", `http://localhost:${port}`);
});
