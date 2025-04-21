<script>
const channelID = "2913872";
const thingSpeakURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json`;
const apiURL = `https://api.allorigins.win/get?url=${encodeURIComponent(thingSpeakURL)}`;

const slots = [
  document.getElementById('slot1'),
  document.getElementById('slot2')
];

const car = document.getElementById('car');
const entryBarrier = document.getElementById('entry-barrier');
const exitBarrier = document.getElementById('exit-barrier');
const rfidText = document.getElementById('rfid-text');
const rfidDot = document.querySelector('.dot');

let lastStates = [0, 0];

function openBarrier(barrier) {
  barrier.classList.add('open');
  setTimeout(() => {
    barrier.classList.remove('open');
  }, 5000);
}

function animateCarTo(slotIndex) {
  const slot = slots[slotIndex];
  const rect = slot.getBoundingClientRect();

  car.style.display = 'block';
  car.style.top = '250px';
  car.style.left = '-60px';

  setTimeout(() => {
    openBarrier(entryBarrier);

    car.style.top = `${rect.top + window.scrollY + 20}px`;
    car.style.left = `${rect.left + window.scrollX + 30}px`;

    setTimeout(() => {
      car.style.display = 'none';
    }, 3000);
  }, 300);
}

function animateCarExit(slotIndex) {
  const slot = slots[slotIndex];
  const rect = slot.getBoundingClientRect();

  car.style.display = 'block';
  car.style.top = `${rect.top + window.scrollY + 20}px`;
  car.style.left = `${rect.left + window.scrollX + 30}px`;

  setTimeout(() => {
    openBarrier(exitBarrier);
    car.style.left = `${window.innerWidth + 100}px`;

    setTimeout(() => {
      car.style.display = 'none';
    }, 3000);
  }, 300);
}

function updateSlots(data) {
  const states = [parseInt(data.field1), parseInt(data.field2)];
  let vacant = 0, occupied = 0;

  states.forEach((val, idx) => {
    if (val === 1) {
      if (lastStates[idx] === 0) {
        animateCarTo(idx); // car just entered
      }
      slots[idx].classList.add('occupied');
      occupied++;
    } else {
      if (lastStates[idx] === 1) {
        animateCarExit(idx); // car just exited
      }
      slots[idx].classList.remove('occupied');
      vacant++;
    }
  });

  lastStates = states;

  rfidText.textContent = "✅ RFID Detected";
  rfidDot.style.backgroundColor = "#00ff00";

  document.getElementById('vacant-count').textContent = `Vacant: ${vacant}`;
  document.getElementById('occupied-count').textContent = `Occupied: ${occupied}`;
}

async function fetchData() {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("API fetch failed");

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents); // <- This is the actual ThingSpeak JSON

    if (data && (data.field1 !== null || data.field2 !== null)) {
      updateSlots(data);
    } else {
      throw new Error("Invalid ThingSpeak data");
    }
  } catch (err) {
    console.warn("Unable to connect to ThingSpeak", err);
    rfidText.textContent = "🛑 Connecting to server...";
    rfidDot.style.backgroundColor = "#a020f0";
  }
}

fetchData();
setInterval(fetchData, 15000);
</script>
