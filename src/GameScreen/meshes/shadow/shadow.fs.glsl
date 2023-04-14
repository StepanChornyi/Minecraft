precision mediump float;

varying vec2 texCoord;
// varying vec3 viewPos;

// uniform mat4 mProjIvs;

uniform sampler2D shadowMap;

void main() {
  vec2 offset = (gl_PointCoord * 2.0 - 1.0) ;
  vec4 color = texture2D(shadowMap, vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y));

  gl_FragColor = vec4(color.xyz * 0.5, 1.0);
}