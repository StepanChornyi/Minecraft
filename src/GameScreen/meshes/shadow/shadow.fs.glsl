precision mediump float;

varying vec2 texCoord;
varying vec2 offsetFactor;
varying vec3 viewPos;
// varying vec3 viewPos;

uniform mat4 mProjIvs;

uniform sampler2D shadowMap;

void main() {

  vec2 coord = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y) * 2.0 - 1.0;

  coord = texCoord + coord * offsetFactor;

  vec2 textureCoord = (coord + 1.0) * 0.5;

  vec4 color = texture2D(shadowMap, textureCoord);

  float z = (color.r * 255.0 * 255.0 + color.g * 255.0) / 65535.0;

  vec4 mapData = (mProjIvs * vec4(coord.xy, (z * 2.0) - 1.0, 1.0));
  vec3 mapPos = mapData.xyz / mapData.w;

  if(distance(mapPos, viewPos) < 0.25) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.3);

    return;
  }
  discard;
  // gl_FragColor = vec4(0.0, 0.0, 0.0 ,  0.2);
}