// @credit http://learningthreejs.com/blog/2013/09/16/how-to-make-the-earth-in-webgl/

// a scene, a camera, and a renderer are required to display anything

// SCENE
var scene = new THREE.Scene();

// CAMERA
// arg1: vertical field of view in degrees
// arg2: aspect ratio
// arg3: near clipping plane
// arg4: far clipping plane
// if object is too far or too close to camera it won't render
var camera = new THREE.PerspectiveCamera(
  45, // angle of the FOV (Field of View), a large angle is like a wide angle lens
  window.innerWidth/window.innerHeight, // the aspect ratio of the screen
  0.01, // objects closer than this won't be picked up by the camera
  1000 // objects further than this won't be either
);
camera.position.z = 1;
camera.lookAt(new THREE.Vector3(0,0,0));

// RENDERER
var renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000,1);
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
var renderStack = [];

// LIGHT
var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1,1,5);
light.castShadow = true;
light.shadowCameraNear = 0.01;
light.shadowCameraFar = 15;
light.shadowCameraFov = 45;

light.shadowCameraLeft = -1;
light.shadowCameraRight = 1;
light.shadowCameraTop = 1;
light.shadowCameraBottom= -1;
light.shadowBias = 0.001;
light.shadowDarkness = 0.2;
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;
//light.shadowCameraVisible = true;

scene.add(light);
scene.add(new THREE.AmbientLight(0x333333));

// CONTAINER
var container = new THREE.Object3D();
container.rotateZ(-23.4 * Math.PI/180);
container.position.z = 0;
scene.add(container);

// EARTH
var earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
var earthMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('images/earthmap1k.jpg'),
  bumpMap: THREE.ImageUtils.loadTexture('images/earthbump1k.jpg'),
  bumpScale: 0.05,
  specularMap: THREE.ImageUtils.loadTexture('images/earthspec1k.jpg'), // shininess on oceans
  specular: 0x808080,
  side: THREE.DoubleSide
});
var earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.receiveShadow = true;
earth.castShadow = true;

renderStack.push(function(now, delta) {
  earth.rotation.y += (1/8 * delta) / 1000;
});

container.add(earth);

// MOON
var moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
var moonMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture('images/moonmap1k.jpg'),
  //bumpMap: THREE.ImageUtils.loadTexture('images/moonbump1k.jpg'),
  //bumpScale: 0.05,
  side: THREE.DoubleSide
});

var moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(0.5,0.5,0.5);
moon.scale.multiplyScalar(1/7);
moon.receiveShadow = true;
moon.castShadow = true;

renderStack.push(function(now, delta) {
  moon.rotation.y += (1/8 * delta) / 1000;
});

container.add(moon);

// CLOUDS
// create destination canvas
var canvasResult  = document.createElement('canvas');
canvasResult.width= 1024;
canvasResult.height = 512;
var contextResult  = canvasResult.getContext('2d');

// load earthcloudmap
var imageMap  = new Image();
imageMap.addEventListener('load', function() {

  // create dataMap ImageData for earthcloudmap
  var canvasMap = document.createElement('canvas');
  canvasMap.width = imageMap.width;
  canvasMap.height = imageMap.height;
  var contextMap = canvasMap.getContext('2d');
  contextMap.drawImage(imageMap, 0, 0);
  var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height);

  // load earthcloudmaptrans
  var imageTrans = new Image();
  imageTrans.addEventListener('load', function() {
    // create dataTrans ImageData for earthcloudmaptrans
    var canvasTrans  = document.createElement('canvas');
    canvasTrans.width = imageTrans.width;
    canvasTrans.height = imageTrans.height;
    var contextTrans = canvasTrans.getContext('2d');
    contextTrans.drawImage(imageTrans, 0, 0);
    var dataTrans  = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height);
    // merge dataMap + dataTrans into dataResult
    var dataResult    = contextMap.createImageData(canvasMap.width, canvasMap.height);
    for (var y = 0, offset = 0; y < imageMap.height; y++) {
      for (var x = 0; x < imageMap.width; x++, offset += 4) {
        dataResult.data[offset+0] = dataMap.data[offset+0];
        dataResult.data[offset+1] = dataMap.data[offset+1];
        dataResult.data[offset+2] = dataMap.data[offset+2];
        dataResult.data[offset+3] = 255 - dataTrans.data[offset+0];
      }
    }
    // update texture with result
    contextResult.putImageData(dataResult,0,0);
    cloudMaterial.map.needsUpdate = true;
  });
  imageTrans.src = 'images/earthcloudmaptrans.jpg';
}, false);

imageMap.src  = 'images/earthcloudmap.jpg';

var cloudGeometry = new THREE.SphereGeometry(0.51, 32, 32);
var cloudMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.Texture(canvasResult),
  side: THREE.DoubleSide,
  opacity: 0.8,
  transparent: true,
  depthWrite: false,
});
var cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
cloud.receiveShadow = true;
cloud.castShadow = true;
earth.add(cloud); // will move together with earth

renderStack.push(function(now, delta) {
  cloud.rotation.y += (1/16 * delta) / 1000;
});

// STARS
var starsGeometry = new THREE.SphereGeometry(90, 32, 32);
var starsMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture('images/galaxystarfield.png'),
  side: THREE.BackSide
});
var stars = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(stars);

// CONTROLS
var controls = new THREE.TrackballControls(camera);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 0.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

// AXES (x y z axis lines)
//scene.add(buildAxes(1000));

var rotSpeed = 0.001;
var timeLast = Date.now();

renderStack.push(function() {
  renderer.render(scene, camera);
});

// move camera away
camera.position.set(0,8,8);
var zoomIn = 8;

renderStack.push(function() {
  var x = camera.position.x,
  y = camera.position.y,
  z = camera.position.z;

  if (zoomIn >= 1.3) {
    camera.position.set(0,zoomIn,zoomIn);
    zoomIn -= 0.05;
  } else {
    camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    //camera.position.y = y * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
  }


  camera.lookAt(scene.position);
});

function animate(nowMsec) {
  stats.update();
  controls.update();

  var timeNow = Date.now();

  renderStack.forEach(function(fn) {
    fn(timeNow, timeNow - timeLast);
  });

  timeLast = timeNow;

  requestAnimationFrame(animate);
}

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

requestAnimationFrame(animate);
