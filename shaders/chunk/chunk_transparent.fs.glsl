// #extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec2 fragTexCoord;
varying float fragLight;
varying float fogVal;

uniform sampler2D sampler;

// float mip_map_level(in vec2 texture_coordinate) {
//   vec2 dx_vtc = dFdx(texture_coordinate);
//   vec2 dy_vtc = dFdy(texture_coordinate);
//   float delta_max_sqr = max(dot(dx_vtc, dx_vtc), dot(dy_vtc, dy_vtc));
//   return 0.5 * log2(delta_max_sqr);
// }

void main() {
  vec4 col = texture2D(sampler, fragTexCoord);

  gl_FragColor = vec4(col.xyz * fragLight, col.w);
  // }
}