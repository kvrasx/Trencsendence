# Multiplayer Gaming and Social Platform

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Usage](#usage)
7. [License](#license)

## Overview

The Multiplayer Gaming and Social Platform is a comprehensive web platform that combines gaming and social interaction features. Developed by a team of five, the platform offers a rich and engaging experience with real-time multiplayer games, secure authentication, and live social interactions. Key features include tournaments, live chat, user management, and a fully integrated dashboard to track user and game statistics.

## Architecture

This project implements a modern web application stack with the following architecture:

- **Frontend**: React-based user interface, designed for seamless interaction across devices with cross-browser support.
- **Backend**: Django and Django REST for scalable server-side development, providing robust API endpoints and handling user authentication, game logic, and database management.
- **Database**: PostgreSQL for reliable data storage, handling user accounts, game history, and tournament scores.
- **Authentication**: Secure JWT authentication, with Two-Factor Authentication (2FA) for additional security.
- **Games**:
  - Real-time multiplayer ping-pong game with matchmaking.
  - Tic Tac Toe game with user history tracking.
- **Live Chat**: WebSocket-based real-time chat system, allowing users to communicate during gameplay.

## Features

1. **User Management**:
   - Registration, login, and profile management.
   - Secure remote authentication using JWT.
   - Two-Factor Authentication (2FA) for enhanced security.
   
2. **Games**:
   - **Real-time Ping-Pong Game**: Multiplayer game with matchmaking and competitive gameplay.
   - **Tic Tac Toe Game**: Features matchmaking, user history tracking, and game statistics.

3. **Live Chat**:
   - WebSocket-powered real-time chat functionality.
   - Group and private messaging.

4. **Tournament System**:
   - Organize and participate in tournaments.
   - Track scores using blockchain technology for added security and transparency.

5. **Dashboard**:
   - User and game statistics, including scores, rankings, and achievements.

6. **Device Compatibility**:
   - Responsive and mobile-friendly design, optimized for various screen sizes and devices.

7. **Cross-browser Support**:
   - Ensures a smooth experience across all modern browsers.

## Prerequisites

- Docker
- Git
- Make (optional, for using Makefile commands)

## Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:kvras/Trencsendence.git
   cd Trencsendence
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   nano .env  # Edit variables as needed
   ```

6. Use Docker to run the project in containers:
   ```bash
   make
   ```
   or
   ```bash
   docker-compose up
   ```

## Usage

Once the application is running, you can access the website from ``` https://exemple.com:4433

