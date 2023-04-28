precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertUv;

varying vec2 uv;
varying float fragLight;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  uv = vertUv;

  gl_Position =  mProj * mView * mWorld * vec4(vertPosition, 1.0);
}