import { Furniture } from "./Furniture.js";
import { Grid } from "./Grid.js";
import chalk from "chalk";
import { directions } from "../constants.js";

export class Room {
  constructor(config) {
    this.width = config.room.width + 2 * config.room.wall_thickness;
    this.length = config.room.length + 2 * config.room.wall_thickness;
    this.interiorWidth = config.room.width;
    this.interiorLength = config.room.length;
    this.wallThickness = config.room.wall_thickness;
    this.layoutGrid = new Grid(this.width, this.length);
    this.colorGrid = new Grid(this.width, this.length);
    this.furniture = [];
    this.furniturePlaced = [];
    this.furnitureNotPlaced = [];
    this.placeWalls();
    this.placeWindowsAndDoors(config.room.windows, config.room.doors);
    console.log(this.layoutGrid);
    this.printRoom();
    this.placeFurniture();
  }

  setFurniture(furniture) {
    this.furniture = furniture;
    this.placeFurniture();
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

      if (
        this.layoutGrid.isWithinBounds(newX, newY) &&
        this.layoutGrid.get(newX, newY) === " "
      ) {
        emptySpaces.push({ x: newX, y: newY });
      }
    }

    return emptySpaces;
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
          this.layoutGrid.set(x, y, "1");
          this.colorGrid.set(x, y, "magenta");
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
          this.layoutGrid.set(x, y, symbol);
          this.colorGrid.set(x, y, "cyan");
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
          if (this.layoutGrid.get(x, y) === " ") {
            this.layoutGrid.set(x, y, "━");
            this.colorGrid.set(x, y, "cyan");
          }
        }
      }

      return true; // Indicate success
    } catch (error) {
      console.log("error placeElementOnWall: ", error);
      return false; // Indicate failure
    }
  }

  placeComponentOnGrid(targetGrid, componentGrid, position) {
    for (let y = 0; y < componentGrid.length; y++) {
      for (let x = 0; x < componentGrid[0].length; x++) {
        if (componentGrid[y][x] !== 0) {
          targetGrid.set(position.x + x, position.y + y, componentGrid[y][x]);
        }
      }
    }
  }

  /**
   * Rotates furniture to a new orientation.
   *
   * @param {Array<Array<string|number>>} furniture - 2D array representing the furniture layout.  0 represents empty space, other characters/numbers represent furniture parts.
   * @param {string} currentOrientation - The current orientation of the furniture ('north', 'east', 'south', 'west').  Assumes 'north' if not provided.
   * @param {string} newOrientation - The desired orientation ('north', 'east', 'south', 'west').
   * @returns {Array<Array<string|number>>} - The rotated furniture layout.
   */
  rotateFurniture(furniture, currentOrientation = "north", newOrientation) {
    if (!furniture || furniture.length === 0 || !newOrientation) {
      // Handle invalid input
      console.error("Invalid input to rotateFurniture");
      return furniture; // Or throw an error
    }

    const rotations = {
      // Map orientations to rotation counts (clockwise)
      north: 0,
      east: 1,
      south: 2,
      west: 3,
    };

    const currentRotation = rotations[currentOrientation] || 0; // Default to north
    const targetRotation = rotations[newOrientation];

    if (typeof targetRotation === "undefined") {
      // Handle invalid newOrientation
      console.error("Invalid newOrientation in rotateFurniture");
      return furniture;
    }
    const rotationCount = (targetRotation - currentRotation + 4) % 4; // Calculate rotations needed

    let rotatedFurniture = furniture;
    for (let i = 0; i < rotationCount; i++) {
      const rows = rotatedFurniture.length;
      const cols = rotatedFurniture[0].length;
      const newFurniture = Array.from({ length: cols }, () =>
        Array(rows).fill(0)
      );

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          newFurniture[x][rows - 1 - y] = rotatedFurniture[y][x];

          // Rotate symbols (if needed - adjust symbols as per your usage)
          if (typeof rotatedFurniture[y][x] === "string") {
            const symbols = {
              // Clockwise rotation of symbols
              "↑": "→",
              "→": "↓",
              "↓": "←",
              "←": "↑",
            };
            newFurniture[x][rows - 1 - y] =
              symbols[rotatedFurniture[y][x]] || rotatedFurniture[y][x];
          }
        }
      }
      rotatedFurniture = newFurniture;
    }

    return rotatedFurniture;
  }

  cloneGrid() {
    const newGrid = new Grid(this.width, this.length);
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.width; x++) {
        newGrid.set(x, y, this.layoutGrid.get(x, y));
      }
    }
    return newGrid;
  }

  tryPlaceFurniture(x, y, createdFurniture, color) {
    const tempLayoutGrid = this.layoutGrid.clone();
    const tempColorGrid = this.colorGrid.clone();

    for (let i = 0; i < createdFurniture.length; i++) {
      for (let j = 0; j < createdFurniture[0].length; j++) {
        if (
          x + j < this.width &&
          y + i < this.length &&
          createdFurniture[i][j] !== " "
        ) {
          tempLayoutGrid.set(x + j, y + i, createdFurniture[i][j]);
          tempColorGrid.set(x + j, y + i, color);
        }
      }
    }

    return { tempLayoutGrid, tempColorGrid };
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
                    this.layoutGrid.get(x + j, y + i) === " " ||
                    createdFurniture[i][j] === " "
                  ) {
                    // Only do this check on the first iteration
                    if (i === 0 && j === 0 && furniture.must_touch_wall) {
                      console.log("furniture must touch wall");
                      // Check to see if the furniture needs to be placed on a wall
                      // The back of the furniture should touch a wall
                      // This is determined by comparing the furnitures orientation with the wall it is touching

                      // First get the current location of the pointer
                      const currentLocation = this.layoutGrid.get(x, y);

                      // Second get the positions of space next to the walls

                      // Third get positions of the back of the furniture

                      // Fourth compare both coridnates and see if the coordinates for the back of the furniture are
                      // in the list of coordinates for the space next to the wall

                      // console.log(
                      //   "facing direction:",
                      //   furniture.facing_direction
                      // ); // facing direction of the furniture

                      /**
                       * Returns the opposite facing wall direction based on the given direction.
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

                      let oppositeWallToFacingDirection = getBackFacingWall(
                        furniture.facing_direction
                      );

                      // Currently not implemented
                      // Needs changing
                      if (furniture.which_side_touches_wall) {
                        // touchingWall = furniture.which_side_touches_wall;
                        // furniture.facing_direction = "north";

                        console.log(
                          `The ${furniture.name} is facing ${furniture.facing_direction}`
                        );

                        console.log(
                          `The ${furniture.name} is opposite facing ${oppositeWallToFacingDirection}`
                        );
                      } else {
                        // Create a list of positions that the furniture can be placed by checking the BackFacingWall
                      }

                      // get the open tiles to the left of the backFacingWall
                      const openTiles = [];

                      if (oppositeWallToFacingDirection === "north") {
                        for (let i = 0; i < roomWidth; i++) {
                          if (this.layoutGrid.get(i, 1) === " ") {
                            openTiles.push([1, i]);
                          }
                        }
                      } else if (oppositeWallToFacingDirection === "south") {
                        for (let i = 0; i < roomWidth; i++) {
                          if (this.layoutGrid.get(i, roomLength - 2) === " ") {
                            openTiles.push([roomLength - 2, i]);
                          }
                        }
                      } else if (oppositeWallToFacingDirection === "west") {
                        for (let i = 0; i < roomLength; i++) {
                          if (this.layoutGrid.get(roomWidth - 2, i) === " ") {
                            openTiles.push(i);
                          }
                        }
                      } else if (oppositeWallToFacingDirection === "east") {
                        // gets the tiles to the left of the backFacingWall
                        for (let i = 0; i < roomLength; i++) {
                          // console.log(this.layoutGrid.get(roomWidth - 2, i));
                          if (this.layoutGrid.get(roomWidth - 2, i) === " ") {
                            openTiles.push([i, roomWidth - 2]);
                          }
                        }
                      }
                      // console.log("openTiles:", openTiles);
                      // console.log("this grid");
                      // console.log(this.layoutGrid.get(1, 0));

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

            /*

            I want a section here to check if there is a line that can be drawn from left to right of the grid
            without intersecting any of the furniture items. This will be used to check if the furniture can be placed.

            I also want to do this from the door to the wall. This will be used to check if the furniture can be placed.


            */

            //temporarily place the furniture check to see if it blocks
            // Preview the placement
            const { tempLayoutGrid, tempColorGrid } = this.tryPlaceFurniture(
              x,
              y,
              createdFurniture,
              furniture.colour
            );

            console.log(`temporarily placing furniture for ${furniture.name}`);
            console.log(
              `Preview placement for ${furniture.name} at position (${x}, ${y}):`
            );
            tempLayoutGrid.print(tempColorGrid);

            // // Temporarily swap grids
            const originalLayout = this.layoutGrid;
            const originalColor = this.colorGrid;
            this.layoutGrid = tempLayoutGrid;
            this.colorGrid = tempColorGrid;

            // this.printRoom();

            const isFurnitureBLocking = !this.checkLineLeftToRight();

            if (isFurnitureBLocking) {
              isValid = false;
            }

            // Restore original grids
            this.layoutGrid = originalLayout;
            this.colorGrid = originalColor;

            // console.log("isValid:", isValid, "x:", x, "y:", y);

            if (isValid) {
              // You can add additional validation here if needed
              console.log(`Placing ${furniture.name} at position (${x}, ${y})`);
              furniturePlaced = true;
              // Place the furniture permanently
              for (let i = 0; i < furnitureLength; i++) {
                for (let j = 0; j < furnitureWidth; j++) {
                  if (
                    x + j < roomWidth &&
                    y + i < roomLength &&
                    createdFurniture[i][j] !== " "
                  ) {
                    this.layoutGrid.set(x + j, y + i, createdFurniture[i][j]);
                    this.colorGrid.set(x + j, y + i, furniture.colour);
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  checkLineLeftToRight() {
    const startPositions = [];
    const endPositions = [];

    for (
      let y = this.wallThickness;
      y < this.length - this.wallThickness;
      y++
    ) {
      if (this.layoutGrid.isEmpty(this.wallThickness, y)) {
        startPositions.push({ x: this.wallThickness, y });
      }
      if (this.layoutGrid.isEmpty(this.width - this.wallThickness - 1, y)) {
        endPositions.push({ x: this.width - this.wallThickness - 1, y });
      }
    }

    for (const start of startPositions) {
      for (const end of endPositions) {
        if (this.canDrawLine(start, end)) {
          return true; // Found a path
        }
      }
    }

    return false; // No path found
  }

  canDrawLine(start, end) {
    const tempGrid = this.cloneGrid();

    const queue = [start];
    const visited = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.x === end.x && current.y === end.y) {
        console.log("path found");
        tempGrid.print(this.colorGrid);
        return true; // Path found!
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const neighbor of neighbors) {
        if (
          this.layoutGrid.isWithinBounds(neighbor.x, neighbor.y) &&
          this.layoutGrid.isEmpty(neighbor.x, neighbor.y) &&
          !visited.has(`${neighbor.x},${neighbor.y}`)
        ) {
          queue.push(neighbor);
          visited.add(`${neighbor.x},${neighbor.y}`); // Mark as visited
          tempGrid.set(neighbor.x, neighbor.y, "@");
        }
      }
    }
    return false; // No path found
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
        } else if (furnitureItem[y][x] === "�") {
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
        const cell = this.layoutGrid.get(x, y);
        const color = this.colorGrid.get(x, y);
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
