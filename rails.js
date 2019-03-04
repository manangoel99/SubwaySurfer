let rails = class {
  constructor(gl, pos) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    this.positions = [
      //Front
      -2, 0, 4000,
      -2.5, 0, 4000,
      -2, 0.5, 4000,
      -2.5, 0.5, 4000,

      //Back
      -2, 0, -8000,
      -2.5, 0, -8000,
      -2, 0.5, -8000,
      -2.5, 0.5, -8000,

      //Left
      -2.5, 0, 4000,
      -2.5, 0.5, 4000,
      -2.5, 0, -8000,
      -2.5, 0.5, -8000,

      //Right
      -2, 0, 4000,
      -2, 0.5, 4000,
      -2, 0, -8000,
      -2, 0.5, -8000,

      //Top
      -2.5, 0.5, 4000,
      -2, 0.5, 4000,
      -2.5, 0.5, -8000,
      -2, 0.5, -8000,

      //Bottom
      -2.5, 0.5, 4000,
      -2, 0.5, 4000,
      -2.5, 0.5, -8000,
      -2, 0.5, -8000,

      //Front
      2, 0, 4000,
      2.5, 0, 4000,
      2, 0.5, 4000,
      2.5, 0.5, 4000,

      //Back
      2, 0, -8000,
      2.5, 0, -8000,
      2, 0.5, -8000,
      2.5, 0.5, -8000,

      //Left
      2.5, 0, 4000,
      2.5, 0.5, 4000,
      2.5, 0, -8000,
      2.5, 0.5, -8000,

      //Right
      2, 0, 4000,
      2, 0.5, 4000,
      2, 0, -8000,
      2, 0.5, -8000,

      //Top
      2.5, 0.5, 4000,
      2, 0.5, 4000,
      2.5, 0.5, -8000,
      2, 0.5, -8000,

      //Bottom
      2.5, 0.5, 4000,
      2, 0.5, 4000,
      2.5, 0.5, -8000,
      2, 0.5, -8000,

    ];

    console.log([].concat.apply([], [-2.25, 0.75, (6 * i) - 8001]));

    for (var i = 2000; i > 0; i -= 1) {
      //Top
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 8001])
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 7999]);

      //Bottom
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 7999]);

      //Front
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 7999]);

      //Back
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 8001]);

      //Right
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [2.25, 0.75, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [2.25, 0.5, (6 * i) - 8001]);

      //Left
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 7999]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.75, (6 * i) - 8001]);
      Array.prototype.push.apply(this.positions, [-2.25, 0.5, (6 * i) - 8001]);


    }

    console.log(this.positions.length)

    this.pos = pos;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    this.faceColors = [
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
    ];

    for (var i = 0; i < 2000; i += 1) {
      this.faceColors.push([1, 1, 1, 1]);
      this.faceColors.push([1, 1, 1, 1]);
      this.faceColors.push([1, 1, 1, 1]);
      this.faceColors.push([1, 1, 1, 1]);
      this.faceColors.push([1, 1, 1, 1]);
      this.faceColors.push([1, 1, 1, 1]);
    }

    console.log(this.faceColors.length);

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

    let indices = [
      0, 1, 2,  1, 2, 3,
      4, 5, 6,  5, 6, 7,
      8, 9, 10, 9, 10, 11,
      12, 13, 14, 13, 14, 15,
      16, 17, 18, 17, 18, 19,
      20, 21, 22, 21, 22, 23,

      24, 25, 26,  25, 26, 27,
      28, 29, 30,  29, 30, 31,
      32, 33, 34, 33, 34, 35,
      36, 37, 38, 37, 38, 39,
      40, 41, 42, 41, 42, 43,
      44, 45, 46, 45, 46, 47,
    ];

    for (var i = 0; i < 48000; i += 24) {
      //Top
      Array.prototype.push.apply(indices, [48 + i, 48 + i + 1, 48 + i + 2, 48 + i + 1, 48 + i + 2, 48 + i + 3]);
      //Bottom
      Array.prototype.push.apply(indices, [48 + i + 4, 48 + i + 5, 48 + i + 6, 48 + i + 5, 48 + i + 6, 48 + i + 7]);
      //Front
      Array.prototype.push.apply(indices, [48 + i + 8, 48 + i + 9, 48 + i + 10, 48 + i + 9, 48 + i + 10, 48 + i + 11]);
      //Back
      Array.prototype.push.apply(indices, [48 + i + 12, 48 + i + 13, 48 + i + 14, 48 + i + 13, 48 + i + 14, 48 + i + 15]);
      //Right
      Array.prototype.push.apply(indices, [48 + i + 16, 48 + i + 17, 48 + i + 18, 48 + i + 17, 48 + i + 18, 48 + i + 19]);
      //Left
      Array.prototype.push.apply(indices, [48 + i + 20, 48 + i + 21, 48 + i + 22, 48 + i + 21, 48 + i + 22, 48 + i + 23]);
    }

    console.log(indices.length);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    this.buffer = {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    }
  };

  drawRail = (gl, projectionMatrix, programInfo, deltaTime) => {
    const modelViewMatrix = mat4.create();
    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        this.pos
    );
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
        const vertexCount = 72 + 2000 * 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  }
};
