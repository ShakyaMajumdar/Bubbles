let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let canvasSize = 50;
while (canvasSize < windowWidth && canvasSize < windowHeight) {
  canvasSize += 50;
}
canvasSize -= 50;
canvasSize *= 0.9;
let canvas = document.getElementById("myCanvas");
let context = canvas.getContext("2d");
canvas.setAttribute("height", canvasSize + "px");
canvas.setAttribute("width", canvasSize + "px");
let canvasStartX = Math.floor((windowWidth - canvasSize) / 2);
let canvasStartY = Math.floor((windowHeight - canvasSize) / 2);

let x0 = Math.floor(canvasSize / 2);
let y0 = Math.floor(canvasSize / 2);

let bgColor = getComputedStyle(canvas).backgroundColor;

let mouseX, mouseY;

let score = 0;

function drawCircle(centreX, centreY, radius, color) {
  context.beginPath();
  context.arc(centreX, centreY, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.stroke();
}

function clearCanvas() {
  context.beginPath();
  context.rect(0, 0, canvasSize, canvasSize);
  context.fillStyle = bgColor;
  context.fill();
}

class Circle {
  x;
  y;
  color;
  radius;
  slope;
  yInt;
  speedX;
  constructor() {
    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    this.radius = Math.floor(Math.random() * 40) + 5;
    this.slope = Math.floor(Math.random() * 10) - 5;
    this.yInt = Math.floor(Math.random() * canvasSize) - y0;
    do {
      this.speedX = Math.floor(
        (Math.random() * 6 - 3) / Math.pow(this.slope, 4)
      );
    } while (this.speedX == 0);
    do {
      let startPos = ["Up", "Down", "Left", "Right"];
      startPos = startPos[Math.floor(Math.random() * 4)];
      switch (startPos) {
        case "Up":
          this.y = Math.floor(canvasSize / 2);
          this.setX();
          break;
        case "Down":
          this.y = Math.floor(-canvasSize / 2);
          this.setX();
          break;
        case "Left":
          this.x = Math.floor(-canvasSize / 2);
          this.setY();
          this.speedX = Math.abs(this.speedX);
          break;
        case "Right":
          this.x = Math.floor(canvasSize / 2);
          this.setY();
          this.speedX = -Math.abs(this.speedX);
          break;
      }
    } while (this.outOfCanvas());
  }
  draw() {
    drawCircle(x0 + this.x, y0 - this.y, this.radius, this.color);
  }
  clearCircle() {
    context.beginPath();
    context.arc(x0 + this.x, y0 - this.y, this.radius + 1, 0, 2 * Math.PI);
    context.fillStyle = bgColor;
    context.strokeStyle = bgColor;
    context.fill();
    context.stroke();
  }
  setByX(param) {
    this.x = param;
    this.setY();
  }
  setY() {
    this.y = this.slope * this.x + this.yInt;
  }
  setByY(param) {
    this.y = param;
    this.setX();
  }
  setX() {
    this.x = Math.floor((this.y - this.yInt) / this.slope);
  }
  drawLine() {
    for (
      let i = x0 - Math.floor(canvasSize / 2);
      i < x0 + Math.floor(canvasSize / 2);
      i++
    ) {
      let j = y0 - (this.slope * (i - x0) + this.yInt);
      context.beginPath();
      context.moveTo(i, j);
      context.lineTo(i + 1, j + 1);
      context.stroke();
    }
  }
  liesInside(x1, y1) {
    let f =
      Math.pow(x1 - this.x, 2) +
      Math.pow(y1 - this.y, 2) -
      Math.pow(this.radius, 2);
    if (f <= 0) return true;
    return false;
  }
  outOfCanvas() {
    let extremeUp = this.y + this.radius;
    let extremeDown = this.y - this.radius;
    let extremeRight = this.x + this.radius;
    let extremeLeft = this.x - this.radius;
    if (extremeDown > canvasSize / 2 || extremeUp < -canvasSize / 2)
      return true;
    if (extremeLeft > canvasSize / 2 || extremeRight < -canvasSize / 2)
      return true;
    return false;
  }
}
let circles = new Array(0);
for (let i = 0; i < 20; i++) {
  circles[i] = new Circle();
  circles[i].draw();
}

let end = false;
let i = 0;

function circlesOverlap(circle1, circle2) {
  let dist = Math.sqrt(
    Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)
  );
  if (dist < circle1.radius + circle2.radius) return true;
  return false;
}

window.main = function () {
  let stopMain = window.requestAnimationFrame(main);
  canvas.style.cursor = "none";

  clearCanvas();
  let userCircle = {
    x: mouseX,
    y: mouseY,
    radius: 3 * (score + 5),
  };
  drawCircle(x0 + userCircle.x, y0 - userCircle.y, userCircle.radius, "black");
  for (let i = 0; i < circles.length; i++) {
    circles[i].x += circles[i].speedX;
    circles[i].setY();
    circles[i].draw();
    if (circlesOverlap(userCircle, circles[i])) {
      if (userCircle.radius >= circles[i].radius) {
        score++;
        let rad = 5 * (score + 1);
        if (rad > 0.9 * canvasSize) end = true;
        circles[i] = new Circle();
        continue;
      } else {
        end = true;
      }
    }
    if (circles[i].outOfCanvas()) {
      circles[i] = new Circle();
    }
  }

  i++;
  if (end) {
    cancelAnimationFrame(stopMain);
    canvas.style.cursor = "default";
    let p = document.createElement("p");
    p.id = "playButton";
    p.textContent = "Play Again";
    p.onclick = playAgain;
    document.body.appendChild(p);
  }
};

function playAgain() {
  let p = document.getElementById("playButton");
  p.parentNode.removeChild(p);
  circles = new Array(0);
  for (let i = 0; i < 20; i++) {
    circles[i] = new Circle();
    circles[i].draw();
  }
  score = 0;
  end = false;
  i = 0;
  mouseX = 0;
  mouseY = 0;
  main();
}

function setMouseCoordinates(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  mouseX -= canvasStartX;
  mouseY -= canvasStartY;
  mouseX = mouseX - x0;
  mouseY = y0 - mouseY;
  if (i < 5) console.log(mouseX, mouseY);
}

function printScore() {
  scoreBoard.textContent = "Score" + score;
}
let scoreBoard = document.createElement("p");
scoreBoard.id = "scoreBoard";

document.body.appendChild(scoreBoard);
main();