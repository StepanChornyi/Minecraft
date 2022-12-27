precision mediump float;

varying vec2 fragTexCoord;

uniform sampler2D sampler;

void main() {
  gl_FragColor = vec4(texture2D(sampler, fragTexCoord).xyz * 0.3, 1);
}