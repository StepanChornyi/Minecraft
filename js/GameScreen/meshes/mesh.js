import Object3D from './../object3D';

let gl = null;

export default class Mesh extends Object3D {
  constructor(gl_context, program) {
    super();

    gl = gl_context;

    this.program = program;
    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    this.vertices = [];
    this.indices = [];
  }

  drawBuffersData() {
    gl.useProgram(this.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  updateAttribPointers() {
    this.bindIndexBuffer();
  }

  bindIndexBuffer() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  render(camera, count = this.indices.length, offset = 0) {
    gl.useProgram(this.program);

    this.updateAttribPointers();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const matWorldUniformLocation = gl.getUniformLocation(this.program, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(this.program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(this.program, 'mProj');

    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, camera.projectionMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, camera.viewMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, this.transformMatrix);

    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
  }
}