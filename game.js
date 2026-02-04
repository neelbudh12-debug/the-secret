let scene, camera, renderer;
let clock = new THREE.Clock();
let fps = document.getElementById("fps");
let overlay = document.getElementById("overlay");

let keys = {};
let yaw = 0, pitch = 0;
let state = "TITLE";

let enemy, weapon;
let hasWeapon = false;

// ---------- START ----------
init();
animate();

function startGame() {
  overlay.style.display = "none";
  state = "PLAYING";
  document.body.requestPointerLock();
}

// ---------- INIT ----------
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  buildHouse();
  buildEnemy();
  buildWeapon();

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", e => keys[e.code] = true);
  window.addEventListener("keyup", e => keys[e.code] = false);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", attack);
}

// ---------- HOUSE ----------
function buildHouse() {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.1, 30),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  [[0,2.5,-15,30,5,0.2],[0,2.5,15,30,5,0.2],[-15,2.5,0,0.2,5,30],[15,2.5,0,0.2,5,30]]
  .forEach(w=>{
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w[3],w[4],w[5]), wallMat);
    wall.position.set(w[0],w[1],w[2]);
    wall.castShadow = true;
    scene.add(wall);
  });

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5,10,5);
  light.castShadow = true;
  scene.add(light);

  scene.add(new THREE.AmbientLight(0x404040));
}

// ---------- WEAPON ----------
function buildWeapon() {
  weapon = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ffff })
  );
  weapon.position.set(2, 0.2, 2);
  weapon.castShadow = true;
  scene.add(weapon);
}

// ---------- ENEMY ----------
function buildEnemy() {
  enemy = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xaa0000 })
  );
  enemy.position.set(0,1,-6);
  enemy.userData.dir = 1;
  scene.add(enemy);
}

// ---------- INPUT ----------
function onMouseMove(e) {
  if (state !== "PLAYING") return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
  camera.rotation.set(pitch, yaw, 0);
}

// ---------- ATTACK ----------
function attack() {
  if (!hasWeapon || state !== "PLAYING") return;
  if (enemy.position.distanceTo(camera.position) < 2) {
    winGame();
  }
}

// ---------- UPDATE ----------
function updatePlayer(delta) {
  const speed = 4 * delta;
  const dir = new THREE.Vector3();

  if (keys["KeyW"]) dir.z -= speed;
  if (keys["KeyS"]) dir.z += speed;
  if (keys["KeyA"]) dir.x -= speed;
  if (keys["KeyD"]) dir.x += speed;

  dir.applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
  camera.position.add(dir);

  if (!hasWeapon && camera.position.distanceTo(weapon.position) < 1) {
    hasWeapon = true;
    scene.remove(weapon);
  }
}

function updateEnemy(delta) {
  enemy.position.x += enemy.userData.dir * delta * 2;
  if (enemy.position.x > 6 || enemy.position.x < -6) enemy.userData.dir *= -1;

  if (enemy.position.distanceTo(camera.position) < 1.5) {
    loseGame();
  }
}

// ---------- GAME STATES ----------
function loseGame() {
  alert("The correction found you.\nTimeline restored.");
  location.reload();
}

function winGame() {
  alert("Correction destroyed.\nTHE SECRET remains.");
  location.reload();
}

// ---------- LOOP ----------
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (state === "PLAYING") {
    updatePlayer(delta);
    updateEnemy(delta);
  }

  fps.textContent = "FPS: " + Math.round(1 / delta);
  renderer.render(scene, camera);
}

// ---------- RESIZE ----------
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
