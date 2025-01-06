export class Furniture {
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

  getDisplaySymbol() {
    const directionSymbols = {
      north: "↑",
      south: "↓",
      east: "→",
      west: "←",
    };

    return {
      symbol: directionSymbols[this.facing_direction],
      color: this.colour,
      bgColor: `bg${
        this.colour.charAt(0).toUpperCase() + this.colour.slice(1)
      }`,
    };
  }
}
