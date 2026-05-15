const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let width, height;
let ball = { x: 0, y: 0, vy: 0, radius: 12, color: '#2ecc71' };
let path = [];
let direction = 1; // 1 for down-right, -1 for up-right
let gameStarted = false;
let score = 0;
let speed = 3;
let gravity = 0.5;
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
    speed = 3;
    offsetX = 0;
    ball.x = 100;
    ball.y = height / 2;
    ball.vy = 0;
    direction = 1;
    path = [];
    
    // Initial path point
    let lastX = 0;
    let lastY = height / 2;
    path.push({ x: lastX, y: lastY });

    // Generate initial segments
    for (let i = 0; i < 20; i++) {
        addRandomSegment();
    }
    
    // Position ball on the first segment
    const initialY = getPathY(ball.x);
    if (initialY !== null) {
        ball.y = initialY - ball.radius;
    }
    
    updateScore();
    draw();
}

function addRandomSegment() {
    const lastPoint = path[path.length - 1];
    const segmentLength = Math.random() * 150 + 100; // Longer segments for 2D feel
    const dir = path.length % 2 === 0 ? 1 : -1;
    
    const newX = lastPoint.x + segmentLength;
    // Slope is around 45 degrees or less
    const newY = lastPoint.y + (segmentLength * dir * 0.6);
    
    // Keep path within screen vertical bounds
    if (newY < 100 || newY > height - 100) {
        path.push({ x: newX, y: lastPoint.y - (segmentLength * dir * 0.6) });
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

    // Ball moves right
    ball.x += speed;

    // Gravity acts on the ball
    ball.vy += gravity;
    
    // Apply direction (upward or downward force/velocity)
    // If direction is -1 (up), we apply an upward force to overcome gravity
    if (direction === -1) {
        ball.vy -= gravity * 2.2; // Move up
    } else {
        ball.vy += gravity * 0.5; // Move down faster
    }

    // Limit vertical velocity
    ball.vy = Math.max(Math.min(ball.vy, 10), -10);
    
    ball.y += ball.vy;

    const floorY = getPathY(ball.x);
    
    if (floorY !== null) {
        // CONSTRAINT: Ball cannot fall below the zigzag
        if (ball.y > floorY - ball.radius) {
            ball.y = floorY - ball.radius;
            ball.vy = 0;
        }
    }

    // Scrolling
    if (ball.x - offsetX > width / 3) {
        offsetX = ball.x - width / 3;
    }

    // GAME OVER conditions
    // 1. If ball goes off the path
    if (floorY === null) {
        gameOver();
        return;
    }
    // 2. If ball flies too high above the path (lost control)
    if (ball.y < floorY - 300) {
        gameOver();
        return;
    }

    // Generate more path
    const lastPoint = path[path.length - 1];
    if (lastPoint.x < ball.x + width) {
        addRandomSegment();
    }

    if (path.length > 50) {
        path.shift();
    }

    score += 0.1;
    updateScore();
    speed += 0.0005;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Path (the ground)
    ctx.beginPath();
    ctx.lineWidth = 10;
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

    // Draw a "shadow" or fill below the path to make it look like solid ground
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

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x - offsetX, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Space to Start', width / 2, height / 2);
        ctx.font = '20px sans-serif';
        ctx.fillText('Hold Space to move UP, Release to fall DOWN', width / 2, height / 2 + 40);
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
            direction = -1; // Switch to "UP"
        }
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        direction = 1; // Switch to "DOWN"
    }
});

window.addEventListener('resize', resize);

resize();
loop();
