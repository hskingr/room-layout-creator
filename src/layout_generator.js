import fs from "fs";
import { Room } from "./models/Room.js";
import { FurnitureFactory } from "./factory/FurnitureFactory.js";

function readConfig(filename) {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
}

const config = readConfig("./src/config.json");
const myRoom = new Room(config);

// Create furniture separately
const furniture = FurnitureFactory.createFurniture(config.furniture);

// Add furniture to room for placement
myRoom.setFurniture(furniture);
myRoom.printRoom();
