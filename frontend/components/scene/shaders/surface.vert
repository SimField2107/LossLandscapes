varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;
varying vec3 vViewPosition;

uniform sampler2D uHeightMap;
uniform sampler2D uHeightMapB;
uniform float uHeightScale;
uniform float uMorph;

void main() {
  vUv = uv;
  
  // Sample height from both textures and interpolate
  float heightA = texture2D(uHeightMap, uv).r;
  float heightB = texture2D(uHeightMapB, uv).r;
  float height = mix(heightA, heightB, uMorph);
  
  vHeight = height;
  
  // Displace vertex position
  vec3 newPosition = position;
  newPosition.y = height * uHeightScale;
  
  // Calculate normal from neighboring samples
  float delta = 1.0 / 51.0; // Assuming 51x51 grid
  float heightL = mix(
    texture2D(uHeightMap, uv - vec2(delta, 0.0)).r,
    texture2D(uHeightMapB, uv - vec2(delta, 0.0)).r,
    uMorph
  );
  float heightR = mix(
    texture2D(uHeightMap, uv + vec2(delta, 0.0)).r,
    texture2D(uHeightMapB, uv + vec2(delta, 0.0)).r,
    uMorph
  );
  float heightD = mix(
    texture2D(uHeightMap, uv - vec2(0.0, delta)).r,
    texture2D(uHeightMapB, uv - vec2(0.0, delta)).r,
    uMorph
  );
  float heightU = mix(
    texture2D(uHeightMap, uv + vec2(0.0, delta)).r,
    texture2D(uHeightMapB, uv + vec2(0.0, delta)).r,
    uMorph
  );
  
  vec3 calcNormal = normalize(vec3(
    (heightL - heightR) * uHeightScale,
    2.0 * delta,
    (heightD - heightU) * uHeightScale
  ));
  
  vNormal = normalMatrix * calcNormal;
  vPosition = newPosition;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
