var canvas = document.getElementById('drawingCanvas');
var ctx = canvas.getContext('2d');
var shapeSelector = document.getElementById('shape');
var colorPicker = document.getElementById('color');
var strokeColorPicker = document.getElementById('strokeColor');
var strokeWidthInput = document.getElementById('strokeWidth');
var gridSizeInput = document.getElementById('gridSize');
var saveButton = document.getElementById('saveCanvas');
var isDrawing = false;
var isDragging = false;
var dragPointIndex = null;
var startX, startY;
var vertices = [];
var selectedShape = 'rectangle';
var fillColor = '#ff0000';
var strokeColor = '#000000';
var strokeWidth = 2;
var gridSize = 20;
// Update selected shape
shapeSelector.addEventListener('change', function () {
    selectedShape = shapeSelector.value;
});
// Update fill color
colorPicker.addEventListener('input', function () {
    fillColor = colorPicker.value;
    redrawCanvas();
});
// Update stroke color
strokeColorPicker.addEventListener('input', function () {
    strokeColor = strokeColorPicker.value;
    redrawCanvas();
});
// Update stroke width
strokeWidthInput.addEventListener('input', function () {
    strokeWidth = parseInt(strokeWidthInput.value, 10);
    redrawCanvas();
});
// Update grid size
gridSizeInput.addEventListener('input', function () {
    gridSize = parseInt(gridSizeInput.value, 10);
    redrawCanvas();
});
// Align coordinates to the grid
function alignToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
}
// Start drawing
canvas.addEventListener('mousedown', function (e) {
    if (isDragging)
        return;
    var offsetX = e.offsetX, offsetY = e.offsetY;
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
canvas.addEventListener('mousemove', function (e) {
    var offsetX = e.offsetX, offsetY = e.offsetY;
    if (isDragging && dragPointIndex !== null) {
        vertices[dragPointIndex] = {
            x: alignToGrid(offsetX),
            y: alignToGrid(offsetY),
        };
        redrawCanvas();
        return;
    }
    if (isDrawing) {
        var currentX = alignToGrid(offsetX);
        var currentY = alignToGrid(offsetY);
        if (selectedShape === 'rectangle') {
            vertices = [
                { x: startX, y: startY },
                { x: currentX, y: startY },
                { x: currentX, y: currentY },
                { x: startX, y: currentY },
            ];
        }
        else {
            var width = currentX - startX;
            var height = currentY - startY;
            vertices = getShapeVertices(selectedShape, startX, startY, width, height);
        }
        redrawCanvas();
    }
});
// Stop drawing or dragging
canvas.addEventListener('mouseup', function () {
    isDrawing = false;
    isDragging = false;
    dragPointIndex = null;
});
// Draw grid
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (var x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (var y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
// Redraw the canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    if (vertices.length > 0) {
        drawShape(vertices);
        drawDragPoints(vertices);
    }
}
// Get shape vertices based on type
function getShapeVertices(shape, x, y, width, height) {
    var centerX = x + width / 2;
    var centerY = y + height / 2;
    var radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
    var vertices = [];
    var sides = getSides(shape);
    for (var i = 0; i < sides; i++) {
        var angle = ((2 * Math.PI) / sides) * i - Math.PI / 2;
        var px = centerX + radius * Math.cos(angle);
        var py = centerY + radius * Math.sin(angle);
        vertices.push({
            x: alignToGrid(px),
            y: alignToGrid(py),
        });
    }
    return vertices;
}
// Get the number of sides for the selected shape
function getSides(shape) {
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
function drawShape(vertices) {
    ctx.beginPath();
    vertices.forEach(function (vertex, index) {
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
function drawDragPoints(vertices) {
    vertices.forEach(function (vertex) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
}
// Get the index of the drag point being clicked
function getDragPointIndex(x, y) {
    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        var distance = Math.sqrt(Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2));
        if (distance <= 5) {
            return i;
        }
    }
    return null;
}
// Save the canvas as an image
saveButton.addEventListener('click', function () {
    var image = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.href = image;
    link.download = 'canvas_image.png';
    link.click();
});
// Initial redraw to display grid
redrawCanvas();
