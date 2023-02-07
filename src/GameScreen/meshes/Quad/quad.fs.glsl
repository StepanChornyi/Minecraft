precision mediump float;

varying vec2 texCoord;

uniform sampler2D sampler;

void main() {
  gl_FragColor = vec4(texture2D(sampler, texCoord).xyz, 1.0);
}