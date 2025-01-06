describe("Room", () => {
  test("should correctly initialize with valid config", () => {
    const config = {
      room: { width: 10, length: 10, wall_thickness: 1 },
    };
    const room = new Room(config);
    expect(room.width).toBe(12);
    expect(room.length).toBe(12);
  });

  test("should throw error with invalid config", () => {
    const config = { room: { width: -1, length: 10 } };
    expect(() => new Room(config)).toThrow("Invalid room width");
  });
});
