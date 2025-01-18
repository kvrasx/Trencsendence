
import Sketch from 'react-p5';

class Paddle {
    constructor(x, y, width, height, speed, bord, score) {
      this.x = x; // Paddle's x position
      this.y = y; // Paddle's y position
      this.width = width; // Paddle's width
      this.height = height; // Paddle's height
      this.speed = speed; // Paddle's movement speed
      this.bord = bord;
      this.score = score;
    }
  
    // Method to draw the paddle
    show(p5) {
      p5.rect(this.x, this.y, this.width, this.height, this.bord);
    }
  }
  
class Ball {
    constructor(x, y, radius, speedX, speedY, angle, canvasW, constSpeed) {
      this.x = x; // Ball's x position
      this.y = y; // Ball's y position
      this.radius = radius; // Ball's radius
      this.speedX = speedX; // Horizontal speed
      this.speedY = speedY; // Vertical speed
      this.angle = angle;
      this.canvasW = canvasW;
      this.constSpeed = constSpeed;
      // this.genSpeed = genSpeed;
    }
  
    // Method to draw the ball
    show(p5) {
      p5.ellipse(this.x, this.y, this.radius * 2);
    }
  
    move(p5, leftPaddle, rightPaddle) {
      this.x += this.speedX;
      this.y += this.speedY;
    
      // Bounce off top and bottom edges
      if (this.y - this.radius <= 0 || this.y + this.radius >= p5.height) {
        this.speedY *= -1;
      }
    
      // Bounce off paddles
      if (
        this.x - this.radius <= leftPaddle.x + leftPaddle.width && // Left paddle
        this.y >= leftPaddle.y &&
        this.y <= leftPaddle.y + leftPaddle.height
      ) {
        let pointOfColl, dirction;
        pointOfColl = this.y - (leftPaddle.y + (leftPaddle.height / 2));
        pointOfColl /= (leftPaddle.height / 2);
        this.angle = pointOfColl * (Math.PI / 4);
        if (this.x > (this.canvasW /2))
          dirction = -1;
        else
          dirction = 1;
        this.speedX = dirction * this.constSpeed * Math.cos(this.angle);
        this.speedY =  Math.sin(this.angle) * this.constSpeed;
      } else if (
        this.x + this.radius >= rightPaddle.x && // Right paddle
        this.y >= rightPaddle.y &&
        this.y <= rightPaddle.y + rightPaddle.height
      ) {
        let pointOfColl, dirction;
        pointOfColl = this.y - (rightPaddle.y + (rightPaddle.height / 2));
        pointOfColl /= (rightPaddle.height / 2);
        this.angle = pointOfColl * (Math.PI / 4);
        if (this.x > (this.canvasW /2))
          dirction = -1;
        else
          dirction = 1;
          this.speedX = dirction * this.constSpeed * Math.cos(this.angle);
          this.speedY =  Math.sin(this.angle) * this.constSpeed;
      }
    
      // Reset ball if it goes out of bounds
      if (this.x - this.radius <= 0) {
        rightPaddle.score++;// rightScore++; // Right player scores
        this.reset(p5);
      } else if (this.x + this.radius >= p5.width) {
        leftPaddle.score++;// leftScore++; // Left player scores
        this.reset(p5);
      }
    }
    
