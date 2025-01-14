import React, { useState, useEffect } from 'react';
import Sketch from 'react-p5';

const Canvas = ({ playerNumber, playerName, gameG, canvasW, canvasH, ballX, ballY, leftPaddle, rightPaddle, websocket, scoreR, scoreL }) => {
  const [bg, setBg] = useState("#000000");
  useEffect(() => {
    let choosenTheme = localStorage.getItem('theme');

    switch (choosenTheme) {
      case "theme1":
        setBg("#ff7f50");
        break;
      case "theme2":
        setBg("#006400");
        break;
    }
  }, [])

  const handlePaddleMovement = (p5) => {
    if (p5.keyIsDown(87) || p5.keyIsDown(p5.UP_ARROW)) {
      websocket.send(JSON.stringify({
        'type': 'paddleMove',
        'direction': 'up',
        'playerNumber': playerNumber,
        'playerName': playerName,
        'gameGroup': gameG
      }))
    }
    if (p5.keyIsDown(83) || p5.keyIsDown(p5.DOWN_ARROW)) {
      websocket.send(JSON.stringify({
        'type': 'paddleMove',
        'direction': 'down',
        'playerNumber': playerNumber,
        'playerName': playerName,
        'gameGroup': gameG
      }))
    }
  }

  const show = (p5, x, y, width, height, bord) => {
    p5.rect(x, y, width, height, bord);
  }

  const setup = (p5, canvasParentRef) => {
    const canvasWidth = canvasW;
    const canvasHeight = canvasH;
    const canvas = p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);


    canvas.style('top', '2%');
    canvas.style('left', '10%');
    canvas.style('border-radius', '15px');
    canvas.style('border', '10px solid white');

    p5.frameRate(60);
  };



  const draw = (p5) => {
    const centerX = canvasW / 2; // Center of the canvas
    const heightT = canvasH;        // Gap between dashes

    p5.background(bg);
    p5.stroke(255);           // Set line color to white
    p5.strokeWeight(2);           // Set line thickness
    // Loop to draw dashes
    p5.line(centerX, 0, centerX, heightT); // Draw each dash
    // Set up text properties
    p5.fill(255); // White color for the text
    p5.noStroke(); // No border around the text
    p5.textSize(canvasW * 0.1); // Text size relative to canvas width
    p5.textAlign(p5.CENTER, p5.CENTER); // Center align text
    handlePaddleMovement(p5);
    show(p5, leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, 10);
    show(p5, rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, 10);
    p5.fill(255);
    p5.ellipse(ballX, ballY, 20);
    p5.fill(255);

    p5.text(scoreR, canvasW * 0.25, canvasH * 0.2); // Left score at 25% width
    p5.text(scoreL, canvasW * 0.75, canvasH * 0.2);
  };


  return <Sketch setup={setup} draw={draw} />;

};


let canvasH = 0
let canvasW = 0

function PingPongGame({ websocket, setWinner, gameStartData }) {


  const [playerNumber, setPlayerNmber] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameG, setGame] = useState('')
  const [gameData, setGameData] = useState({
    ballX: 0,
    ballY: 0,
    leftPaddle: '',
    rightPaddle: '',
    ball: '',
    scoreL: 0,
    scoreR: 0
  })


  useEffect(() => {
    // data received when game started
    setPlayerNmber(gameStartData['information']['player_number'])
    setPlayerName(gameStartData['information']['player_name'])
    canvasH = gameStartData.paddleLeft.canvasHeight
    canvasW = gameStartData.paddleRight.canvasWidth
    if (gameStartData.information.player_number === '1') {

      setGameData((prev) => ({
        ...prev,
        rightPaddle: gameStartData.paddleRight,
        leftPaddle: gameStartData.paddleLeft,
        ball: gameStartData.ball,
      }))

    }
    else {
      setGameData((prev) => ({
        ...prev,
        leftPaddle: gameStartData.paddleLeft,
        rightPaddle: gameStartData.paddleRight,
        ball: gameStartData.ball,
      }))


    }
    setGame(gameStartData.game_group)


    // add event listener
    websocket.onmessage = (lastMessage) => {
      const data = JSON.parse(lastMessage.data);

      if (data['type'] === "paddleMoved") {
        if (data['playerNumber'] === '1')
          // rightPaddle = data.updateY;
          setGameData((prev) => ({
            ...prev,
            rightPaddle: data.updateY
          }))
        else
          setGameData((prev) => ({
            ...prev,
            leftPaddle: data.updateY
          }))
        // leftPaddle = data.updateY;
      }
      else if (data['type'] === "ballUpdated") {
        setGameData((prev) => ({
          ...prev,
          ballX: data.ball.x,
          ballY: data.ball.y,
          scoreL: data.ball.scoreLeft,
          scoreR: data.ball.scoreRight,
        }));

        // ballX = data.ball.x;
        // ballY = data.ball.y;
        // scoreL = data.ball.scoreLeft;
        // scoreR = data.ball.scoreRight;
      }
      else if (data.type === 'game_finished') {
        console.log(data.type);
        console.log(data.winner);
        
        setWinner(data.winner.player_username);
      }
      else if (data.type === "freee_match") {
        setWinner(data.winner.player_username);
      }
    }

  }, [])




  return (
    <Canvas playerName={playerName} playerNumber={playerNumber} gameG={gameG} canvasH={400} canvasW={600} ballX={gameData.ballX} ballY={gameData.ballY} leftPaddle={gameData.leftPaddle} rightPaddle={gameData.rightPaddle} scoreL={gameData.scoreL} scoreR={gameData.scoreR} websocket={websocket} />
  );
}

export default PingPongGame;
