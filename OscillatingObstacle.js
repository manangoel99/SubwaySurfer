let oscObsatcle = class {
  constructor(gl, pos) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    this.positions = [
      -2.5, 6, 0,
      2.5, 6, 0,
      -2.5, 0.75, 0,
      2.5, 0.75, 0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    this.rotation = 0;
    this.pos = pos;

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
      0, 1, 2,  1, 2, 3,
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.texture = getTexture(gl, "./oscObstacle.png");

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    this.buffer = {
      position: positionBuffer,
      indices: indexBuffer,
      textureCoord: textureCoordBuffer,
    };

    this.direction = "left";
  }

  drawObstacle = (gl, projectionMatrix, shaderProgram) => {
    const modelViewMatrix = mat4.create();
    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        this.pos
    );

    this.programInfo1 = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },

    };

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
        gl.vertexAttribPointer(
            this.programInfo1.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            this.programInfo1.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.textureCoord);
        gl.vertexAttribPointer(
            this.programInfo1.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            this.programInfo1.attribLocations.textureCoord);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

    // Tell WebGL to use our program when drawing

    gl.useProgram(this.programInfo1.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        this.programInfo1.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        this.programInfo1.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.programInfo1.uniformLocations.uSampler, 0); {
        const vertexCount = 6;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  };

  tick = () => {
    if (this.direction == "left") {
      this.pos[0] -= 0.5;
      if (this.pos[0] <= -7) {
        this.direction = "right"
      }
    }
    else if (this.direction == "right"){
      this.pos[0] += 0.5;
      if (this.pos[0] >= 7) {
        this.direction = "left";
      }
    }
  };

  detectCollision = (p, JumpStatus, duckStatus) => {
    if ((p.pos[2] - 1 - this.pos[2]) * (p.pos[2] + 1 - this.pos[2]) < 0) {
      if (JumpStatus === true || duckStatus === true) {
        return false;
      }
      else if (p.pos[0] - 1 < this.pos[0] + 2.5 || p.pos[0] + 1 > this.pos[0] - 2.5) {
        return true;
      }

      return false;
    }
    return false;
  };
}
