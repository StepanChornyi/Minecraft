precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertUv;
attribute float qq;

varying vec2 uv;
varying float fragLight;
varying float qqf;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  uv = vertUv;
  qqf = qq;

  gl_Position =  mProj * mView * mWorld * vec4(vertPosition, 1.0);
}