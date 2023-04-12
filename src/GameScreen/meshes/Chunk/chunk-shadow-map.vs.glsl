precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute float faceLight;
attribute float blockIndex;

varying vec2 fragTexCoord;
varying float fragLight;
varying float fogVal;
varying vec4 pos;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

uniform float hightLightIndex;

void main() {
  fragLight = faceLight;

  if(hightLightIndex == blockIndex) {
    fragLight *= 1.3;
  }

  vec4 vert = mProj * mView * mWorld * vec4(vertPosition, 1.0);

  // float dist = length(vert.xyz);

  fogVal = 0.0;//clamp(-0.8 + (dist - 100.0) / 20.0, 0.0, 1.0);

  pos = vert;

  fragTexCoord = vertTexCoord;

  gl_Position = vert;
}