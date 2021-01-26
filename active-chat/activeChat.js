const countElement = document.querySelector('#count');
const modsElement = document.querySelector('#mods');
const vipsElement = document.querySelector('#vips');
const subsElement = document.querySelector('#subs');
const usersElement = document.querySelector('#users');
const statusElement = document.querySelector('#status');
const invertElement = document.querySelectorAll('.invert-text');

const params = new URLSearchParams(window.location.search);
const channel = params.get('channel') || 'JD_Code';
const bg_color = (params.get('bg') || 'NULL').toLowerCase();
const text_color = (params.get('text') || 'NULL').toLowerCase();

const allowedBGColors = ['transparent','white','black','grey'];
const allowedTextColors = ['white','black'];

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [channel],
});

if (allowedBGColors.includes(bg_color)) {
  document.querySelector('body').style.backgroundColor = bg_color;
  if (bg_color === "black") {
    for (let i = 0; i < invertElement.length; i++) {
      invertElement[i].style.color = 'white';
console.log(invertElement[i]);
    }
  }
}

if (allowedTextColors.includes(text_color)) {
  for (let i = 0; i < invertElement.length; i++) {
    invertElement[i].style.color = text_color;
  }
}


client.connect().then(() => {
  statusElement.textContent = `Active chatters in ${channel}... `;
});

let mods = {};
let vips = {}
let subs = {};
let users = {};
let totalCount = 0;

client.on('message', (wat, tags, message, self) => {
  if (self) return;
  const { username } = tags;
  if (tags.badges) {
    if (tags.badges.moderator) mods[tags.username] = true;
    else if (tags.badges.vip) vips[tags.username] = true;
    else if (tags.badges.subscriber || tags.badges.founder) subs[tags.username] = true;
    else users[tags.username] = true;
  } else {
    users[tags.username] = true;
  }
  // display current count page.
  totalCount = Object.keys(mods).length + Object.keys(subs).length + Object.keys(users).length;
  countElement.textContent = totalCount;
  modsElement.textContent = Object.keys(mods).join(', ');
  vipsElement.textContent = Object.keys(vips).join(', ');
  subsElement.textContent = Object.keys(subs).join(', ');
  usersElement.textContent = Object.keys(users).join(', ');
  }
);
