let coin = class {
  constructor(gl, pos) {
    this.pos = pos;

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    this.positions = [];

    var theta = 0;

    var n = 100;

    var radius = 1;
    this.radius = radius;

    var angle = (2 * Math.PI) / n;

    for (var i = 0; i < n ; i += 1) {
      Array.prototype.push.apply(this.positions, [0, 0, 0]);
      Array.prototype.push.apply(this.positions, [radius * Math.cos(theta), radius * Math.sin(theta), 0]);
      Array.prototype.push.apply(this.positions, [radius * Math.cos(theta + angle), radius * Math.sin(theta + angle), 0]);
      Array.prototype.push.apply(this.positions, [radius * Math.cos(theta + 2 * angle), radius * Math.sin(theta + 2 * angle), 0]);
    
      theta += angle;
    }

    this.rotation = 0;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions),gl.STATIC_DRAW);

    this.faceColors = [];

    for (let i = 0; i < n; i += 1) {
      this.faceColors.push([255, 255, 0, 1]);
    }

    var colors = [];

    for (var j = 0; j < this.faceColors.length; ++j) {
      const c = this.faceColors[j];

      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Build the element array buffer; this specifies the indices
    // into the vertex arrays for each face's vertices.

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var indices = [];

    var k = 0;

    for (var i = 0; i < n; i += 1) {
      Array.prototype.push.apply(indices, [k, k + 1, k + 2, k, k + 2, k + 3]);
      k += 4;
    }

    console.log(this.positions.length, indices.length);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

    this.rotationspeed = Math.random() / 4;

    this.buffer = {
      position: this.positionBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };

  }

  drawCoin = (gl, projectionMatrix, programInfo) => {
    const modelViewMatrix = mat4.create();
    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      this.pos
    );

    this.rotation += this.rotationspeed;

    mat4.rotate(modelViewMatrix,
      modelViewMatrix,
      this.rotation,
      [0, 1 , 0]);

    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.color);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
      gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

    {
      const vertexCount = 600;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  };

  detectCollision = (p) => {
    var flag1 = false,
        flag2 = false;

    var quant = (p.pos[0] - this.pos[0]) * (p.pos[0] - this.pos[0]);
    quant += (p.pos[1] - this.pos[1]) * (p.pos[1] - this.pos[1]);
    quant -= (this.radius * this.radius);

    if (quant <= 0) {
      flag1 = true;
    }

    if ((p.pos[2] + 1 - this.pos[2]) * (p.pos[2] - 1 - this.pos[2]) < 0) {
      flag2 = true;
    }

    if (flag1 === true && flag2 === true) {
      return true;
    }
    else {
      return false;
    }
    
  };
};
