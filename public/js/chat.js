// We are initializing the io() on the client and here we also receive the socket just like in server so we can send req and res bidirectionally
const socket = io();

// receiving the event which server sends to us (client) 
socket.on('message', (val) => {
    console.log(val)
})

document.querySelector("#message-form").addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msgInput.value;
    socket.emit("sendMessage", msg)
})