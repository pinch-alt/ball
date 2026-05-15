const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let width, height;
let ball = { x: 0, y: 0, radius: 10, color: '#2ecc71' };
let path = [];
let direction = 1; // 1 for down-right (diagonal), -1 for up-right (diagonal)
let gameStarted = false;
let score = 0;
let speed = 2;
let offsetX = 0; // To handle scrolling

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
    speed = 2;
    offsetX = 0;
    ball.x = 50;
    ball.y = height / 2;
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
    
    updateScore();
    draw();
}

function addRandomSegment() {
    const lastPoint = path[path.length - 1];
    const segmentLength = Math.random() * 100 + 50; // Random length between 50 and 150
    // Alternating directions automatically for the initial path generation
    const dir = path.length % 2 === 0 ? 1 : -1;
    
    const newX = lastPoint.x + segmentLength;
    const newY = lastPoint.y + (segmentLength * dir);
    
    path.push({ x: newX, y: newY });
}

function update() {
    if (!gameStarted) return;

    // Ball always moves right
    ball.x += speed;
    // Vertical movement based on current direction
    ball.y += speed * direction;

    // Scrolling: keep the ball roughly in the first 1/3 of the screen
    if (ball.x - offsetX > width / 3) {
        offsetX = ball.x - width / 3;
    }

    // Check if ball is still "on path"
    if (!isBallOnPath()) {
        gameOver();
    }

    // Generate more path if needed
    const lastPoint = path[path.length - 1];
    if (lastPoint.x < ball.x + width) {
        addRandomSegment();
    }

    // Cleanup old path points
    if (path.length > 50) {
        path.shift();
    }

    score += 0.1;
    updateScore();
    speed += 0.0005; // Gradually increase speed
}

function isBallOnPath() {
    // Check which segment the ball is currently in
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        
        if (ball.x >= p1.x && ball.x <= p2.x) {
            // Linear interpolation to find expected Y at ball.x
            const t = (ball.x - p1.x) / (p2.x - p1.x);
            const expectedY = p1.y + t * (p2.y - p1.y);
            
            // Margin of error (path width)
            return Math.abs(ball.y - expectedY) < 20;
        }
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Path
    ctx.beginPath();
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#bdc3c7';
    
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
    ctx.closePath();

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'white';
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press Space to Start', width / 2, height / 2);
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
            direction *= -1; // Switch direction: down-right <-> up-right
        }
        e.preventDefault();
    }
});

window.addEventListener('resize', resize);

resize();
loop();
