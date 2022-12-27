precision mediump float;

attribute vec3 vertPosition;

uniform mat4 mProj;

void main() {
  gl_Position = mProj * vec4(vertPosition.xyz, 1.0);
}