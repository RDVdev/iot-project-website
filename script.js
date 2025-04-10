const channelID = "2913872";
const apiURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json`;

const slots = [
  document.getElementById('slot1'),
  document.getElementById('slot2'),
  document.getElementById('slot3'),
  document.getElementById('slot4')
];

const car = document.getElementById('car');
const entryBarrier = document.getElementById('entry-barrier');
const exitBarrier = document.getElementById('exit-barrier');
const rfidText = document.getElementById('rfid-text');
const rfidDot = document.querySelector('.dot');

let lastStates = [0, 0, 0, 0];

function animateCarTo(slotIndex) {
  car.style.display = 'block';
  car.style.left = '50px';

  setTimeout(() => {
    const slot = slots[slotIndex];
    const rect = slot.getBoundingClientRect();
    car.style.top = `${rect.top + window.scrollY + 20}px`;
    car.style.left = `${rect.left + window.scrollX + 30}px`;

    setTimeout(() => {
      car.style.display = 'none';
    }, 3000);
  }, 100);
}

function updateSlots(data) {
  const states = [data.field1, data.field2, data.field3, data.field4].map(v => parseInt(v));
  let vacant = 0, occupied = 0;

  states.forEach((val, idx) => {
    if (val === 1) {
      if (lastStates[idx] === 0) animateCarTo(idx); // New car coming
      slots[idx].classList.add('occupied');
      occupied++;
    } else {
      slots[idx].classList.remove('occupied');
      vacant++;
    }
  });

  lastStates = states;

  // Animate barriers only when data is real
  entryBarrier.classList.add('open');
  exitBarrier.classList.add('open');

  rfidText.textContent = "✅ RFID Detected";
  rfidDot.style.backgroundColor = "#00ff00";

  document.getElementById('vacant-count').textContent = `Vacant: ${vacant}`;
  document.getElementById('occupied-count').textContent = `Occupied: ${occupied}`;
}

async function fetchData() {
  try {
    const res = await fetch(apiURL);
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    updateSlots(data);
  } catch (err) {
    console.warn("Unable to connect to ThingSpeak");

    rfidText.textContent = "🛑 Connecting to server...";
    rfidDot.style.backgroundColor = "#a020f0";
    entryBarrier.classList.remove('open');
    exitBarrier.classList.remove('open');
  }
}

fetchData();
setInterval(fetchData, 15000);
