# Zigzag Ball Game

## Overview

This is a 3D game where the player controls a ball on a zigzag path. The objective is to survive as long as possible by switching paths to stay on the track.

## Design and Features

*   **3D Graphics:** The game will be rendered in 3D using Three.js.
*   **Player Control:** The player will control a ball.
*   **Zigzag Path:** The ball will travel on a zigzag path composed of two alternating tracks.
*   **Path Switching:** Pressing the spacebar will switch the ball between the two tracks.
*   **Scrolling Screen:** The camera will continuously move to the right, creating a side-scrolling effect.
*   **Dynamic Speed:** The camera speed will increase if the ball gets too close to the right edge of the screen.
*   **Game Over:** The game will end if the ball falls off the track or goes off the left side of the screen.
*   **Scoring:** The score will increase over time.
*   **Visual Style:**
    *   **Ball:** A sphere with a vibrant color.
    *   **Paths:** Two differently colored tracks (e.g., red and green) to distinguish them.
    *   **Background:** A simple background to keep the focus on the gameplay.
    *   **UI:** A clean and simple UI to display the score.

## Current Plan

1.  **Set up the HTML structure:** Create an `index.html` file with a canvas for the game and a score display.
2.  **Add basic styles:** Create a `style.css` file to style the game container and UI elements.
3.  **Implement the game logic in `main.js`:**
    *   Set up the Three.js scene, camera, and renderer.
    *   Create the ball and the zigzag path.
    *   Implement the ball movement, path switching, and camera movement.
    *   Add collision detection.
    *   Implement the game over condition and scoring system.
4.  **Refine and test:** Polish the gameplay and fix any bugs.
