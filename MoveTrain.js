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
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    image.crossOrigin = "anonymous";
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
    image.crossOrigin = "anonymous";
    image.src = url;

    return texture;

}


let MoveTrain = class {
  constructor(gl, pos) {
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    this.positions = [
      // Front face
      -2.5, -1.0, 15.0,
      2.5, -1.0, 15.0,
      2.5, 15.0, 15.0,
      -2.5, 15.0, 15.0,
      //Back Face
      -2.5, -1.0, -15.0,
      2.5, -1.0, -15.0,
      2.5, 15.0, -15.0,
      -2.5, 15.0, -15.0,
      //Top Face
      -2.5, 15.0, -15.0,
      2.5, 15.0, -15.0,
      2.5, 15.0, 15.0,
      -2.5, 15.0, 15.0,
      //Bottom Face
      -2.5, -1.0, -15.0,
      2.5, -1.0, -15.0,
      2.5, -1.0, 15.0,
      -2.5, -1.0, 15.0,
      //Left Face
      -2.5, -1.0, -15.0,
      -2.5, 15.0, -15.0,
      -2.5, 15.0, 15.0,
      -2.5, -1.0, 15.0,
      //Right Face
      2.5, -1.0, -15.0,
      2.5, 15.0, -15.0,
      2.5, 15.0, 15.0,
      2.5, -1.0, 15.0,
    ];

    this.pos = pos;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    const indices = [
        0, 1, 2,    0, 2, 3, // front
        4, 5, 6,    4, 6, 7,
        8, 9, 10,   8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];

    // Now send the element array to GL

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    this.FrontTexture = getTexture(gl, './TrainFront.png');
    this.SideTexture = getTexture(gl, './TrainSide.jpg');

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = [
        //Front
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        //Back
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        //Top
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        //Bottom
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        //Left
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        //Right
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    this.buffer = {
        position: this.positionBuffer,
        // color: colorBuffer,
        indices: indexBuffer,
        textureCoord: textureCoordBuffer,
    };
  }

  drawTurn = (gl, projectionMatrix, shaderProgram) => {
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

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.SideTexture);
    gl.uniform1i(this.programInfo1.uniformLocations.uSampler, 1);
    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.FrontTexture);
    gl.uniform1i(this.programInfo1.uniformLocations.uSampler, 0);
    {
        const vertexCount = 12;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  };

  tick = () => {
    this.pos[2] += 1;
  }

  detectCollision = (p) => {
    if ((this.pos[2] + 15 - (p.pos[2] - 1)) * (this.pos[2] - 15 - (p.pos[2] - 1)) < 0 && ((p.pos[1] - 1) < (this.pos[1] + 15)) && (this.pos[0] === p.pos[0])) {
      return true;
    }
    else {
      return false;
    }
  }
};
