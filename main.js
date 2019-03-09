var cubeRotation = 0.0;

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//
// Start here
//


function initialize() {
  vsSourceNorm = undefined, fsSourceNorm = undefined;
  fsSourceWall = undefined;
  shaderProgramWall = undefined;
  GameStatus = false;

  c = undefined;
  c1 = undefined;
  g = undefined;
  r1 = undefined;
  r2 = undefined;
  w = undefined;
  p = undefined;
  pol = undefined;
  FlyingBoostList = undefined;
  JumpBoostList = undefined;
  score = 0;
  GreyScale = false;

  speed = 0.5;

  acc = 0.00625;

  initpos = 0;

  co = undefined;

  DuckObstacles = undefined;
  vsSourceText = undefined;
  fsSourceText = undefined;
  programInfo = undefined;

  coin_arr = undefined;
  StopObstacles = undefined;

  playerJumpStatus = false;
  playerRightStatus = false;
  playerLeftStatus = false;
  playerDuck = false;
  FlyBoostStatus = false;
  JumpBoostStatus = false;

  FlyBoostAttainPos = undefined;
  JumpBoostAttainPos = undefined;

  jumpinitpos = 0;
  jumpfinalpos = 0;

  MovingTrains = undefined;

  shaderProgramNorm = undefined, shaderProgramText = undefined;

}

var vsSourceNorm, fsSourceNorm;
var fsSourceWall;
var shaderProgramWall;
var GameStatus = false;
var pauseStatus = false;
var MovingTrains = undefined;

var c;
var c1;
var g;
var r1;
var r2;
var w;
var p;
var pol;
var FlyingBoostList;
var JumpBoostList;
var score = 0;
var GreyScale = false;

var speed = 0.5;

var acc = 0.00625;

var initpos = 0;

var co;

var DuckObstacles;
var vsSourceText;
var fsSourceText;
var programInfo;

var coin_arr;
var StopObstacles;

var playerJumpStatus = false;
var playerRightStatus = false;
var playerLeftStatus = false;
var playerDuck = false;
var FlyBoostStatus = false;
var JumpBoostStatus = false;

var FlyBoostAttainPos;
var JumpBoostAttainPos;

var jumpinitpos = 0;
var jumpfinalpos = 0;

var shaderProgramNorm, shaderProgramText;

$(document).keypress((event) => {
  if (event.which === 32 && playerJumpStatus === false && FlyBoostStatus === false) {
    playerJumpStatus = true;
    jumpinitpos = initpos;
  }

  if (event.which === 100 && playerLeftStatus === false && p.pos[0] < 7) {
    playerRightStatus = true;
  }

  if (event.which === 97 && playerRightStatus === false && p.pos[0] > -7) {
    playerLeftStatus = true;
  }

  if (event.which === 115) {
    playerDuck = true;
  }
});

$(document).keyup((event) => {
  if (event.which === 83) {
    playerDuck = false;
  }
});

function ScoreRender() {
  $("#score").text(score);
}

function getX() {
  var x;

  if (Math.round(Math.random() * 10) % 2 == 0) {
    x = -7;
  }

  else {
    x = 7;
  }

  return x;
}



