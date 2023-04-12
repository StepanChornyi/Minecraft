// #extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec2 fragTexCoord;
varying float fragLight;
varying float fogVal;
varying vec4 pos;

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

  // float x = pos.x;

  // if(x > 1.0) {
  //   x = 0.0;
  // } else if(x < 0.0) {
  //   x = 1.0;
  // }

  // float y = pos.y;

  // if(y > 1.0) {
  //   y = 0.0;
  // } else if(y < 0.0) {
  //   y = 1.0;
  // }

  // float z = pos.z;

  // if(z > 1.0) {
  //   z = 0.0;
  // } else if(z < 0.0) {
  //   z = 1.0;
  // }

  vec3 col = (pos.xyz / pos.w + 1.0) * 0.5 * fragLight;

  // gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * fragLight, 1.0);
  gl_FragColor = vec4(col, 1.0);
  // }
}