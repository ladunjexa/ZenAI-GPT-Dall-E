import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += ".";

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function displayImage(element, source) {
  element.innerHTML += `<img src="${source}" />`;
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi ? "ai" : "user"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // to clear the textarea input
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  if (
    data.get("wid").length === 0 ||
    data.get("hei").length === 0 ||
    !(
      data.get("wid") == 256 ||
      data.get("wid") == 512 ||
      data.get("wid") == 1024
    ) ||
    !(data.get("wid") === data.get("hei"))
  ) {
    data.set("wid", "256");
    data.set("hei", "256");
  }
  const response = await fetch("https://zenai.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
      wid: data.get("wid"),
      hei: data.get("hei"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    displayImage(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