function main() {


  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  GameStatus = true;

  vsSourceText = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying highp vec2 vTextureCoord;
      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
  `;

  fsSourceText = `
      varying highp vec2 vTextureCoord;

      uniform sampler2D uSampler;

      void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
  `;

  fsSourceWall = fsSourceText;

  coin_arr = [];
  FlyingBoostList = [];
  JumpBoostList = [];
  MovingTrains = [];
  FlyBoostAttainPos = undefined;

  for (var i = 0; i < 10; i++) {

    var f = new FlyingBoost(gl, [getX(), 0, 4000 - i * 1000]);
    FlyingBoostList.push(f);
    console.log(f.pos);
  }

  for (var i = 0; i < 10; i++) {

    var f = new JumpBoost(gl, [getX(), 0, 4000 - i * 800]);
    JumpBoostList.push(f);
  }

  for (var i = 0; i < 50; i += 1) {
    var coi = new coin(gl, [getX(), getRndInteger(7, 17), getRndInteger(4000, -8000)]);

    coin_arr.push(coi);
  }

  for (var i = 0; i < 100; i += 1) {

    var coi = new coin(gl, [getX(), 0, getRndInteger(4000, -8000)]);

    coin_arr.push(coi);
  }

  g = new ground(gl, [0, -2, 0], fsSourceText, vsSourceText, initShaderProgram);
  r1 = new rails(gl, [-7.5, -2, 0]);
  r2 = new rails(gl, [7.5, -2, 0]);
  w = new walls(gl, [0, -2, 3800]);
  p = new player(gl, [-7, 0, 3970]);
  pol = new police(gl, [-7, 0, 4000]);
  DuckObstacles = [];
  StopObstacles = [];

  for (var i = 0; i < 10; i += 1) {
    var obs = new StopObstacle(gl, [getX(), -2, getRndInteger(4000, 2000)], initShaderProgram);
    StopObstacles.push(obs);
  }

  for (var i = 0; i < 5; i += 1) {

    var obs = new DuckObstacle(gl, [getX(), -2, getRndInteger(4000, 2000)]);
    DuckObstacles.push(obs);
  }

  for (var i = 0; i < 5; i += 1) {
    var moveT = new MoveTrain(gl, [getX(), -2, getRndInteger(3000, 0)]);
    MovingTrains.push(moveT);
  }

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  vsSourceNorm = `
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

  fsSourceNorm = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  shaderProgramNorm = initShaderProgram(gl, vsSourceNorm, fsSourceNorm);
  shaderProgramText = initShaderProgram(gl, vsSourceText, fsSourceText);
  shaderProgramWall = initShaderProgram(gl, vsSourceText, fsSourceWall);
  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  programInfo = {
    program: shaderProgramNorm,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramNorm, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgramNorm, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramNorm, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramNorm, 'uModelViewMatrix'),
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
    shaderProgramNorm = initShaderProgram(gl, vsSourceNorm, fsSourceNorm);

    shaderProgramText = initShaderProgram(gl, vsSourceText, fsSourceText);

    shaderProgramWall = initShaderProgram(gl, vsSourceText, fsSourceWall);

    programInfo = {
      program: shaderProgramNorm,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgramNorm, 'aVertexPosition'),
        vertexColor: gl.getAttribLocation(shaderProgramNorm, 'aVertexColor'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgramNorm, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgramNorm, 'uModelViewMatrix'),
      },
    };
    if (GameStatus === true) {
      drawScene(gl, programInfo, deltaTime);
      if (pauseStatus === false) {
        tick_elements(gl);
      }
    }
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
  mat4.translate(cameraMatrix, cameraMatrix, [0, p.pos[1] + 10, p.pos[2] + 50]);

  var cameraPosition = [
    cameraMatrix[12],
    cameraMatrix[13],
    cameraMatrix[14],
  ];

  var up = [0, 1, 0];

  mat4.lookAt(cameraMatrix, cameraPosition, [0, p.pos[1], p.pos[2] - 250], up);

  var viewMatrix = cameraMatrix;

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  g.drawGround(gl, viewProjectionMatrix, shaderProgramText);
  r1.drawRail(gl, viewProjectionMatrix, shaderProgramText);
  r2.drawRail(gl, viewProjectionMatrix, shaderProgramText);
  w.drawGround(gl, viewProjectionMatrix, shaderProgramWall);
  p.drawCube(gl, viewProjectionMatrix, programInfo, deltaTime);
  pol.drawCube(gl, viewProjectionMatrix, programInfo);
  coin_arr.forEach(element => {
    element.drawCoin(gl, viewProjectionMatrix, shaderProgramText);
  });

  StopObstacles.forEach(element => {
    element.drawObstacle(gl, viewProjectionMatrix, shaderProgramText);
    if (element.detectCollision(p) && FlyBoostStatus === false) {
      //console.log("THUKA");
      GameStatus = false;
    }
    // console.log(element.pos)
  });

  DuckObstacles.forEach(element => {
    element.drawObstacle1(gl, viewProjectionMatrix, shaderProgramText);
    if (element.detectCollision(p, playerDuck) && FlyBoostStatus === false) {
      if (speed >= 0.25)
        speed -= 0.2;
    }
  });

  FlyingBoostList.forEach(element => {
      element.drawBoost(gl, viewProjectionMatrix, shaderProgramText);
      if (element.detectCollision(p)) {
        console.log("COLLECTED");
        if (FlyBoostStatus === false) {
          FlyBoostAttainPos = p.pos[2];
        }

        FlyBoostStatus = true;
        playerJumpStatus = false;
      }
  });

  JumpBoostList.forEach(element => {
    element.drawBoost(gl, viewProjectionMatrix, shaderProgramText);
    if (element.detectCollision(p)) {
      console.log("HHHHHHHH");
      if (JumpBoostStatus === false) {
        JumpBoostAttainPos = p.pos[2];
      }

      JumpBoostStatus = true;
      p.velocity = 5;
      p.initVelocity = 5;
    }
  });

  MovingTrains.forEach(element => {
    element.drawTurn(gl, viewProjectionMatrix, shaderProgramText);
    if (element.detectCollision(p)) {
      GameStatus = false;
    }
  });
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


