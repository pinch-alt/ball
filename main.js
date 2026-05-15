const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let width, height;
let ball = { x: 0, y: 0, radius: 12, color: '#2ecc71' };
let path = [];
let targetDirection = 1; // 1 for down-right, -1 for up-right
let gameStarted = false;
let score = 0;
let speed = 4;
let gravity = 0.8;
let offsetX = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (!gameStarted) {
        initGame();
    }
}

function initGame() {
    score = 0;
    speed = 4;
    offsetX = 0;
    ball.x = 100;
    ball.y = height / 2;
    targetDirection = 1;
    path = [];
    
    // Initial path point
    let lastX = 0;
    let lastY = height / 2;
    path.push({ x: lastX, y: lastY });

    // Generate initial segments
    for (let i = 0; i < 20; i++) {
        addRandomSegment();
    }
    
    // Position ball on path
    const initialY = getPathY(ball.x);
    if (initialY !== null) {
        ball.y = initialY - ball.radius;
    }
    
    updateScore();
    draw();
}

function addRandomSegment() {
    const lastPoint = path[path.length - 1];
    // Random length for zigzag segments
    const segmentLength = Math.random() * 200 + 100; 
    // Alternate direction of the path segments
    const dir = path.length % 2 === 0 ? 1 : -1;
    
    const newX = lastPoint.x + segmentLength;
    const newY = lastPoint.y + (segmentLength * dir * 0.7); // 0.7 slope
    
    // Keep path within bounds
    if (newY < 150 || newY > height - 150) {
        path.push({ x: newX, y: lastPoint.y - (segmentLength * dir * 0.7) });
    } else {
        path.push({ x: newX, y: newY });
    }
}

function getPathY(x) {
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        if (x >= p1.x && x <= p2.x) {
            const t = (x - p1.x) / (p2.x - p1.x);
            return p1.y + t * (p2.y - p1.y);
        }
    }
    return null;
}

function update() {
    if (!gameStarted) return;

    // Ball moves right at constant speed
    ball.x += speed;

    // Vertical movement is determined by targetDirection (toggled by Space)
    // The ball tries to move at a 0.7 slope in the targetDirection
    const targetVY = speed * targetDirection * 0.7;
    
    // Gravity always pulls down
    const gravityEffect = gravity;
    
    // Apply vertical movement
    ball.y += targetVY + gravityEffect;

    const floorY = getPathY(ball.x);
    
    if (floorY !== null) {
        // CONSTRAINT: Ball cannot fall below the path
        if (ball.y > floorY - ball.radius) {
            ball.y = floorY - ball.radius;
        }

        // GAME OVER: If the ball flies too high away from the path
        // This happens if the player's direction is UP while the path is DOWN
        if (ball.y < floorY - 250) {
            gameOver();
            return;
        }
    } else {
        // Should not happen with continuous generation
        gameOver();
        return;
    }

    // Scrolling
    if (ball.x - offsetX > width / 3) {
        offsetX = ball.x - width / 3;
    }

    // Path generation
    const lastPoint = path[path.length - 1];
    if (lastPoint.x < ball.x + width) {
        addRandomSegment();
    }

    // Cleanup
    if (path.length > 50) {
        path.shift();
    }

    score += 0.1;
    updateScore();
    speed += 0.0003;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw solid ground below path
    if (path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path[0].x - offsetX, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x - offsetX, path[i].y);
        }
        ctx.lineTo(path[path.length-1].x - offsetX, height);
        ctx.lineTo(path[0].x - offsetX, height);
        ctx.fillStyle = '#ecf0f1';
        ctx.fill();
        ctx.closePath();
    }

    // Draw the Path line
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#34495e';
    if (path.length > 0) {
        ctx.moveTo(path[0].x - offsetX, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x - offsetX, path[i].y);
        }
    }
    ctx.stroke();

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x - offsetX, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Zigzag Runner 2D', width / 2, height / 2 - 40);
        ctx.font = '24px sans-serif';
        ctx.fillText('Press SPACE to toggle Direction', width / 2, height / 2 + 20);
        ctx.font = '18px sans-serif';
        ctx.fillText('(Up-Right / Down-Right)', width / 2, height / 2 + 50);
    }
}

function updateScore() {
    scoreElement.innerText = 'Score: ' + Math.floor(score);
}

function gameOver() {
    gameStarted = false;
    alert('Game Over! Score: ' + Math.floor(score));
    initGame();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
        } else {
            targetDirection *= -1; // Toggle direction (1 <-> -1)
        }
        e.preventDefault();
    }
});

window.addEventListener('resize', resize);

resize();
loop();
