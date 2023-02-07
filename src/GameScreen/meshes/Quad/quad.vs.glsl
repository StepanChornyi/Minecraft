precision mediump float;

attribute vec2 vertPosition;

varying vec2 texCoord;

void main() {
  texCoord = vertPosition.xy * 0.5 + 0.5;

  gl_Position = vec4(vertPosition.xy, 0.5, 1.0);
}