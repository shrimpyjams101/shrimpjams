let x = 0;
let y = 0;
let size = 100;
let shrimp;

function preload() {
    shrimp = loadImage("assets/shrimp-mouse.jpg")

}

function setup() {
  createCanvas(windowWidth, windowHeight);
    imageMode(CENTER);

  angleMode(DEGREES);
}

function draw() {
  background(255);

  image(shrimp, x, y, 100, 100)

  let v1 = createVector(x, y, 0)
  let v2 = createVector(mouseX, mouseY, 0)
  v1.lerp(v2, 0.01)
  
  x = v1.x;
  y = v1.y;

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}