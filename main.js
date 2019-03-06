var cubeRotation = 0.0;

main();

//
// Start here
//

var c;
var c1;
var g;
var r1;
var r2;
var w;
var p;

var co;

var playerJumpStatus = false;
var playerRightStatus = false;
var playerLeftStatus = false;

$(document).keypress((event) => {
  //console.log(event.which);

  // if (String.fromCharCode(event.which))
  if (event.which === 32 && playerJumpStatus === false) {
    playerJumpStatus = true;
  }

  if (event.which === 100 && playerLeftStatus === false) {
    playerRightStatus = true;
  }

  if (event.which === 97 && playerRightStatus === false) {
    playerLeftStatus = true;
  }

  console.log(event.which);
});

function main() {


  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  c = new cube(gl, [2, 5.0, -3.0]);
  c1 = new cube(gl, [2, -12, -8.0]);
  g = new ground(gl, [0, -2, 0]);
  r1 = new rails(gl, [-7.5, -2, 0]);
  r2 = new rails(gl, [7.5, -2, 0]);
  w = new walls(gl, [0, -2, 3800]);
  p = new player(gl, [-7, 0, 3995]);
  // co = new coin(gl, [-7.5, 1, 3990]);
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, deltaTime);
    tick_elements();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 1000.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  mat4.translate(cameraMatrix, cameraMatrix, [0, 10, 4025]);

  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];

  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, [0, 0, -250], up);

  var viewMatrix = cameraMatrix;

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  g.drawGround(gl, viewProjectionMatrix, programInfo, initShaderProgram);
  r1.drawRail(gl, viewProjectionMatrix, programInfo);
  r2.drawRail(gl, viewProjectionMatrix, programInfo);
  w.drawGround(gl, viewProjectionMatrix, programInfo, initShaderProgram);
  p.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  // co.drawCoin(gl, viewProjectionMatrix, programInfo);

}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


tick_elements = () => {
  r1.pos[2] += 0.1;
  r2.pos[2] += 0.1;

  p.tick(playerJumpStatus, playerRightStatus, playerLeftStatus);

  if (p.pos[1] <= 0.25 && p.pos[1] >= -0.25 && playerJumpStatus === true) {
    playerJumpStatus = false
  }

  if (p.pos[0] <= 7.25 && p.pos[0] >= 6.75 && playerRightStatus === true) {
    playerRightStatus = false;
  }

  if (p.pos[0] >= -7.25 && p.pos[0] <= -6.75 && playerLeftStatus === true) {
    playerLeftStatus = false;
  }

}
