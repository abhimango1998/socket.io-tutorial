// We are initializing the io() on the client and here we also receive the socket just like in server so we can send req and res bidirectionally
const socket = io();

// DOM elements
const $messageForm = document.querySelector("#message-form");
const $location = document.querySelector("#location");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");

const $locationBtn = document.querySelector("#location");

const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;

// receiving the event which server sends to us (client)
socket.on("message", (val) => {
  console.log(val);

  const html = Mustache.render(messageTemplate, {
    message: val,
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const msg = e.target.elements.msgInput.value;

  socket.emit("sendMessage", msg, (err) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (err) {
      return console.log(err);
    }

    console.log("Message delivered successfully.");
  });
});

$location.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not available");
  }

  $locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((pos) => {
    const data = {
      lat: pos.coords.latitude,
      lang: pos.coords.longitude,
    };

    socket.emit("sendLocation", data, () => {
      $locationBtn.removeAttribute("disabled");
      console.log("Location shared successfully");
    });
  });
});
