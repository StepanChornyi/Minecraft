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
  // float mipmapLevel = mip_map_level(fragTexCoord * 256.0);

  vec4 fragColor = texture2D(sampler, fragTexCoord);

  if(fragColor.w < 0.5) {
    discard;
  }
  // if(mipmapLevel > 0.5) {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // } else {
  vec3 fogColor = vec3(0.69, 0.82, 0.96);

  gl_FragColor = vec4((fragColor.xyz * fragLight) * (1.0 - fogVal) + fogColor * fogVal, 1.0);
  // }
}