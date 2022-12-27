let gl = null;

export default class Mesh {
  constructor(gl_context, program, config) {
    gl = gl_context;

    this.program = program;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    this.vertices = [];
    this.indices = [];

    this.attributes = [];
    this.uniforms = {};

    for (const key in config.attributes) {
      if (!Object.hasOwnProperty.call(config.attributes, key))
        continue;

      const attribData = { ...config.attributes[key] };

      attribData.name = key;
      attribData.location = gl.getAttribLocation(program, key);

      this.attributes.push(attribData)
    }

    for (const key in config.uniforms) {
      if (!Object.hasOwnProperty.call(config.uniforms, key))
        continue;

      this.uniforms[key] = {
        name: key,
        location: gl.getUniformLocation(program, key)
      }
    }
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);///----------TODO gl.DYNAMIC_DRAW
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  updateAttribPointers() {
    this.bindIndexBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    for (let i = 0, attrib; i < this.attributes.length; i++) {
      attrib = this.attributes[i];

      // if (!attrib.type && attrib.type !== gl.FLOAT) { ----------TODO 
      //   console.warn("TODO: not float attrib type");
      // }

      gl.vertexAttribPointer(
        attrib.location,
        attrib.size,
        attrib.type || gl.FLOAT,
        attrib.normalized || gl.FALSE,
        attrib.stride * Float32Array.BYTES_PER_ELEMENT,
        attrib.offset * Float32Array.BYTES_PER_ELEMENT,
      );

      gl.enableVertexAttribArray(attrib.location);
    }
  }

  bindIndexBuffer() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  render(camera, count = this.indices.length, offset = 0) {
    gl.useProgram(this.program);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(this.uniforms.mWorld.location, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(this.uniforms.mView.location, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(this.uniforms.mProj.location, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
  }
}