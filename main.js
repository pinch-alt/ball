const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let width, height;
let ball = { x: 0, y: 0, vy: 0, radius: 12, color: '#2ecc71' };
let path = []; // Points defining the zigzag floor
let currentPathDir = 1; // 1 for down-right, -1 for up-right
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
    ball.vy = 0;
    currentPathDir = 1;
    path = [{ x: 0, y: height / 2 }];
    
    // Generate initial path segments
    let lastX = 0;
    while (lastX < width * 2) {
        lastX = addRandomSegment();
    }
    
    // Position ball on the floor
    const initialY = getPathY(ball.x);
    if (initialY !== null) {
        ball.y = initialY - ball.radius;
    }
    
    updateScore();
    draw();
}

function addRandomSegment() {
    const lastPoint = path[path.length - 1];
    const segmentLength = Math.random() * 200 + 100; // Random length segments
    
    const newX = lastPoint.x + segmentLength;
    let newY = lastPoint.y + (segmentLength * currentPathDir * 0.7);
    
    // Safety check: Keep path within vertical bounds
    if (newY < 100 || newY > height - 100) {
        currentPathDir *= -1;
        newY = lastPoint.y + (segmentLength * currentPathDir * 0.7);
    }

    path.push({ x: newX, y: newY });
    currentPathDir *= -1; // Toggle for next segment
    return newX;
}

// When user presses space, we flip the path direction from the ball's current position
function togglePathDirection() {
    const ballX = ball.x;
    const ballY = getPathY(ballX);
    
    // 1. Find the index where the ball is
    let segmentIndex = -1;
    for (let i = 0; i < path.length - 1; i++) {
        if (ballX >= path[i].x && ballX <= path[i+1].x) {
            segmentIndex = i;
            break;
        }
    }

    if (segmentIndex !== -1) {
        // 2. Remove all points after the current segment
        path.splice(segmentIndex + 1);
        
        // 3. Flip direction based on what the ball was doing
        const prevPoint = path[segmentIndex];
        const wasGoingDown = ballY > prevPoint.y;
        
        // Start new direction from ball's current position
        path.push({ x: ballX, y: ballY });
        currentPathDir = wasGoingDown ? -1 : 1;
        
        // Generate new segments ahead
        let lastX = ballX;
        for (let i = 0; i < 20; i++) {
            lastX = addRandomSegment();
        }
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
    return path[path.length - 1].y;
}

function update() {
    if (!gameStarted) return;

    // Ball moves right
    ball.x += speed;

    // Gravity pulls ball down
    ball.vy += gravity;
    ball.y += ball.vy;

    // Floor constraint: Ball cannot fall below the floor
    const floorY = getPathY(ball.x);
    if (ball.y > floorY - ball.radius) {
        ball.y = floorY - ball.radius;
        ball.vy = 0; 
    }

    // Scrolling
    if (ball.x - offsetX > width / 3) {
        offsetX = ball.x - width / 3;
    }

    // Path maintenance
    if (path[path.length - 1].x < ball.x + width) {
        addRandomSegment();
    }
    if (path.length > 50 && path[1].x < ball.x - width) {
        path.shift();
    }

    // Game Over: Ball goes off screen
    if (ball.y < -50 || ball.y > height + 50) {
        gameOver();
    }

    score += 0.1;
    updateScore();
    speed += 0.0003;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Floor Fill
    if (path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(path[0].x - offsetX, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x - offsetX, path[i].y);
        }
        ctx.lineTo(path[path.length-1].x - offsetX, height);
        ctx.lineTo(path[0].x - offsetX, height);
        ctx.fillStyle = '#dfe6e9';
        ctx.fill();
        ctx.closePath();
    }

    // Draw Floor Line
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2d3436';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Floor Steer Zigzag', width / 2, height / 2 - 20);
        ctx.font = '24px sans-serif';
        ctx.fillText('Press SPACE to Flip Path Direction', width / 2, height / 2 + 30);
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
            togglePathDirection();
        }
        e.preventDefault();
    }
});

window.addEventListener('resize', resize);

resize();
loop();