tick_elements = (gl) => {

  p.pos[2] -= speed;
  if (speed < 1) {
    speed += acc;
  }
  ScoreRender();
  initpos += 0.1;

  p.tick(playerJumpStatus, playerRightStatus, playerLeftStatus, FlyBoostStatus);

  // console.log(FlyBoostAttainPos, p.pos, FlyBoostStatus, playerJumpStatus);
  if (FlyBoostAttainPos != undefined) {
    if (FlyBoostAttainPos - p.pos[2] >= 500) {
      FlyBoostStatus = false;
      FlyBoostAttainPos = undefined;
    }

  }

  if (JumpBoostStatus != undefined) {
    if (JumpBoostAttainPos - p.pos[2] >= 250) {
      JumpBoostStatus = false;
      JumpBoostAttainPos = undefined;
      p.velocity = 2;
      p.initVelocity = 2;
    }
  }

  pol.tick(playerRightStatus, playerLeftStatus);

  if (pol.pos[2] - p.pos[2] > 15) {
    pol.pos[2] = p.pos[2] + 15;
  }

  if (pol.detectCollision(p)) {
    console.log("Pakda Gaya");
    GameStatus = false;
  }

  if (p.pos[1] <= 0.25 && p.pos[1] >= -0.25 && playerJumpStatus === true) {
    playerJumpStatus = false
    jumpfinalpos = initpos;
  }

  if (p.pos[0] <= 7.25 && p.pos[0] >= 6.75 && playerRightStatus === true) {
    playerRightStatus = false;
  }

  if (p.pos[0] >= -7.25 && p.pos[0] <= -6.75 && playerLeftStatus === true) {
    playerLeftStatus = false;
  }

  var toBeDeleted = undefined;

  for (let i = 0; i < coin_arr.length; i += 1) {
    const element = coin_arr[i];

    if (element.detectCollision(p) === true) {
      toBeDeleted = element;
      score += 1;
    }

  }

  if (toBeDeleted != undefined) {
    coin_arr = coin_arr.filter(function (value, index, arr) {
      return value != toBeDeleted;
    });
  }

  toBeDeleted = undefined;

  for (let i = 0; i < StopObstacles.length; i += 1) {
    const element = StopObstacles[i];

    if (element.pos[2] > p.pos[2]) {
      toBeDeleted = element;
    }

  }

  if (toBeDeleted != undefined) {
    StopObstacles = StopObstacles.filter(function (value, index, arr) {
      return value != toBeDeleted;
    });
  }

  toBeDeleted = undefined;

  for (let i = 0; i < DuckObstacles.length; i += 1) {
    const element = StopObstacles[i];

    if (element.pos[2] > p.pos[2]) {
      toBeDeleted = element;
    }

  }

  if (toBeDeleted != undefined) {
    StopObstacles = StopObstacles.filter(function (value, index, arr) {
      return value != toBeDeleted;
    });
  }

  while (StopObstacles.length < 10) {
    var obs = new StopObstacle(gl, [getX(), -2, getRndInteger(p.pos[2] - 100, p.pos[2] - 4000)], initShaderProgram);
    StopObstacles.push(obs);
  }

  while (DuckObstacles.length < 5) {

    var obs = new DuckObstacles(getX(), [x, -2, getRndInteger(p.pos[2] - 100, p.pos[2] - 1000)]);
    DuckObstacles.push(obs);
  }

  if (playerDuck === true) {
    p.duck(gl, playerDuck);
  }

  if (playerDuck === false) {
    p.unduck(gl);
  }

  MovingTrains.forEach(element => {
    element.tick();
    console.log(element.pos);
  });

}


makeGreyScale = () => {
  if (GreyScale === false) {
    fsSourceText = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord).rrra;
        }
    `;

    fsSourceWall = fsSourceText;

    fsSourceNorm = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor.rrra;
      }
    `;

    GreyScale = true;
  }
  else {
    fsSourceText = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
    `;

    fsSourceWall = fsSourceText;

    fsSourceNorm = `
      varying lowp vec4 vColor;

      void main(void) {
        gl_FragColor = vColor;
      }
    `;

    GreyScale = false;
  }
  // console.log(fsSourceText, fsSourceNorm);

}

window.setInterval(function() {
  if (GreyScale === false) {
    fsSourceWall = `

        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {

            gl_FragColor = vec4(texture2D(uSampler, vTextureCoord).r + 0.25, texture2D(uSampler, vTextureCoord).g + 0.25, texture2D(uSampler, vTextureCoord).b + 0.25, texture2D(uSampler, vTextureCoord).a);
            //gl_FragColor = texture2D(uSampler, vTextureCoord).gba;

        }

    `;

  }
}, 5000);

window.setInterval(function() {
  if (GreyScale === false)
    fsSourceWall = fsSourceText;
}, 8000);


document.getElementById('pauseGame').addEventListener("click", function() {
  pauseStatus = true;
});

document.getElementById('resumeGame').addEventListener("click", function() {

  pauseStatus = false;

});
