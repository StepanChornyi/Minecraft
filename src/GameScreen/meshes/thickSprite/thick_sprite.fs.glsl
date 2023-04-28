precision mediump float;

varying vec2 uv;
varying float fragLight;

uniform sampler2D sampler;

void main() {
  vec4 color = texture2D(sampler, uv);

  if(color.w < 0.5) {
    discard;
  }

  gl_FragColor = vec4(color.xyz, 1.0);
}