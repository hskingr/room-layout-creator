import { Furniture } from "../models/Furniture.js";

export class FurnitureFactory {
  static createFurniture(furnitureConfigs) {
    return furnitureConfigs.map((config) => {
      // This is a compound furniture
      // Has not been fully implemented yet
      // Need to define specific placement for compound furniture inside the config
      if (config.components) {
        console.log("creating compound furniture");
        // Handle compound furniture
        const compoundGrid = this.createEmptyGrid(20, 20); // temporary size

        // find the main component and process first
        const mainComponent = new Furniture(
          this.createSingleFurniture(
            config.components.find((component) => component.main_component)
          )
        );

        // the rest of the components need to be placed relative to the main component
        // make an array of the components that are not the main component
        const subComponents = config.components
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

        // remove all empty spaces from the grid
        const filteredGrid = compoundGrid
          .filter((row) => row.some((cell) => cell !== " ")) // Remove empty rows
          .map((row) => row.filter((cell) => cell !== " ")); // Remove empty cells within rows

        config.createdFurniture = filteredGrid;
        return new Furniture(config);
      } else {
        return this.createSingleFurniture(config);
      }
    });
  }

  static createEmptyGrid(length, width) {
    return Array.from({ length }, () =>
      Array.from({ length: width }, () => " ")
    );
  }

  static placeComponentOnGrid(targetGrid, componentGrid, position) {
    for (let y = 0; y < componentGrid.length; y++) {
      for (let x = 0; x < componentGrid[0].length; x++) {
        if (componentGrid[y][x] !== 0) {
          targetGrid[position.y + y][position.x + x] = componentGrid[y][x];
        }
      }
    }
  }

  static createSingleFurniture(furniture) {
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
            console.log(furniture);
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

  static printFurniture(furnitureItem) {
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

  static getFacingDirectionSymbol(facingDirection) {
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

  // Move other furniture creation methods from Room class here
  // createFurnitureGrid, combineComponents, etc.
}
