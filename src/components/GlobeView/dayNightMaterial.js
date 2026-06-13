import { CanvasTexture, MeshPhongMaterial, ShaderMaterial, TextureLoader, Vector2 } from 'three'

const DAY_TEXTURES = [
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg',
  'https://unpkg.com/three-globe/example/img/earth-day.jpg',
]
const NIGHT_TEXTURES = [
  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
  'https://unpkg.com/three-globe/example/img/earth-night.jpg',
]

const dayNightShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define PI 3.141592653589793

    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec2 sunPosition;
    uniform vec2 globeRotation;

    varying vec3 vNormal;
    varying vec2 vUv;

    float toRad(in float angle) {
      return angle * PI / 180.0;
    }

    vec3 polarToCartesian(in vec2 coordinates) {
      float theta = toRad(90.0 - coordinates.x);
      float phi = toRad(90.0 - coordinates.y);

      return vec3(
        sin(phi) * cos(theta),
        cos(phi),
        sin(phi) * sin(theta)
      );
    }

    void main() {
      float invLon = toRad(globeRotation.x);
      float invLat = -toRad(globeRotation.y);

      mat3 rotX = mat3(
        1, 0, 0,
        0, cos(invLat), -sin(invLat),
        0, sin(invLat), cos(invLat)
      );

      mat3 rotY = mat3(
        cos(invLon), 0, sin(invLon),
        0, 1, 0,
        -sin(invLon), 0, cos(invLon)
      );

      vec3 rotatedSunDirection = rotX * rotY * polarToCartesian(sunPosition);
      float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);
      float blendFactor = smoothstep(-0.12, 0.12, intensity);

      gl_FragColor = mix(nightColor, dayColor, blendFactor);
    }
  `,
}

function dayOfYearUtc(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

  return Math.floor((current - start) / 86400000)
}

export function sunPositionAt(date = new Date()) {
  const dayOfYear = dayOfYearUtc(date)
  const minutesUtc = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  const fractionalHour = minutesUtc / 60
  const gamma = (2 * Math.PI) / 365 * (dayOfYear - 1 + (fractionalHour - 12) / 24)

  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))

  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)

  const longitude = (720 - minutesUtc - equationOfTime) / 4
  const latitude = (declination * 180) / Math.PI

  return [longitude, latitude]
}

function loadTexture(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject)
  })
}

async function loadTextureFromSources(loader, sources) {
  for (const source of sources) {
    try {
      return await loadTexture(loader, source)
    } catch {
      // Try the next mirror before falling back to a local procedural texture.
    }
  }

  return null
}

function drawLand(ctx, points, scaleX, scaleY) {
  ctx.beginPath()
  points.forEach(([x, y], index) => {
    const px = x * scaleX
    const py = y * scaleY

    if (index === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  })
  ctx.closePath()
  ctx.fill()
}

function createProceduralEarthTexture({ night = false } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const scaleX = canvas.width / 1024
  const scaleY = canvas.height / 512
  const ocean = ctx.createLinearGradient(0, 0, 0, canvas.height)

  ocean.addColorStop(0, night ? '#061225' : '#0b3f82')
  ocean.addColorStop(0.5, night ? '#071b33' : '#0d5fa8')
  ocean.addColorStop(1, night ? '#020817' : '#082f63')
  ctx.fillStyle = ocean
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = night ? 'rgba(31, 79, 70, 0.6)' : '#2f7d4f'
  drawLand(ctx, [[195, 130], [265, 95], [335, 132], [325, 230], [270, 292], [205, 245]], scaleX, scaleY)
  drawLand(ctx, [[315, 250], [390, 270], [410, 390], [365, 460], [318, 386], [295, 300]], scaleX, scaleY)
  drawLand(ctx, [[470, 118], [575, 92], [675, 140], [650, 235], [535, 250], [455, 205]], scaleX, scaleY)
  drawLand(ctx, [[610, 210], [705, 230], [735, 330], [655, 395], [575, 340]], scaleX, scaleY)
  drawLand(ctx, [[705, 120], [825, 105], [910, 185], [870, 265], [750, 240]], scaleX, scaleY)
  drawLand(ctx, [[805, 330], [888, 320], [930, 380], [875, 430], [795, 395]], scaleX, scaleY)

  ctx.fillStyle = night ? 'rgba(148, 163, 184, 0.45)' : 'rgba(226, 232, 240, 0.75)'
  ctx.fillRect(0, 0, canvas.width, 28 * scaleY)
  ctx.fillRect(0, canvas.height - 34 * scaleY, canvas.width, 34 * scaleY)

  if (night) {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.55)'
    for (let index = 0; index < 180; index += 1) {
      const x = ((index * 97) % 1024) * scaleX
      const y = (80 + ((index * 53) % 330)) * scaleY
      ctx.fillRect(x, y, 1.2, 1.2)
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export async function createDayNightMaterial() {
  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous')

  const [loadedDayTexture, loadedNightTexture] = await Promise.all([
    loadTextureFromSources(loader, DAY_TEXTURES),
    loadTextureFromSources(loader, NIGHT_TEXTURES),
  ])
  const dayTexture = loadedDayTexture || createProceduralEarthTexture()
  const nightTexture = loadedNightTexture || createProceduralEarthTexture({ night: true })

  const material = new ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunPosition: { value: new Vector2(...sunPositionAt(new Date())) },
      globeRotation: { value: new Vector2() },
    },
    vertexShader: dayNightShader.vertexShader,
    fragmentShader: dayNightShader.fragmentShader,
  })

  return material
}

export function createFallbackGlobeMaterial() {
  return new MeshPhongMaterial({
    map: createProceduralEarthTexture(),
    emissive: '#020617',
    shininess: 8,
  })
}
