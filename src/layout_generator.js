import fs from "fs";
import chalk from "chalk";

function readConfig(filename) {
  const data = fs.readFileSync(filename, "utf8");
  return JSON.parse(data);
}

const directions = {
  north: "north",
  east: "east",
  south: "south",
  west: "west",
};

class Person {
  constructor(config) {
    this.name = config.name;
    this.position = config.position;
    this.facing_direction = config.facing_direction;
    this.symbol = config.symbol;
  }

  moveAround(room) {
    myRoom.grid[this.position.y][this.position.x] = " ";

    const emptySpaces = room.findEmptySpacesAround(
      this.position.x,
      this.position.y
    );
    // console.log("empty spaces", emptySpaces);

    const randomIndex = Math.floor(Math.random() * emptySpaces.length);
    const newPosition = emptySpaces[randomIndex];
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;

    myRoom.grid[this.position.y][this.position.x] = this.symbol;
  }
}

class Furniture {
  constructor(config) {
    this.name = config.name;
    this.width = config.width;
    this.length = config.length;
    this.buffer = config.buffer;
    this.colour = config.colour;
    this.symbol = config.symbol;
    this.facing_direction = config.facing_direction;
    this.must_touch_wall = config.must_touch_wall;
    this.position = config.position || { x: 0, y: 0 };
    this.createdFurniture = config.createdFurniture;
    this.which_side_touches_wall = config.which_side_touches_wall;
  }
}

class CompoundFurniture {
  constructor(config) {
    this.name = config.name;
    this.components = config.components;
    this.facing_direction = config.facing_direction;
  }
}

class Room {
  constructor(config) {
    this.width = config.room.width + 2 * config.room.wall_thickness;
    this.length = config.room.length + 2 * config.room.wall_thickness;
    this.interiorWidth = config.room.width;
    this.interiorLength = config.room.length;
    this.wallThickness = config.room.wall_thickness;
    this.grid = this.createGrid();
    this.colourGrid = this.createGrid();
    this.placeWalls();
    this.placeWindowsAndDoors(config.room.windows, config.room.doors);
    console.log(this.grid);
    this.printRoom();
    this.furniture = this.createFurniture(config.furniture);
    // console.log("created furniture", this.furniture);
    this.placeFurniture();
  }

  createGrid() {
    return Array.from({ length: this.length }, () =>
      Array.from({ length: this.width }, () => " ")
    );
  }

