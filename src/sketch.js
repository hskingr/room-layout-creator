// ... (p5.js visualization code -
//     setup, draw, color definitions, buffer zone visualization, etc.)

// Assuming you have the 'layouts' array available from layout_generator.js
// You might need to adjust how you pass the data between the two scripts

// Visualize the first layout
visualizeLayout(layouts[0]);

// ... (layout data and setup remain the same)

function draw() {
  background(220);

  // Draw walls first
  fill(165, 42, 42); // Example color for walls (brown)
  // ... (draw walls as before)

  // Draw layout content with buffer zones
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      const cell = layout[y][x];

      let fillColor, bufferColor;
      switch (cell) {
        case 0:
          fillColor = color(255);
          break; // Empty: White
        case "W":
          fillColor = color(135, 206, 250);
          bufferColor = color(176, 224, 230); // Lighter Sky Blue
          break;
        case "D":
          fillColor = color(160, 82, 45);
          bufferColor = color(205, 133, 63); // Lighter Sienna
          break;
        case "S":
          fillColor = color(128, 0, 0);
          bufferColor = color(178, 34, 34); // Lighter Maroon
          break;
        case "C":
          fillColor = color(210, 105, 30);
          bufferColor = color(230, 145, 56); // Lighter Chocolate
          break;
        case "B":
          fillColor = color(139, 69, 19);
          bufferColor = color(165, 105, 41); // Lighter Saddle Brown
          break;
        case "T":
          fillColor = color(0, 0, 0);
          bufferColor = color(64, 64, 64); // Lighter Black (Gray)
          break;
        case "A":
          fillColor = color(255, 69, 0);
          bufferColor = color(255, 140, 0); // Lighter Orange Red
          break;
        default:
          fillColor = color(128);
          break; // Gray for unknown
      }

      // Draw the main cell
      fill(fillColor);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);

      // Draw buffer zone if applicable
      if (bufferColor) {
        fill(bufferColor);
        // Adjust buffer size based on your configuration and logic
        const bufferSize = 0.2 * cellSize; // Example: 20% of cell size
        rect(
          x * cellSize + bufferSize,
          y * cellSize + bufferSize,
          cellSize - 2 * bufferSize,
          cellSize - 2 * bufferSize
        );
      }

      // ... (Add labels if needed, similar to before)
    }
  }

  // Draw windows and doors on the walls (with buffer zones if applicable)
  // ... (implementation based on your configuration)
}
