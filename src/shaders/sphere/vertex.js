const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;

void main(void) {
  vec4 worldPosition = modelMatrix * vec4(position.xyz, 1.0);
  vec4 modelViewPosition = viewMatrix * worldPosition;
  vec4 modelViewProjectionPosition = projectionMatrix * modelViewPosition;
  gl_Position = modelViewProjectionPosition;
    
  vUv = uv;
  vPos = position;

  // gl_Position = modelViewProjectionPosition;
}
`

export default vertexShader