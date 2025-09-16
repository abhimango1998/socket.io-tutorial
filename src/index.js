const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app); //Passing app into http.createServer(app) wires up your Express app as the request handler for the HTTP server.
const io = socketio(server)

const publicDirPath = path.join(__dirname, '../public')
app.use(express.static(publicDirPath))

let count = 0;

// socket is an object which contains info about each connected client
io.on('connection', (socket) => {
    console.log('New web socket connection...')

    // countUpdated event is use to send the initial count to the client and also to send any changes to the count.
    // The second args is available on the client cb func param
    socket.emit("countUpdated", count)

    socket.on("increment", ()=>{
        count++;
        // socket.emit("countUpdated", count) // emitting the event on particular connection
        io.emit("countUpdated", count) // emits on all connections
    })
})

const port = process.env.PORT || 8000

server.listen(port, () => {
    console.log('Server is running on:', port)
})