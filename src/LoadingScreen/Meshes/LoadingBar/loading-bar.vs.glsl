precision mediump float;

attribute vec4 vertPosition;
attribute vec3 vertColor;

uniform mat4 mWorld;
uniform mat4 mProj;
uniform float loadProgress;

varying vec3 fragColor;

void main() {
  fragColor = vertColor;
  gl_Position = mProj * mWorld * vec4(
    vertPosition.w + ( vertPosition.x-vertPosition.w)*loadProgress,
    vertPosition.yz, 1.0);
}