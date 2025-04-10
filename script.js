const channelID = 'YOUR_CHANNEL_ID';  // Replace with yours
const readAPIKey = 'YOUR_READ_API_KEY'; // Leave as "" if public

async function fetchParkingData() {
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?results=1${readAPIKey ? '&api_key=' + readAPIKey : ''}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const latest = data.feeds[0];

    // Assuming you have 4 slots (field1 to field4)
    for (let i = 1; i <= 4; i++) {
      const value = latest[`field${i}`];
      const slot = document.getElementById(`slot${i}`);
      if (value === "1") {
        slot.classList.add("occupied");
      } else {
        slot.classList.remove("occupied");
      }
    }

  } catch (err) {
    console.error("Error fetching data from ThingSpeak:", err);
  }
}

// Initial fetch
fetchParkingData();

// Auto refresh every 15 seconds
setInterval(fetchParkingData, 15000);
