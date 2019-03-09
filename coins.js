/// <reference path="webgl.d.ts" />
function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}


function getTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;

}

let coin = class {
  constructor(gl, pos) {
    this.pos = pos;

    this.texture = getTexture(gl, "./Coin.png");
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    this.positions = [
      -1, -1, 0,
      -1, 1, 0,
      1, -1, 0,
      1, 1, 0,
    ];

    this.rotation = 0;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions),gl.STATIC_DRAW);

    this.faceColors = [];

    this.faceColors.push([255, 255, 0, 1]);

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

    var indices = [
      0, 1, 2,  1, 2, 3,
    ];


    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
          gl.STATIC_DRAW);

    this.rotationspeed = Math.random() / 4;

    this.buffer = {
      position: this.positionBuffer,
      indices: indexBuffer,
      textureCoord: textureCoordBuffer,
    };

  }

  drawCoin = (gl, projectionMatrix, shaderProgram) => {
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
    gl.uniform1i(this.programInfo1.uniformLocations.uSampler, 0);

    {
      const vertexCount = 6;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

  };

  detectCollision = (p) => {
    var flag1 = false,
        flag2 = false;
    if ((p.pos[2] + 1 - this.pos[2]) * (p.pos[2] - 1 - this.pos[2]) < 0) {
      flag1 = true;
    }

    if ((p.pos[1] + 2 - this.pos[1]) * (p.pos[1] - 1 - this.pos[1]) < 0) {
      flag2 = true;
    }

    if (flag1 === true && flag2 === true && p.pos[1] == this.pos[1]) {
      return true;
    }
    else {
      return false;
    }

  };
};
