const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f0f0);

const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32);
const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x2ecc71 }); // Green ball
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

// Add lighting for better 3D effect
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

function createPathSegment(x, z, index) {
    const segmentGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    // Alternating colors for the paths
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
    camera.position.x = -5;

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
        // Move camera forward
        camera.position.x += cameraSpeed;
        
        // Move ball forward
        ball.position.x += cameraSpeed;

        // Speed up camera if ball gets too close to the right edge
        const screenEdgeRight = camera.position.x + (window.innerWidth / window.innerHeight) * camera.getFilmWidth() / 25;
        if (ball.position.x > screenEdgeRight - 2) {
            camera.position.x += 0.02; // Give a little boost to the camera
        }

        // Generate new path segments as the camera moves
        if (pathGroup.children.length > 0 && camera.position.x > pathGroup.children[5].position.x) {
            const lastSegment = pathGroup.children[pathGroup.children.length - 1];
            const newIndex = pathGroup.children.length;
            createPathSegment(lastSegment.position.x + 1, lastSegment.position.z === -0.5 ? 0.5 : -0.5, newIndex);
            pathGroup.remove(pathGroup.children[0]);
        }

        // Move ball between lanes
        const targetZ = ballLane === 0 ? -0.5 : 0.5;
        ball.position.z += (targetZ - ball.position.z) * 0.1;

        // Check for falling
        const onPath = pathGroup.children.some(segment => {
            return ball.position.distanceTo(segment.position) < 0.75;
        });

        if (!onPath) {
            ballY -= 0.02;
            ball.position.y = ballY;
        }

        // Game over conditions
        const screenEdgeLeft = camera.position.x - (window.innerWidth / window.innerHeight) * camera.getFilmWidth() / 25;
        if (ball.position.y < -1 || ball.position.x < screenEdgeLeft) {
            gameStarted = false;
            alert('Game Over! Your score: ' + Math.floor(score));
        }

        // Update score
        score += cameraSpeed * 10;
        scoreElement.innerText = 'Score: ' + Math.floor(score);
    }

    renderer.render(scene, camera);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            resetGame();
        }
        ballLane = 1 - ballLane; // Switch lane
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initial message
function showStartMessage(){
    alert("Press Spacebar to Start");
}
showStartMessage();
animate();