    reset(p5) {
      this.x = p5.width / 2;
      this.y = p5.height / 2;
      this.speedX *= -1; // Start moving towards the scoring player
    }
  
  }
  
  
  
  
  const Canvas = ({setWinner}) => {
    var bg = 0;
    var padle = "#F8F8FF";
    var bal = "#F8F8FF";
   
    let choosenTheme = localStorage.getItem('theme');

    switch (choosenTheme) {
      case "theme1":
        bg = "#2F4F4F";
        padle = "#7FFF00";
        bal ="#7FFF00";
        break;
      case "theme2":
        bg = "#FFA07A";
        padle = "#FFFF00"
        bal = "#FFFF00"
        break;
    }

  let leftPaddle, rightPaddle, ball;
  let paddleWidth = 0;//= p5.width * 0.02; // 2% of canvas width
  let paddleHeight = 0;// = p5.height * 0.2; // 20% of canvas height
  let ballRadius = 0;// p5.width * 0.02; // 2% of canvas width
  let initAngle = 0;
  
  const setup = (p5, canvasParentRef) => {
    const canvasWidth = 1300; // 80% of window width
    const canvasHeight = 800; // 80% of window height
    const canvas = p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
    let initScore = 0;
    let ballSpeed = 17 ;
    paddleWidth = 20; // 2% of canvas width
    paddleHeight = 180; // 20% of canvas height
    ballRadius = 20; // 2% of canvas width
    // Position the canvas
    canvas.style('position', ); // Use absolute positioning
    canvas.style('top', '2%');          // Move 20% down
    canvas.style('left', '10%');         // Move 10% to the right
    canvas.style('border-radius', '15px');
    canvas.style('border', '10px solid white');
    canvas.style('padding', '10px');
    leftPaddle = new Paddle(p5.width * 0.01 , p5.height * 0.4, paddleWidth, paddleHeight, 12, 10, initScore);
    rightPaddle = new Paddle(p5.width * 0.99 - paddleWidth, p5.height * 0.4, paddleWidth, paddleHeight, 12, 10, initScore);
    ball = new Ball(canvasWidth * 0.5, canvasHeight * 0.5, ballRadius, ballSpeed, 0 , initAngle, canvasWidth, ballSpeed);
    p5.frameRate(60);
  };

  const handlePaddleMovement = (p5) => {
    if (p5.keyIsDown(87)) { // 'W' key
      leftPaddle.y = Math.max(20, leftPaddle.y - leftPaddle.speed); // Prevent moving out of bounds
    }
    if (p5.keyIsDown(83)) { // 'S' key
      leftPaddle.y = Math.min(p5.height - leftPaddle.height - 20, leftPaddle.y + leftPaddle.speed);
    }
  
    // Move right paddle with UP and DOWN arrow keys
    if (p5.keyIsDown(p5.UP_ARROW)) {
      rightPaddle.y = Math.max(20, rightPaddle.y - rightPaddle.speed); // Prevent moving out of bounds
    }
    if (p5.keyIsDown(p5.DOWN_ARROW)) {
      rightPaddle.y = Math.min(p5.height - rightPaddle.height - 20, rightPaddle.y + rightPaddle.speed);
    }
  };
  
  const draw = (p5) => {
    const centerX = p5.width / 2; // Center of the canvas
    const dashHeight = 0;        // Height of each dash
    const gapHeight = 2;         // Gap between dashes
    
    if (rightPaddle.score == 5 || leftPaddle.score == 5){
      setWinner(rightPaddle.score == 5 ? "right" : "left")
      p5.noLoop();
    }
    p5.background(bg);
    p5.stroke(255);               // Set line color to white
    p5.strokeWeight(2);           // Set line thickness
    // Loop to draw dashes
    for (let y = 0; y < p5.height; y += dashHeight + gapHeight) {
      p5.line(centerX, y, centerX, y + dashHeight); // Draw each dash
    }
    // Set up text properties
    p5.fill(255); // White color for the text
    p5.noStroke(); // No border around the text
    p5.textSize(p5.width * 0.1); // Text size relative to canvas width
    p5.textAlign(p5.CENTER, p5.CENTER); // Center align text
    handlePaddleMovement(p5);
    p5.fill(bal)
    ball.move(p5, leftPaddle, rightPaddle);
    p5.text(leftPaddle.score, p5.width * 0.25, p5.height * 0.2); // Left score at 25% width
    p5.text(rightPaddle.score, p5.width * 0.75, p5.height * 0.2); // Right score at 75% width
    ball.show(p5);
    p5.fill(padle)
    leftPaddle.show(p5);
    rightPaddle.show(p5);
  };

  return <Sketch setup={setup}   draw={draw} />;
};

export default Canvas;