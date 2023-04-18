// #extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec2 fragTexCoord;
varying float fragLight;
varying float fogVal;
varying vec4 pos;

uniform sampler2D sampler;

void main() {
  vec4 fragColor = texture2D(sampler, fragTexCoord);

  if(fragColor.a < 0.5) {
    discard;
  }

  float depthRanged = ((pos.z / pos.w + 1.0) * 0.5) * 65535.0;

  float mIvs = 0.00392156862745098;//1.0 / 255.0;
  float z1 = floor(depthRanged * mIvs);
  float z2 = floor(depthRanged - z1 * 255.0);

  gl_FragColor = vec4(z1 * mIvs, z2 * mIvs, 1.0, 1.0);
}