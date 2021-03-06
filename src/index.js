const BUBBLE_COUNT = 20;
const BUBBLE_SPEED = 4;

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

let canvasSize = 50;
while (canvasSize < windowWidth && canvasSize < windowHeight) {
  canvasSize += 50;
}

canvasSize -= 50;
canvasSize *= 0.9;

const BUBBLE_SIZE_LOWEST = Math.floor(canvasSize / 100);
const BUBBLE_SIZE_HIGHEST = Math.floor(canvasSize / 10);

const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

canvas.setAttribute("height", canvasSize + "px");
canvas.setAttribute("width", canvasSize + "px");

const canvasStartPosition = {
  x: Math.floor((windowWidth - canvasSize) / 2),
  y: Math.floor((windowHeight - canvasSize) / 2),
};

const bgColor = getComputedStyle(canvas).backgroundColor;

let mousePosition = {};

let score = 0;

function drawCircle(centre, radius, color) {
  context.beginPath();
  context.arc(centre.x, centre.y, radius, 0, 2 * Math.PI);
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

function getRandomBoundaryPoints() {
  let mag1 = Math.floor(Math.random() * canvasSize);
  let mag2 = Math.floor(Math.random() * canvasSize);
  let startSide = [0, canvasSize][Math.floor(Math.random() * 2)];
  let endSide = canvasSize - startSide;

  if (Math.floor(Math.random() * 2)) {
    return [
      { x: mag1, y: startSide },
      { x: mag2, y: endSide },
    ];
  } else {
    return [
      { x: startSide, y: mag1 },
      { x: endSide, y: mag2 },
    ];
  }
}

class Bubble {
  position = {};
  velocity = {};

  entryPosition = {};
  exitPosition = {};

  color;
  radius;

  constructor(color, radius, entryPosition, exitPosition) {
    this.color = color;
    this.radius = radius;

    this.position = { ...entryPosition };
    this.entryPosition = { ...entryPosition };

    this.exitPosition = { ...exitPosition };

    let theta = Math.atan2(
      exitPosition.y - entryPosition.y,
      exitPosition.x - entryPosition.x
    );
    this.velocity.x = BUBBLE_SPEED * Math.cos(theta);
    this.velocity.y = BUBBLE_SPEED * Math.sin(theta);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw() {
    drawCircle(this.position, this.radius, this.color);
  }

  clearCircle() {
    context.beginPath();
    context.arc(...this.position, this.radius + 1, 0, 2 * Math.PI);
    context.fillStyle = bgColor;
    context.strokeStyle = bgColor;
    context.fill();
    context.stroke();
  }

  outOfCanvas() {
    let extremeUp = this.position.y - this.radius;
    let extremeDown = this.position.y + this.radius;
    let extremeRight = this.position.x + this.radius;
    let extremeLeft = this.position.x - this.radius;

    return (
      extremeDown < 0 ||
      extremeUp > canvasSize ||
      extremeLeft > canvasSize ||
      extremeRight < 0
    );
  }

  overlapsWith(other) {
    return (
      Math.hypot(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      ) <
      this.radius + other.radius
    );
  }
}

let bubbles = [];

for (let i = 0; i < BUBBLE_COUNT; i++) {
  bubbles.push(
    new Bubble(
      "#" + Math.floor(Math.random() * 16777215).toString(16),
      Math.floor(Math.random() * BUBBLE_SIZE_HIGHEST - BUBBLE_SIZE_LOWEST) +
        BUBBLE_SIZE_LOWEST,
      ...getRandomBoundaryPoints()
    )
  );
  bubbles[i].draw();
}

let end = false;

window.main = function () {
  let stopMain = window.requestAnimationFrame(main);
  canvas.style.cursor = "none";

  clearCanvas();

  let playerCircle = {
    position: {
      x: mousePosition.x,
      y: mousePosition.y,
    },
    radius: 3 * (score + 5),
  };

  drawCircle(playerCircle.position, playerCircle.radius, "black");
  printScore();

  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].update();
    bubbles[i].draw();

    if (bubbles[i].overlapsWith(playerCircle)) {
      if (playerCircle.radius >= bubbles[i].radius) {
        score++;
        let rad = 5 * (score + 1);
        if (rad > 0.9 * canvasSize) end = true;
        bubbles[i] = new Bubble(
          "#" + Math.floor(Math.random() * 16777215).toString(16),
          Math.floor(Math.random() * BUBBLE_SIZE_HIGHEST - BUBBLE_SIZE_LOWEST) +
            BUBBLE_SIZE_LOWEST,
          ...getRandomBoundaryPoints()
        );
        continue;
      } else {
        end = true;
      }
    }
    if (bubbles[i].outOfCanvas()) {
      bubbles[i] = new Bubble(
        "#" + Math.floor(Math.random() * 16777215).toString(16),
        Math.floor(Math.random() * BUBBLE_SIZE_HIGHEST - BUBBLE_SIZE_LOWEST) +
          BUBBLE_SIZE_LOWEST,
        ...getRandomBoundaryPoints()
      );
    }
  }

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
  bubbles = [];
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push(
      new Bubble(
        "#" + Math.floor(Math.random() * 16777215).toString(16),
        Math.floor(Math.random() * BUBBLE_SIZE_HIGHEST - BUBBLE_SIZE_LOWEST) +
          BUBBLE_SIZE_LOWEST,
        ...getRandomBoundaryPoints()
      )
    );
    bubbles[i].draw();
  }
  score = 0;
  end = false;
  mouseX = 0;
  mouseY = 0;
  main();
}

function setMouseCoordinates(event) {
  mousePosition.x = event.clientX - canvasStartPosition.x;
  mousePosition.y = event.clientY - canvasStartPosition.y;
}

function printScore() {
  scoreBoard.textContent = "Score: " + score;
}

let scoreBoard = document.createElement("p");
scoreBoard.id = "scoreBoard";
scoreBoard.style.left = (canvasSize + windowWidth) / 2 - 170 + "px";
document.body.appendChild(scoreBoard);
main();
