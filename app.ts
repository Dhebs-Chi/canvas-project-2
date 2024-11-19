const canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const shapeSelector = document.getElementById('shape') as HTMLSelectElement;
const colorPicker = document.getElementById('color') as HTMLInputElement;
const strokeColorPicker = document.getElementById('strokeColor') as HTMLInputElement;
const strokeWidthInput = document.getElementById('strokeWidth') as HTMLInputElement;
const gridSizeInput = document.getElementById('gridSize') as HTMLInputElement;
const saveButton = document.getElementById('saveCanvas') as HTMLButtonElement;

let isDrawing = false;
let isDragging = false;
let dragPointIndex: number | null = null;
let startX: number, startY: number;
let vertices: { x: number, y: number }[] = [];
let selectedShape = 'rectangle';
let fillColor = '#ff0000';
let strokeColor = '#000000';
let strokeWidth = 2;
let gridSize = 20;

// Update selected shape
shapeSelector.addEventListener('change', () => {
  selectedShape = shapeSelector.value;
});

// Update fill color
colorPicker.addEventListener('input', () => {
  fillColor = colorPicker.value;
  redrawCanvas();
});

// Update stroke color
strokeColorPicker.addEventListener('input', () => {
  strokeColor = strokeColorPicker.value;
  redrawCanvas();
});

// Update stroke width
strokeWidthInput.addEventListener('input', () => {
  strokeWidth = parseInt(strokeWidthInput.value, 10);
  redrawCanvas();
});

// Update grid size
gridSizeInput.addEventListener('input', () => {
  gridSize = parseInt(gridSizeInput.value, 10);
  redrawCanvas();
});

// Align coordinates to the grid
function alignToGrid(value: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// Start drawing
canvas.addEventListener('mousedown', (e: MouseEvent) => {
  if (isDragging) return;

  const { offsetX, offsetY } = e;

  // Check if clicking on a drag point
  dragPointIndex = getDragPointIndex(offsetX, offsetY);
  if (dragPointIndex !== null) {
    isDragging = true;
    return;
  }

  // Otherwise, start a new shape
  isDrawing = true;
  startX = alignToGrid(offsetX);
  startY = alignToGrid(offsetY);
  vertices = [];
});

// Draw shape dynamically
canvas.addEventListener('mousemove', (e: MouseEvent) => {
  const { offsetX, offsetY } = e;

  if (isDragging && dragPointIndex !== null) {
    vertices[dragPointIndex] = {
      x: alignToGrid(offsetX),
      y: alignToGrid(offsetY),
    };
    redrawCanvas();
    return;
  }

  if (isDrawing) {
    const currentX = alignToGrid(offsetX);
    const currentY = alignToGrid(offsetY);

    if (selectedShape === 'rectangle') {
      vertices = [
        { x: startX, y: startY },
        { x: currentX, y: startY },
        { x: currentX, y: currentY },
        { x: startX, y: currentY },
      ];
    } else {
      const width = currentX - startX;
      const height = currentY - startY;
      vertices = getShapeVertices(selectedShape, startX, startY, width, height);
    }
    redrawCanvas();
  }
});

// Stop drawing or dragging
canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  isDragging = false;
  dragPointIndex = null;
});

// Draw grid
function drawGrid(): void {
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Redraw the canvas
function redrawCanvas(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  if (vertices.length > 0) {
    drawShape(vertices);
    drawDragPoints(vertices);
  }
}

// Get shape vertices based on type
function getShapeVertices(shape: string, x: number, y: number, width: number, height: number): { x: number, y: number }[] {
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
  const vertices: { x: number, y: number }[] = [];

  const sides = getSides(shape);
  for (let i = 0; i < sides; i++) {
    const angle = ((2 * Math.PI) / sides) * i - Math.PI / 2;
    const px = centerX + radius * Math.cos(angle);
    const py = centerY + radius * Math.sin(angle);
    vertices.push({
      x: alignToGrid(px),
      y: alignToGrid(py),
    });
  }

  return vertices;
}

// Get the number of sides for the selected shape
function getSides(shape: string): number {
  switch (shape) {
    case 'pentagon': return 5;
    case 'hexagon': return 6;
    case 'heptagon': return 7;
    case 'octagon': return 8;
    case 'nonagon': return 9;
    case 'decagon': return 10;
    default: return 4;
  }
}

// Draw the shape
function drawShape(vertices: { x: number, y: number }[]): void {
  ctx.beginPath();
  vertices.forEach((vertex, index) => {
    index === 0
      ? ctx.moveTo(vertex.x, vertex.y)
      : ctx.lineTo(vertex.x, vertex.y);
  });
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

// Draw drag points
function drawDragPoints(vertices: { x: number, y: number }[]): void {
  vertices.forEach((vertex) => {
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
  });
}

// Get the index of the drag point being clicked
function getDragPointIndex(x: number, y: number): number | null {
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distance = Math.sqrt(
      Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2)
    );

    if (distance <= 5) {
      return i;
    }
  }
  return null;
}

// Save the canvas as an image
saveButton.addEventListener('click', () => {
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = 'canvas_image.png';
  link.click();
});

// Initial redraw to display grid
redrawCanvas();
