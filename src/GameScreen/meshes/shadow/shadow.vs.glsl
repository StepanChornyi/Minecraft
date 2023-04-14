precision mediump float;

attribute vec3 vertPosition;
attribute float pointSize;

uniform mat4 mView;
uniform mat4 mProj;

varying vec2 texCoord;

// varying vec3 viewPos;

void main() {
  vec4 view = mView * vec4(vertPosition, 1.0);

  // viewPos = view.xyz;

  gl_Position = mProj * view;
  gl_PointSize = pointSize / (gl_Position.z);

  texCoord = ((gl_Position.xy / gl_Position.w) + 1.0) * 0.8;

  // if(gl_Position.z < 0.1) {
  //   gl_PointSize = 0.0;
  // }
}