  findEmptySpacesAround(x, y) {
    const emptySpaces = [];
    const directions = [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: -1 }, // top-left
      { dx: 1, dy: -1 }, // top-right
      { dx: -1, dy: 1 }, // bottom-left
      { dx: 1, dy: 1 }, // bottom-right
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isWithinBounds(newX, newY) && this.grid[newY][newX] === " ") {
        emptySpaces.push({ x: newX, y: newY });
      }
    }

    return emptySpaces;
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.length;
  }

  placeWalls() {
    const isWall = (x, y) =>
      x < this.wallThickness ||
      x >= this.width - this.wallThickness ||
      y < this.wallThickness ||
      y >= this.length - this.wallThickness;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.length; y++) {
        if (isWall(x, y)) {
          this.grid[y][x] = 1; // 1 represents a wall
          this.colourGrid[y][x] = "magenta"; // Default wall color
        }
      }
    }
  }

  placeWindowsAndDoors(windows, doors) {
    for (const window of windows) {
      try {
        console.log("placing window", window);
        this.placeElementOnWall(window, "W");
      } catch (error) {
        console.log(error);
      }
    }
    for (const door of doors) {
      try {
        console.log("placing door", door);
        this.placeElementOnWall(door, "D");
      } catch (error) {
        console.log(error);
      }
    }
  }

  placeElementOnWall(element, symbol) {
    // Door or Window
    try {
      const wallThicknessCells = Math.round(this.wallThickness);

      let startX, startY, endX, endY;
      switch (element.wall) {
        case "north":
          startX = Math.round(element.position) + wallThicknessCells;
          startY = 0;
          endX = startX + Math.round(element.size);
          endY = startY + wallThicknessCells;
          break;
        case "south":
          startX = Math.round(element.position) + wallThicknessCells;
          startY = this.length - wallThicknessCells;
          endX = startX + Math.round(element.size);
          endY = this.length;
          break;
        case "west":
          startX = 0;
          startY = Math.round(element.position) + wallThicknessCells;
          endX = wallThicknessCells;
          endY = startY + Math.round(element.size);
          break;
        case "east":
          startX = this.width - wallThicknessCells;
          startY = Math.round(element.position) + wallThicknessCells;
          endX = this.width;
          endY = startY + Math.round(element.size);
          break;
      }

      // console.log("startX", startX);
      // console.log("startY", startY);
      // console.log("endX", endX);
      // console.log("endY", endY);

      if (startX < 0 || startY < 0 || endX > this.width || endY > this.length) {
        throw new Error("Element is out of bounds");
      } else if (startX === endX || startY === endY) {
        throw new Error("Element has zero size");
      } else if (
        (startX === 0 && startY === 0) || // Top-left corner
        (startX === this.width - wallThicknessCells && startY === 0) || // Top-right corner
        (startX === 0 && endY === this.length) || // Bottom-left corner
        (startX === this.width - wallThicknessCells && endY === this.length) // Bottom-right corner
      ) {
        throw new Error("Element is on a corner wall");
      }

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          this.grid[y][x] = symbol;
          this.colourGrid[y][x] = "cyan"; // Default window/door color
        }
      }

      // Mark interior buffer zone (adjust as needed based on your buffer definition)
      const interiorBufferCells = Math.round(element.buffer);
      switch (element.wall) {
        case "north":
          startY = wallThicknessCells;
          endY = startY + interiorBufferCells;
          break;
        case "south":
          startY = this.length - wallThicknessCells - interiorBufferCells;
          endY = this.length - wallThicknessCells;
          break;
        case "west":
          startX = wallThicknessCells;
          endX = startX + interiorBufferCells;
          break;
        case "east":
          startX = this.width - wallThicknessCells - interiorBufferCells;
          endX = this.width - wallThicknessCells;
          break;
      }

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (this.grid[y][x] === " ") {
            this.grid[y][x] = "━";
            this.colourGrid[y][x] = "cyan"; // Default buffer color
          }
        }
      }

      return true; // Indicate success
    } catch (error) {
      console.log("error placeElementOnWall: ", error);
      return false; // Indicate failure
    }
  }

  createSingleFurniture(furniture) {
    // console.log(furniture);
    console.log("creating:", furniture.name);
    // Create a temporary grid for the furniture
    const combinedLength =
      furniture.length + furniture.buffer.north + furniture.buffer.south;
    const combinedWidth =
      furniture.width + furniture.buffer.east + furniture.buffer.west;
    const grid = Array.from(
      { length: combinedLength },
      () => Array.from({ length: combinedWidth }, () => 0) // 0 represents empty space
    );
    // The first character will contain an arrow indicating the facing direction
    let placedFirstCharacter = false;

    let character = "";
    const furnitureSymbol = furniture.symbol;
    // i is the y
    for (
      let y = 0;
      y < furniture.length + furniture.buffer.north + furniture.buffer.south;
      y++
    ) {
      // j is the x
      for (
        let x = 0;
        x < furniture.width + furniture.buffer.east + furniture.buffer.west;
        x++
      ) {
        // Change character for north buffer
        if (
          y < furniture.buffer.north &&
          x >= furniture.buffer.west &&
          x < combinedWidth - furniture.buffer.east
        ) {
          character = ".";
          // Change character for east buffer
        } else if (
          x > furniture.width + furniture.buffer.west - 1 &&
          y >= furniture.buffer.north &&
          y < combinedLength - furniture.buffer.south
        ) {
          character = ".";
          // Change character for south buffer
        } else if (
          y > furniture.length + furniture.buffer.north - 1 &&
          x > furniture.buffer.west - 1 &&
          x < combinedWidth - furniture.buffer.east &&
          y < combinedLength
        ) {
          character = ".";
          // Change character for west buffer
        } else if (
          x < furniture.buffer.west &&
          y >= furniture.buffer.north &&
          y < combinedLength - furniture.buffer.south
        ) {
          character = ".";
        } else if (
          // Change character for furniture
          x >= furniture.buffer.west &&
          x <= furniture.buffer.east + furniture.width &&
          y >= furniture.buffer.north &&
          y < combinedLength - furniture.buffer.south
        ) {
          if (!placedFirstCharacter) {
            console.log("facing direction:", furniture.facing_direction);
            character = this.getFacingDirectionSymbol("north");
            placedFirstCharacter = true;
          } else {
            character = furnitureSymbol;
          }
        } else {
          character = " ";
        }

        grid[y][x] = character;
      }
    }
    this.printFurniture(grid);
    furniture.createdFurniture = grid;
    return furniture;
  }

  placeComponentOnGrid(targetGrid, componentGrid, position) {
    for (let y = 0; y < componentGrid.length; y++) {
      for (let x = 0; x < componentGrid[0].length; x++) {
        if (componentGrid[y][x] !== 0) {
          targetGrid[position.y + y][position.x + x] = componentGrid[y][x];
        }
      }
    }
  }

  // instead of placing, create it and store it in an array and then try placing it.

  createFurniture(furnitures) {
    const createdFurnitures = furnitures.map((furniture) => {
      // This is a compound furniture
      // Has not been fully implemented yet
      // Need to define specific placement for compound furniture inside the config
      if (furniture.components) {
        console.log("creating compound furniture");
        // Handle compound furniture
        const compoundGrid = this.createGrid();

        // find the main component and process first
        const mainComponent = new Furniture(
          this.createSingleFurniture(
            furniture.components.find((component) => component.main_component)
          )
        );

        // the rest of the components need to be placed relative to the main component
        // make an array of the components that are not the main component
        const subComponents = furniture.components
          .filter((component) => !component.main_component)
          .map((component) => {
            return new Furniture(this.createSingleFurniture(component));
          });

        // place the main component on the grid

        this.placeComponentOnGrid(
          compoundGrid,
          mainComponent.createdFurniture,
          {
            x: 0,
            y: 0,
          }
        );

        console.log("subComponents", subComponents);

        this.placeComponentOnGrid(
          compoundGrid,
          subComponents[0].createdFurniture,
          {
            x: subComponents[0].position.x,
            y: subComponents[0].position.y,
          }
        );

        this.printFurniture(compoundGrid);

        // furniture.components.forEach((component) => {
        //   const createdSubFurniture = new Furniture(
        //     this.createSingleFurniture(component)
        //   );
        //   this.placeComponentOnGrid(
        //     compoundGrid,
        //     createdSubFurniture.createdFurniture,
        //     component.position
        //   );
        // });
        // return { ...furniture, grid: compoundGrid };

        // remove all empty spaces from the grid
        const filteredGrid = compoundGrid
          .filter((row) => row.some((cell) => cell !== " ")) // Remove empty rows
          .map((row) => row.filter((cell) => cell !== " ")); // Remove empty cells within rows
        furniture.createdFurniture = filteredGrid;
        return furniture;
      } else {
        const createdFurniture = this.createSingleFurniture(furniture);
        console.log("created furniture", createdFurniture);
        return new Furniture(this.createSingleFurniture(furniture));
      }
    });

    return createdFurnitures;
  }

  rotateFurniture(furniture, currentOrientation, newOrientation) {
    let rotatedFurniture = furniture;

    let rotations = 0;

    // Determine how many rotations are needed
    if (currentOrientation === newOrientation) {
      return furniture;
    } else if (newOrientation === "east") {
      rotations = 1;
    } else if (newOrientation === "south") {
      rotations = 2;
    } else if (newOrientation === "west") {
      rotations = 3;
    }

    console.log("rotations", rotations);
    console.log("furniture", furniture);

    // Rotate the furniture

    for (let i = 0; i < rotations; i++) {
      const length = rotatedFurniture.length;
      const width = rotatedFurniture[0].length;
      const newFurniture = Array.from({ length: width }, () =>
        Array.from({ length: length }, () => 0)
      );

      for (let y = 0; y < length; y++) {
        for (let x = 0; x < width; x++) {
          // update the arrow direction
          if (rotatedFurniture[y][x] === "↑") {
            newFurniture[x][length - 1 - y] = "→";
          } else if (rotatedFurniture[y][x] === "→") {
            newFurniture[x][length - 1 - y] = "↓";
          } else if (rotatedFurniture[y][x] === "↓") {
            newFurniture[x][length - 1 - y] = "←";
          } else if (rotatedFurniture[y][x] === "←") {
            newFurniture[x][length - 1 - y] = "↑";
          } else {
            newFurniture[x][length - 1 - y] = rotatedFurniture[y][x];
          }
        }
      }

      rotatedFurniture = newFurniture;
    }

    console.log("rotated furniture", rotatedFurniture);

    return rotatedFurniture;
  }

  placeFurniture() {
    this.furniture.forEach((furniture) => {
      if (typeof furniture === "undefined") {
        return;
      }
      console.log("furniture", furniture);
      console.log("placing:", furniture.name);
      const roomWidth = this.width;
      const roomLength = this.length;

      let createdFurniture = furniture.createdFurniture;
      const newOrientation = furniture.facing_direction || "north";
      createdFurniture = this.rotateFurniture(
        createdFurniture,
        "north",
        newOrientation
      );

      console.log("created furniture", createdFurniture);

      const furnitureWidth = createdFurniture[0].length;
      const furnitureLength = createdFurniture.length;
      let furniturePlaced = false;

      // Iterate through the room grid
      for (let y = 0; y < roomLength - 1; y++) {
        for (let x = 0; x < roomWidth - 1; x++) {
          if (!furniturePlaced) {
            let isValid = true;

            // go through each tile and check if the furniture item can be placed there
            // Iterate thiough the furniture grid
            for (let i = 0; i < furnitureLength; i++) {
              for (let j = 0; j < furnitureWidth; j++) {
                if (x + j < roomWidth && y + i < roomLength) {
                  if (
                    this.grid[y + i][j + x] === " " ||
                    createdFurniture[i][j] === " "
                  ) {
                    // Only do this check on the first iteration
                    if (i === 0 && j === 0 && furniture.must_touch_wall) {
                      console.log("furniture must touch wall");
                      // Check to see if the furniture needs to be placed on a wall
                      // The back of the furniture should touch a wall
                      // This is determined by comparing the furnitures orientation with the wall it is touching

                      // First get the current location of the pointer
                      const currentLocation = this.grid[y][x];

                      // Second get the positions of space next to the walls

                      // Third get positions of the back of the furniture

                      // Fourth compare both coridnates and see if the coordinates for the back of the furniture are
                      // in the list of coordinates for the space next to the wall

                      // console.log(
                      //   "facing direction:",
                      //   furniture.facing_direction
                      // ); // facing direction of the furniture

                      /**
                       * Returns the facing wall direction based on the given direction.
                       *
                       * @param {string} direction - The current direction.
                       * @returns {string} - The facing wall direction.
                       */
                      const getBackFacingWall = (direction) => {
                        const currentOrientationIndex = Object.values(
                          directions
                        ).findIndex((item) => item === direction);
                        let newIndex = (currentOrientationIndex + 2) % 4;
                        return Object.values(directions)[newIndex];
                      };

                      let touchingWall;

                      // Currently not implemented
                      // Needs changing
                      if (furniture.which_side_touches_wall) {
                        // touchingWall = furniture.which_side_touches_wall;
                        // furniture.facing_direction = "north";
                        touchingWall = getBackFacingWall(
                          furniture.facing_direction
                        );

                        console.log("which side touches wall:", touchingWall);
                      } else {
                        // Create a list of positions that the furniture can be placed by checking the BackFacingWall
                        touchingWall = getBackFacingWall(
                          furniture.facing_direction
                        );
                      }

                      // get the open tiles to the left of the backFacingWall
                      const openTiles = [];

                      if (touchingWall === "north") {
                        for (let i = 0; i < roomWidth; i++) {
                          if (this.grid[1][i] === " ") {
                            openTiles.push([1, i]);
                          }
                        }
                      } else if (touchingWall === "south") {
                        for (let i = 0; i < roomWidth; i++) {
                          if (this.grid[roomLength - 2][i] === " ") {
                            openTiles.push([roomLength - 2, i]);
                          }
                        }
                      } else if (touchingWall === "west") {
                        for (let i = 0; i < roomLength; i++) {
                          if (this.grid[i][roomWidth - 2] === " ") {
                            openTiles.push(i);
                          }
                        }
                      } else if (touchingWall === "east") {
                        // gets the tiles to the left of the backFacingWall
                        for (let i = 0; i < roomLength; i++) {
                          // console.log(this.grid[i][roomWidth - 2]);
                          if (this.grid[i][roomWidth - 2] === " ") {
                            openTiles.push([i, roomWidth - 2]);
                          }
                        }
                      }
                      // console.log("openTiles:", openTiles);
                      // console.log("this grid");
                      // console.log(this.grid[0][1]);

                      // gets the back row of the furniture based on orientation
                      const backRowPositionsOfFurniture = [];
                      // console.log(createdFurniture);

                      // Need to implement for west and east
                      // If i determine that the furniture must touch a specific wall,
                      // The "back" of the furniture will be the side that is touching the wall
                      // so if i say the furniture is facing north but touching the east wall, it should have a back that is define as the east

                      if (furniture.facing_direction === "north") {
                        createdFurniture[createdFurniture.length - 1].forEach(
                          (item, index) => {
                            backRowPositionsOfFurniture.push([
                              y + createdFurniture.length - 1,
                              x + index,
                            ]);
                          }
                        );
                      } else if (furniture.facing_direction === "south") {
                        // Back row is the first row in the array

                        createdFurniture[0].forEach((item, index) => {
                          backRowPositionsOfFurniture.push([y, x + index]);
                        });
                      } else if (furniture.facing_direction === "west") {
                        // Back row is the first column in the array
                        // NEED TO IMPLEMENT
                      } else if (furniture.facing_direction === "east") {
                        // Back row is the last column in the array
                        // NEED TO IMPLEMENT
                      }
                      // console.log("current position:", y, x);
                      // console.log(
                      //   "backRowPositionsOfFurniture:",
                      //   backRowPositionsOfFurniture
                      // );

                      // Check if all back row positions are in open tiles
                      const allPositionsValid =
                        backRowPositionsOfFurniture.every((position) => {
                          return openTiles.some(
                            (openTile) =>
                              openTile[0] === position[0] &&
                              openTile[1] === position[1]
                          );
                        });

                      if (!allPositionsValid) {
                        isValid = false;
                      }
                    }
                  } else {
                    isValid = false;
                  }
                } else {
                  isValid = false; // If out of bounds, mark as invalid
                }
              }
            }
            // console.log("isValid:", isValid, "x:", x, "y:", y);

            if (isValid) {
              console.log("furniture can be placed");
              furniturePlaced = true;
              // place the furniture
              for (let i = 0; i < furnitureLength; i++) {
                for (let j = 0; j < furnitureWidth; j++) {
                  if (x + j < roomWidth && y + i < roomLength) {
                    // Ensure indices are within bounds
                    if (createdFurniture[i][j] !== " ") {
                      this.grid[y + i][x + j] = createdFurniture[i][j];
                      this.colourGrid[y + i][x + j] = furniture.colour; // Assign color to colorGrid
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  getFacingDirectionSymbol(facingDirection) {
    switch (facingDirection) {
      case "north":
        return "↑";
      case "east":
        return "→";
      case "south":
        return "↓";
      case "west":
        return "←";
    }
  }

  printFurniture(furnitureItem) {
    console.log("printing furniture");
    const yLength = furnitureItem.length;
    const xLength = furnitureItem[0].length;
    for (let y = 0; y < yLength; y++) {
      let row = "";
      for (let x = 0; x < xLength; x++) {
        if (furnitureItem[y][x] === 0) {
          row += " . ";
        } else if (furnitureItem[y][x] === "1") {
          row += " # ";
        } else if (furnitureItem[y][x] === "∎") {
          row += " ∎ ";
        } else if (typeof furnitureItem[y][x] !== "undefined") {
          row += " " + furnitureItem[y][x] + " ";
        } else {
          row += " . ";
        }
      }
      console.log(row);
    }
  }

  printRoom() {
    const colors = {
      reset: chalk.reset,
      bright: chalk.bold,
      dim: chalk.dim,
      underscore: chalk.underline,
      bold: chalk.bold,
      hidden: chalk.hidden,
      reverse: chalk.inverse,

      // Foreground colors
      black: chalk.black,
      red: chalk.red,
      green: chalk.green,
      yellow: chalk.yellow,
      blue: chalk.blue,
      magenta: chalk.magenta,
      cyan: chalk.cyan,
      white: chalk.white,

      // Background colors
      bgBlack: chalk.bgBlack,
      bgRed: chalk.bgRed,
      bgGreen: chalk.bgGreen,
      bgYellow: chalk.bgYellow,
      bgBlue: chalk.bgBlue,
      bgMagenta: chalk.bgMagenta,
      bgCyan: chalk.bgCyan,
      bgWhite: chalk.bgWhite,
    };

    for (let y = 0; y < this.length; y++) {
      let row = "";
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        const color = this.colourGrid[y][x];
        let bgColor = colors.reset; // Default background color

        if (typeof cell === "string" && cell.length > 1 && cell.endsWith("b")) {
          row += colors.dim(" . ");
        } else {
          let symbolColor = colors.reset; // Default color
          if (color && colors[color]) {
            symbolColor = colors[color];
          }
          if (
            color &&
            colors[`bg${color.charAt(0).toUpperCase() + color.slice(1)}`]
          ) {
            bgColor =
              colors[`bg${color.charAt(0).toUpperCase() + color.slice(1)}`];
          }
          const symbol = cell ? ` ${cell} ` : "   ";
          row += bgColor(symbolColor(symbol));
        }
      }
      console.log(row);
    }
  }
}

const config = readConfig("./src/config.json");
const myRoom = new Room(config);
myRoom.printRoom();

const myPerson = new Person({
  name: "John",
  position: { x: 10, y: 1 },
  facing_direction: "north",
  symbol: "P",
});

myRoom.grid[myPerson.position.y][myPerson.position.x] = myPerson.symbol;

for (let i = 0; i < 100; i++) {
  setTimeout(() => {
    console.clear();
    myPerson.moveAround(myRoom);
    // console.log(myPerson.position);
    myRoom.printRoom();
  }, i * 100);
}

// myPerson.moveAround(myRoom);

// myRoom.printRoom();
