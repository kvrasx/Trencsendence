/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ping-pong-game.jsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: yamajid <yamajid@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/11/19 12:41:28 by momihamm          #+#    #+#             */
/*   Updated: 2025/01/08 20:34:28 by yamajid          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import React, { useState, useEffect } from 'react';
import Sketch from 'react-p5';
import img1 from "@/assets/auth.png"
import img2 from "@/assets/auth.png"

const Canvas = ({ playerNumber, playerName, gameG, canvasW, canvasH, ballX, ballY, leftPaddle, rightPaddle, sendMessage }) => {
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
      sendMessage(JSON.stringify({
        'type': 'paddleMove',
        'direction': 'up',
        'playerNumber': playerNumber,
        'playerName': playerName,
        'gameGroup': gameG
      }))
    }
    if (p5.keyIsDown(83) || p5.keyIsDown(p5.DOWN_ARROW)) {
      sendMessage(JSON.stringify({
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
    canvas.style('background', '#000000');

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
    p5.text(scoreR, canvasW * 0.25, canvasH * 0.2); // Left score at 25% width
    p5.text(scoreL, canvasW * 0.75, canvasH * 0.2);
  };


  return <Sketch setup={setup} draw={draw} />;

};


let canvasH = 0
let canvasW = 0
let ballX = 0
let ballY = 0
let leftPaddle = ''
let rightPaddle = ''
let ball = ''
let scoreL = 0
let scoreR = 0

function PingPongGame({ sendMessage, lastMessage, readyState }) {
  const [playerNumber, setPlayerNmber] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameG, setGame] = useState('')

  useEffect(() => {
    if (readyState === WebSocket.OPEN) {
      if (lastMessage != null) {
        const data = JSON.parse(lastMessage.data);

        if (data['type'] === 'game_started') {
          setPlayerNmber(data['information']['player_number'])
          setPlayerName(data['information']['player_name'])
          canvasH = data.paddleLeft.canvasHeight
          canvasW = data.paddleRight.canvasWidth
          if (data.information.player_number === '1') {
            rightPaddle = data.paddleRight;
            leftPaddle = data.paddleLeft;
            ball = data.ball;
          }
          else {
            leftPaddle = data.paddleLeft;
            rightPaddle = data.paddleRight;
            ball = data.ball;

          }
          setGame(data.game_group)
        }
        if (data['type'] === "paddleMoved") {
          if (data['playerNumber'] === '1')
            rightPaddle = data.updateY;
          else
            leftPaddle = data.updateY;
        }
        if (data['type'] === "ballUpdated") {
          ballX = data.ball.x;
          ballY = data.ball.y;
          scoreL = data.ball.scoreLeft;
          scoreR = data.ball.scoreRight;
        }
      }

    }
  }, [lastMessage])




  return (
    <Canvas playerName={playerName} playerNumber={playerNumber} gameG={gameG} canvasH={400} canvasW={600} ballX={ballX} ballY={ballY} leftPaddle={leftPaddle} rightPaddle={rightPaddle} sendMessage={sendMessage} />
  );
}

export default PingPongGame;
