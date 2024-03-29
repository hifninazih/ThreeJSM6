import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let camera, scene, renderer, controls;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );
  camera.position.set(0, 0, 5);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.1;
  controls.maxDistance = 1000;

  new RGBELoader().load(
    "textures/studio.hdr", // Diganti sesuai nama path
    function (texture) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.background = envMap;
    }
  );

  scene.add(new THREE.AxesHelper(2));

  camera.position.set(20, 15, 15);

  // Load model the first time
  new GLTFLoader().load("tas/TasDSLR.glb", async function (gltf) {
    gltf.scene.scale.set(40, 40, 40);
    await scene.add(gltf.scene);
    document.getElementById("elems_loading").classList.add("hidden");
    document.getElementById("elems_taskamera").classList.remove("hidden");
    document.getElementById("elems_rumah").classList.remove("hidden");
    document.getElementById("bawah").classList.remove("hidden");
  });

  // Get all radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  // Add click event listener to each radio button
  radioButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.getElementById("elems_loading").classList.remove("hidden");
      document.getElementById("elems_taskamera").classList.add("hidden");
      document.getElementById("elems_rumah").classList.add("hidden");
      document.getElementById("bawah").classList.add("hidden");
      let pathModel;
      let pathHdr;
      let scale;
      if (this.id === "taskamera") {
        pathModel = "tas/TasDSLR.glb";
        pathHdr = "textures/studio.hdr";
        scale = 40;
      } else if (this.id === "rumah") {
        scale = 1;
        pathModel = "gltf/scene.gltf";
        pathHdr = "textures/tief_etz_1k.hdr";
      }
      new GLTFLoader().load(pathModel, async function (gltf) {
        gltf.scene.scale.set(scale, scale, scale);

        const listScene = scene.children.map((child) => child.type);
        for (let i = 0; i < listScene.length; i++) {
          if (listScene[i] === "Group") {
            scene.remove(scene.children[i]);
          }
        }
        await scene.add(gltf.scene);
        document.getElementById("elems_loading").classList.add("hidden");
        document.getElementById("elems_taskamera").classList.remove("hidden");
        document.getElementById("elems_rumah").classList.remove("hidden");
        document.getElementById("bawah").classList.remove("hidden");
      });

      new RGBELoader().load(
        pathHdr, // Diganti sesuai nama path
        function (texture) {
          const pmremGenerator = new THREE.PMREMGenerator(renderer);
          pmremGenerator.compileEquirectangularShader();
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          scene.background = envMap;
        }
      );
    });
  });

  const hemis = new THREE.HemisphereLight(0x3b82f6, 0x080820, 1);
  const dirlight = new THREE.DirectionalLight(0xdddddd, 5);
  const ambilight = new THREE.AmbientLight(0xababab, 4);

  dirlight.position.set(0, 20, 100);
  dirlight.target.position.set(0, 0, 0);

  scene.add(dirlight);
  scene.add(ambilight);
  scene.add(hemis);

  // Toggle AmbientLight
  const ambientToggle = document.getElementById("ambientToggle");
  ambientToggle.addEventListener("change", function () {
    if (ambientToggle.checked) {
      scene.add(ambilight);
    } else {
      scene.remove(ambilight);
    }
  });

  // Toggle DirectionalLight
  const directionalToggle = document.getElementById("directionalToggle");
  directionalToggle.addEventListener("change", function () {
    if (directionalToggle.checked) {
      scene.add(dirlight);
    } else {
      scene.remove(dirlight);
    }
  });

  // Toggle HemisphereLight
  const hemisphereToggle = document.getElementById("hemisphereToggle");
  hemisphereToggle.addEventListener("change", function () {
    if (hemisphereToggle.checked) {
      scene.add(hemis);
    } else {
      scene.remove(hemis);
    }
  });

  animate();
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;
  controls.update();
  renderer.render(scene, camera);
}

init();
