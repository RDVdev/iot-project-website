const channelID = "2913872";
const apiURL = `https://api.thingspeak.com/channels/${channelID}/feeds/last.json`;

const slotElements = [
  document.getElementById('slot1'),
  document.getElementById('slot2'),
];

function updateDashboard(data) {
  const slots = [parseInt(data.field1), parseInt(data.field2)];
  let vacant = 0, occupied = 0;

  slots.forEach((val, index) => {
    const el = slotElements[index];
    if (val === 1) {
      el.classList.add('occupied');
      el.classList.remove('vacated');
      occupied++;
    } else {
      el.classList.remove('occupied');
      el.classList.add('vacated');
      vacant++;
    }
  });

  document.getElementById("vacant-count").textContent = `Vacant: ${vacant}`;
  document.getElementById("occupied-count").textContent = `Occupied: ${occupied}`;
}

async function fetchData() {
  try {
    const res = await fetch(apiURL);
    const data = await res.json();
    updateDashboard(data);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

// Fetch every 15 seconds
fetchData();
setInterval(fetchData, 15000);
