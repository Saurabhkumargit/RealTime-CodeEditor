const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "rooms.json");

function loadAllRooms() {
  if (!fs.existsSync(DATA_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveAllRooms(rooms) {
  const persistedRooms = {};

  for (const roomId in rooms) {
    persistedRooms[roomId] = {
      document: rooms[roomId].document,
      lastUpdatedAt: rooms[roomId].lastUpdatedAt,
    };
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(persistedRooms, null, 2));
}

module.exports = {
  loadAllRooms,
  saveAllRooms,
};
