export default class FrameBuffer {
  constructor(gl) {
    this.gl = gl;

    this.width = 0;
    this.height = 0;

    this.fb = gl.createFramebuffer();
    this.renderBuffer = gl.createTexture();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);

    this.depthBuffer = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);

    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffer);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderBuffer, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  bind(clear = true) {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.clearColor(0, 0, 0, 0);
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, this.width, this.height);
    clear && gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  unbind() {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  setSize(width, height, scale = 1) {
    const gl = this.gl;

    width = Math.round(width * scale);
    height = Math.round(height * scale);

    this.width = width;
    this.height = height;

    gl.bindTexture(gl.TEXTURE_2D, this.renderBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    return this;
  }
}