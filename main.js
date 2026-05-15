const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0);

// Set initial camera position
camera.position.set(-5, 5, 5);
camera.lookAt(0, 0, 0);

const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 }); // Green ball, reacts to light
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ball);

const pathGroup = new THREE.Group();
scene.add(pathGroup);

let score = 0;
const scoreElement = document.getElementById('score');

let ballLane = 0; // 0 for left path, 1 for right path
let ballY = 0.5;
let ballSpeedX = 0.05;
let cameraSpeed = 0.05;
let gameStarted = false;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

function createPathSegment(x, z, index) {
    const segmentGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2); // Slightly larger segments
    const segmentMaterial = new THREE.MeshStandardMaterial({ 
        color: index % 2 === 0 ? 0xe74c3c : 0x3498db, // Red and Blue
        roughness: 0.8,
        metalness: 0.2
    });
    const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
    segment.position.set(x, 0, z);
    pathGroup.add(segment);
}

function resetGame() {
    ball.position.set(0, 0.5, -0.5);
    ballY = 0.5;
    ballLane = 0;
    score = 0;
    cameraSpeed = 0.05;
    
    // Clear existing path and create a new one
    while(pathGroup.children.length > 0){
        pathGroup.remove(pathGroup.children[0]);
    }
    for (let i = 0; i < 30; i++) {
        createPathSegment(i * 1, i % 2 === 0 ? -0.5 : 0.5, i);
    }
    gameStarted = true;
}

function animate() {
    requestAnimationFrame(animate);

    if (gameStarted) {
        // Move ball forward
        ball.position.x += cameraSpeed;

        // Move ball between lanes smoothly
        const targetZ = ballLane === 0 ? -0.5 : 0.5;
        ball.position.z += (targetZ - ball.position.z) * 0.1;

        // Camera follow
        camera.position.x = ball.position.x - 5;
        camera.position.y = 5;
        camera.position.z = 5;
        camera.lookAt(ball.position.x + 2, 0, 0);

        // Generate new path segments
        const lastSegment = pathGroup.children[pathGroup.children.length - 1];
        if (ball.position.x > lastSegment.position.x - 20) {
            const newIndex = pathGroup.children.length;
            createPathSegment(lastSegment.position.x + 1, lastSegment.position.z === -0.5 ? 0.5 : -0.5, newIndex);
        }
        
        // Remove old segments
        if (pathGroup.children.length > 50) {
            pathGroup.remove(pathGroup.children[0]);
        }

        // Check for falling
        const onPath = pathGroup.children.some(segment => {
            const dx = Math.abs(ball.position.x - segment.position.x);
            const dz = Math.abs(ball.position.z - segment.position.z);
            return dx < 0.6 && dz < 0.6; // Improved collision detection
        });

        if (!onPath) {
            ballY -= 0.1;
            ball.position.y = ballY;
        }

        // Game over conditions
        if (ball.position.y < -5) {
            gameStarted = false;
            alert('Game Over! Your score: ' + Math.floor(score));
            location.reload(); // Simple way to reset everything
        }

        // Update score
        score += cameraSpeed * 10;
        scoreElement.innerText = 'Score: ' + Math.floor(score);
        
        // Gradually increase speed
        cameraSpeed += 0.00005;
    }

    renderer.render(scene, camera);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            resetGame();
        } else {
            ballLane = 1 - ballLane; // Switch lane
        }
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create initial visible path segments even before starting
for (let i = 0; i < 10; i++) {
    createPathSegment(i * 1, i % 2 === 0 ? -0.5 : 0.5, i);
}
ball.position.set(0, 0.5, -0.5);

animate();
