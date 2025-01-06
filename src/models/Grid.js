import chalk from "chalk";

export class Grid {
  constructor(width, length, defaultValue = " ") {
    this.width = width;
    this.length = length;
    this.cells = Array.from({ length }, () =>
      Array.from({ length: width }, () => defaultValue)
    );
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.length;
  }

  set(x, y, value) {
    if (!this.isWithinBounds(x, y)) throw new Error("Position out of bounds");
    this.cells[y][x] = value;
  }

  get(x, y) {
    if (!this.isWithinBounds(x, y)) throw new Error("Position out of bounds");
    return this.cells[y][x];
  }

  clone() {
    const newGrid = new Grid(this.width, this.length);
    for (let y = 0; y < this.length; y++) {
      for (let x = 0; x < this.width; x++) {
        newGrid.set(x, y, this.get(x, y));
      }
    }
    return newGrid;
  }

  isEmpty(x, y) {
    return this.get(x, y) === " ";
  }

  print(colorGrid) {
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

    const colourArray = [
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "white",
    ];

    let colorIndex = 0;

    for (let y = 0; y < this.length; y++) {
      let row = "";
      for (let x = 0; x < this.width; x++) {
        const cell = this.get(x, y);
        const color =
          colourArray[
            (colourArray.findIndex((c) => c === colorGrid.get(x, y)) %
              colourArray.length) +
              1
          ];
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
