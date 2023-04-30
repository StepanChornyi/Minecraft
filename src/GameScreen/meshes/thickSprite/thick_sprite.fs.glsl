precision mediump float;

varying vec2 uv;
varying float fragLight;
varying float qqf;

uniform sampler2D sampler;

void main() {
  vec4 color = texture2D(sampler, uv);

  // if(qqf> 1.0){
  //     gl_FragColor = vec4(vec3(0.9, 0.0, 0.0), 0.3);

  //   return;
  // }


  if(color.w < 0.1) {
    gl_FragColor = vec4(vec3(0.0), 0.3);

    discard;
  }

  gl_FragColor = vec4(color.xyz*qqf, 1.0);
}