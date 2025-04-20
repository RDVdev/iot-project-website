const channelID = "2913872";
const apiURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json`;

const slots = [
  document.getElementById('slot1'),
  document.getElementById('slot2'),
];

const car = document.getElementById('car');
const entryBarrier = document.getElementById('entry-barrier');
const exitBarrier = document.getElementById('exit-barrier');
const rfidText = document.getElementById('rfid-text');
const rfidDot = document.querySelector('.dot');

let lastStates = [0, 0]; // Only two slots

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

function moveCarToExit() {
  // Move the car towards the exit
  car.style.display = 'block';
  car.style.left = `${window.innerWidth - 60}px`; // Move car towards the exit

  setTimeout(() => {
    car.style.left = '-60px'; // Move the car out of view after 3 seconds

    setTimeout(() => {
      car.style.display = 'none';
    }, 1000);
  }, 2000);
}

function updateSlots(data) {
  const states = [data.field1, data.field2].map(v => parseInt(v)); // Only two slots
  let vacant = 0, occupied = 0;

  states.forEach((val, idx) => {
    if (val === 1) {
      if (lastStates[idx] === 0) animateCarTo(idx); // New car coming
      slots[idx].classList.add('occupied');
      occupied++;
    } else {
      slots[idx].classList.remove('occupied');
      vacant++;

      if (lastStates[idx] === 1) {
        // Car is leaving
        moveCarToExit();
        exitBarrier.classList.add('open');
        setTimeout(() => {
          exitBarrier.classList.remove('open');
        }, 5000); // Close after 5 seconds
      }
    }
  });

  lastStates = states;

  // Animate entry barrier only when new car enters
  if (occupied > 0) {
    entryBarrier.classList.add('open');
    setTimeout(() => {
      entryBarrier.classList.remove('open');
    }, 5000); // Close after 5 seconds
  }

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
