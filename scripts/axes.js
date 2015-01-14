function buildAxes(length) {
  var axes = new THREE.Object3D();

  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false )); // +X
  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true)); // -X
  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false )); // +Y
  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true )); // -Y
  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false )); // +Z
  axes.add(buildAxis(new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true )); // -Z

  return axes;
}

function buildAxis(src, dst, colorHex, dashed) {
  var geom = new THREE.Geometry(),
  mat;

  if (dashed) {
    mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
  } else {
    mat = new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});
  }

  geom.vertices.push(src.clone());
  geom.vertices.push(dst.clone());
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line( geom, mat, THREE.LinePieces );

  return axis;

}

// scene.add(buildAxes(1000));
