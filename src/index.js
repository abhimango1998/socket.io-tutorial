const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app); //Passing app into http.createServer(app) wires up your Express app as the request handler for the HTTP server.
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))

// socket is an object which contains info about each connected client
io.on('connection', (socket) => {
    console.log('New web socket connection...')

    // countUpdated event is use to send the initial count to the client and also to send any changes to the count.
    // The second args is available on the client cb func param
    socket.emit("message", "Welcome")
    socket.broadcast.emit("message", "A new user has joined!");

    socket.on("sendMessage", (msg)=>{
        // socket.emit("countUpdated", count) // emitting the event on particular connection
        io.emit("message", msg) // emits on all connections
    })

    socket.on('disconnect', () =>{
        io.emit("message", "A user has left!")
    })
})

const port = process.env.PORT || 8000

server.listen(port, () => {
    console.log('Server is running on:', port)
})