// We are initializing the io() on the client and here we also receive the socket just like in server so we can send req and res bidirectionally
const socket = io();

// receiving the event which server sends to us (client) 
socket.on('countUpdated', (val) => {
    console.log("Count updated!", val)
})

document.querySelector("#inc").addEventListener('click', ()=>{
    socket.emit("increment")
})