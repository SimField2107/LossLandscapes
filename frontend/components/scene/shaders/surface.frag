varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;
varying vec3 vViewPosition;

uniform vec3 uColorLow;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform float uFresnelPower;
uniform float uRimIntensity;
uniform vec3 uRimColor;
uniform int uColorMode;
uniform sampler2D uGradientMap;
uniform float uMorph;

// Viridis colormap approximation
vec3 viridis(float t) {
  const vec3 c0 = vec3(0.2777, 0.0054, 0.3340);
  const vec3 c1 = vec3(0.1050, 0.6388, 0.7267);
  const vec3 c2 = vec3(-0.3308, 0.2148, 0.0942);
  const vec3 c3 = vec3(-4.6342, -5.7991, -19.3324);
  const vec3 c4 = vec3(6.2282, 14.1799, 56.6905);
  const vec3 c5 = vec3(4.7763, -13.7451, -65.3530);
  const vec3 c6 = vec3(-5.4354, 4.6456, 26.3124);
  
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * (c5 + t * c6)))));
}

// Magma colormap approximation
vec3 magma(float t) {
  const vec3 c0 = vec3(0.0002, 0.0004, 0.0139);
  const vec3 c1 = vec3(0.1162, 0.1006, 0.5178);
  const vec3 c2 = vec3(1.0504, -0.0843, 0.5279);
  const vec3 c3 = vec3(-1.0426, 0.9557, -1.9666);
  const vec3 c4 = vec3(0.1744, 0.0034, 2.4815);
  const vec3 c5 = vec3(0.9263, -0.4675, -0.6868);
  
  return c0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * c5))));
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Base color from height using Viridis colormap
  float heightNorm = clamp(vHeight, 0.0, 1.0);
  vec3 baseColor;
  
  if (uColorMode == 0) {
    // Loss-based coloring (Viridis)
    baseColor = viridis(heightNorm);
  } else {
    // Gradient magnitude coloring (Magma)
    float gradMag = texture2D(uGradientMap, vUv).r;
    baseColor = magma(clamp(gradMag, 0.0, 1.0));
  }
  
  // Simple diffuse lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float diffuse = max(dot(normal, lightDir), 0.0);
  diffuse = diffuse * 0.6 + 0.4; // Add ambient
  
  // Specular highlight
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
  
  // Fresnel rim lighting
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uFresnelPower);
  vec3 rimLight = uRimColor * fresnel * uRimIntensity;
  
  // Combine
  vec3 color = baseColor * diffuse;
  color += vec3(1.0) * specular * 0.3;
  color += rimLight;
  
  // Subtle edge glow for peaks
  if (heightNorm > 0.7) {
    float glowIntensity = (heightNorm - 0.7) / 0.3;
    color += vec3(0.4, 0.5, 1.0) * glowIntensity * 0.2;
  }
  
  gl_FragColor = vec4(color, 1.0);
}
