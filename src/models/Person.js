export class Person {
  constructor(config) {
    this.name = config.name;
    this.position = config.position;
    this.facing_direction = config.facing_direction;
    this.symbol = config.symbol;
  }

  moveAround(room) {
    room.grid[this.position.y][this.position.x] = " ";

    const emptySpaces = room.findEmptySpacesAround(
      this.position.x,
      this.position.y
    );

    const randomIndex = Math.floor(Math.random() * emptySpaces.length);
    const newPosition = emptySpaces[randomIndex];
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;

    room.grid[this.position.y][this.position.x] = this.symbol;
  }
}
