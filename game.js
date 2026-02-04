let scene, camera, renderer;
let clock = new THREE.Clock();
let enemy;
let fpsCounter = document.getElementById("fps");

let state = "TITLE";

// ---------- INIT ----------
init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.6, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  buildHouse();
  buildEnemy();
  buildTitle();

  window.addEventListener("resize", onResize);
  window.addEventListener("click", startGame);
}

// ---------- HOUSE ----------
function buildHouse() {
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.1, 30),
    floorMat
  );
  floor.receiveShadow = true;
  scene.add(floor);

  const walls = [
    [0, 2.5, -15, 30, 5, 0.2],
    [0, 2.5, 15, 30, 5, 0.2],
    [-15, 2.5, 0, 0.2, 5, 30],
    [15, 2.5, 0, 0.2, 5, 30]
  ];

  walls.forEach(w => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w[3], w[4], w[5]),
      wallMat
    );
    wall.position.set(w[0], w[1], w[2]);
    wall.castShadow = true;
    scene.add(wall);
  });

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(6, 10, 6);
  light.castShadow = true;
  scene.add(light);

  scene.add(new THREE.AmbientLight(0x404040));
}

// ---------- ENEMY ----------
function buildEnemy() {
  const geo = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
  const mat = new THREE.MeshStandardMaterial({ color: 0xaa0000 });
  enemy = new THREE.Mesh(geo, mat);
  enemy.position.set(0, 1, -5);
  enemy.castShadow = true;
  enemy.userData.dir = 1;
  scene.add(enemy);
}

// ---------- TITLE ----------
function buildTitle() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "64px sans-serif";
  ctx.fillText("THE SECRET", 60, 140);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 5),
    mat
  );
  mesh.position.set(0, 3, -8);
  scene.add(mesh);
}

// ---------- GAME FLOW ----------
function startGame() {
  if (state !== "TITLE") return;
  state = "PLAYING";
}

// ---------- UPDATE ----------
function updateEnemy(delta) {
  enemy.position.x += enemy.userData.dir * delta * 2;
  if (enemy.position.x > 6 || enemy.position.x < -6) {
    enemy.userData.dir *= -1;
  }

  const dist = enemy.position.distanceTo(camera.position);
  if (dist < 1.5) {
    alert("DISCOVERED.\nTimeline correction complete.");
    location.reload();
  }
}

// ---------- LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (state === "PLAYING") {
    updateEnemy(delta);
  }

  fpsCounter.textContent = "FPS: " + Math.round(1 / delta);
  renderer.render(scene, camera);
}

// ---------- RESIZE ----------
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
