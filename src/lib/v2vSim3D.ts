import * as THREE from 'three';

export type CameraMode = 'chase' | 'cockpit' | 'drone';

export interface SimOptions3D {
  lanes: number;
  density: number;
  v2v: boolean;
  ramp: boolean;
  heatmap: boolean;
  speed: number;
  cameraMode: CameraMode;
  rideActive?: boolean;
}

export interface RideChapterInfo {
  index: number;
  timeRange: [number, number];
  title: string;
  tagline: string;
  action: string;
  statusType: 'normal' | 'warning' | 'negotiation' | 'success';
}

export const RIDE_CHAPTERS: RideChapterInfo[] = [
  {
    index: 1,
    timeRange: [0, 6],
    title: 'Mesh Discovery',
    tagline: 'Multi-Vehicle Decentralized Network',
    action: 'Cruising at 96 km/h. Sub-50ms peer mesh active across 3 lanes.',
    statusType: 'normal',
  },
  {
    index: 2,
    timeRange: [6, 12],
    title: 'Blindspot Hazard Broadcast',
    tagline: 'Emergency Warning 160m Ahead',
    action: 'Stalled vehicle ahead in Lane 2! V2V intent packet alerts Ego unit instantly.',
    statusType: 'warning',
  },
  {
    index: 3,
    timeRange: [12, 18],
    title: '38ms Gap Negotiation',
    tagline: 'Cross-Vehicle Speed Coordination',
    action: 'Ego requests Lane 1 gap. Peer vehicle yields throttle: gap opened in 34ms.',
    statusType: 'negotiation',
  },
  {
    index: 4,
    timeRange: [18, 24],
    title: '7D High-Speed Zip Merge',
    tagline: 'Dynamic Banking & Hazard Clearance',
    action: 'Chassis banks into Lane 1. Safe clearance without slamming brakes.',
    statusType: 'success',
  },
  {
    index: 5,
    timeRange: [24, 30],
    title: 'Platoon Harmony',
    tagline: 'Zero Phantom Jams Restored',
    action: 'Platoon glides in aerodynamic synchronization. 0 conflicts recorded.',
    statusType: 'normal',
  },
];

export interface SimTelemetry {
  vehicles: number;
  links: number;
  conflicts: number;
  latency: number;
  flow: number;
  egoSpeed: number;
  egoIntent: string;
  activeNegotiation: string | null;
  rideActive: boolean;
  rideProgress: number; // 0..1
  currentChapter: RideChapterInfo;
  egoSteer?: number; // Steering wheel degrees for realistic cockpit view
}

export interface SimCar3D {
  id: string;
  x: number;
  z: number;
  v: number;
  vDesired: number;
  lane: number;
  targetLane: number;
  laneProgress: number;
  changing: boolean;
  yieldT: number;
  intent: string;
  color: number;
  isEgo: boolean;
  isHazard?: boolean;
  isRamp: boolean;
  rampMerged: boolean;
  meshGroup: THREE.Group;
  cabinGroup?: THREE.Group;
  wheelMeshes?: THREE.Mesh[];
  steerAngle?: number;
  perceptionRing?: THREE.Mesh;
  brakeLightMesh?: THREE.Mesh;
  hazardBlinkerMesh?: THREE.Mesh;
  hudSprite?: THREE.Sprite;
}

const ROAD_LENGTH = 360;
const LANE_WIDTH = 3.8;
const V2V_RADIUS = 36;

export class V2VSimEngine3D {
  container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  opts: SimOptions3D;

  cars: SimCar3D[] = [];
  roadGroup: THREE.Group;
  streetLampsGroup: THREE.Group;
  skylineGroup: THREE.Group;
  linksLineSegments: THREE.LineSegments;
  packetsPoints: THREE.Points;
  speedStreaks: THREE.LineSegments;
  gantriesGroup: THREE.Group;
  trajectoryLine: THREE.Line;
  trajectoryLine2: THREE.Line;

  carBodyGeo: THREE.BufferGeometry;
  carCabinGeo: THREE.BufferGeometry;
  wheelGeo: THREE.BufferGeometry;
  perceptionRingGeo: THREE.PlaneGeometry;
  perceptionRingMat: THREE.MeshBasicMaterial;

  beamGeo: THREE.PlaneGeometry;
  beamMat: THREE.MeshBasicMaterial;
  tailReflectGeo: THREE.PlaneGeometry;
  tailReflectMat: THREE.MeshBasicMaterial;
  underglowGeo: THREE.PlaneGeometry;
  underglowMat: THREE.MeshBasicMaterial;

  roadMat: THREE.MeshStandardMaterial;

  packetPositions: Float32Array;
  packetColors: Float32Array;
  packetGeo: THREE.BufferGeometry;

  linkPositions: Float32Array;
  linkColors: Float32Array;
  linkGeo: THREE.BufferGeometry;

  streakPositions: Float32Array;
  streakGeo: THREE.BufferGeometry;

  rafId = 0;
  lastTime = 0;
  accumTime = 0;
  fixedDt = 1 / 60;
  isRunning = false;
  time = 0;
  seq = 0;

  // 7D Ride State
  rideActive = true;
  rideTime = 0;
  rideDuration = 30; // 30s scripted loop
  currentChapter: RideChapterInfo = RIDE_CHAPTERS[0];
  lastPlayedChapter = 0;

  // 7D Camera Physics with banking & dynamic FOV
  camTargetPos = new THREE.Vector3();
  camTargetLook = new THREE.Vector3();
  camCurrentLook = new THREE.Vector3();
  targetFov = 52;
  currentRoll = 0;
  targetRoll = 0;

  // Automotive forward headlights
  egoHeadlightSpot?: THREE.SpotLight;
  egoHeadlightTarget?: THREE.Object3D;

  onTelemetry?: (stats: SimTelemetry) => void;

  constructor(container: HTMLElement, opts: SimOptions3D, onTelemetry?: (stats: SimTelemetry) => void) {
    this.container = container;
    this.opts = { ...opts };
    this.rideActive = opts.rideActive !== undefined ? opts.rideActive : true;
    this.onTelemetry = onTelemetry;

    this.scene = new THREE.Scene();
    // Realistic Daylight Highway Sky and Atmosphere
    this.scene.background = new THREE.Color(0x60a5fa);
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0022);

    const aspect = (container.clientWidth || 1000) / (container.clientHeight || 470);
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.2, 500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    container.appendChild(this.renderer.domElement);

    this.carBodyGeo = this.createCarBodyGeometry();
    this.carCabinGeo = this.createCarCabinGeometry();
    this.wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    this.wheelGeo.rotateZ(Math.PI / 2);

    this.perceptionRingGeo = new THREE.PlaneGeometry(28, 28);
    this.perceptionRingGeo.rotateX(-Math.PI / 2);

    const radarTexture = this.createPerceptionTexture();
    this.perceptionRingMat = new THREE.MeshBasicMaterial({
      map: radarTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const beamTex = this.createHeadlightBeamTexture();
    this.beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.beamGeo = new THREE.PlaneGeometry(3.6, 18);
    this.beamGeo.rotateX(-Math.PI / 2);
    this.beamGeo.translate(0, 0, 10.5);

    const tailReflectTex = this.createTailReflectTexture();
    this.tailReflectMat = new THREE.MeshBasicMaterial({
      map: tailReflectTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.tailReflectGeo = new THREE.PlaneGeometry(3.6, 5.0);
    this.tailReflectGeo.rotateX(-Math.PI / 2);

    const underglowTex = this.createUnderglowTexture();
    this.underglowMat = new THREE.MeshBasicMaterial({
      map: underglowTex,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.underglowGeo = new THREE.PlaneGeometry(4.2, 6.2);
    this.underglowGeo.rotateX(-Math.PI / 2);

    // Realistic daylight paved charcoal asphalt highway
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.65,
      metalness: 0.12,
    });

    // Realistic bright sunny daylight illumination
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x475569, 1.6);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffdf5, 3.2);
    sunLight.position.set(50, 90, 40);
    this.scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    this.scene.add(ambientLight);

    this.roadGroup = new THREE.Group();
    this.scene.add(this.roadGroup);

    this.streetLampsGroup = new THREE.Group();
    this.scene.add(this.streetLampsGroup);

    this.skylineGroup = new THREE.Group();
    this.scene.add(this.skylineGroup);

    this.gantriesGroup = new THREE.Group();
    this.scene.add(this.gantriesGroup);

    // V2V Mesh Links
    const MAX_LINKS = 160;
    this.linkPositions = new Float32Array(MAX_LINKS * 2 * 3);
    this.linkColors = new Float32Array(MAX_LINKS * 2 * 3);
    this.linkGeo = new THREE.BufferGeometry();
    this.linkGeo.setAttribute('position', new THREE.BufferAttribute(this.linkPositions, 3));
    this.linkGeo.setAttribute('color', new THREE.BufferAttribute(this.linkColors, 3));

    const linkMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.linksLineSegments = new THREE.LineSegments(this.linkGeo, linkMat);
    this.scene.add(this.linksLineSegments);

    // Traveling Data Packets
    const MAX_PACKETS = 160;
    this.packetPositions = new Float32Array(MAX_PACKETS * 3);
    this.packetColors = new Float32Array(MAX_PACKETS * 3);
    this.packetGeo = new THREE.BufferGeometry();
    this.packetGeo.setAttribute('position', new THREE.BufferAttribute(this.packetPositions, 3));
    this.packetGeo.setAttribute('color', new THREE.BufferAttribute(this.packetColors, 3));

    const packetTexture = this.createPacketTexture();
    const packetMat = new THREE.PointsMaterial({
      size: 1.6,
      map: packetTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
    this.packetsPoints = new THREE.Points(this.packetGeo, packetMat);
    this.scene.add(this.packetsPoints);

    // 7D Rollercoaster Speed Streaks (optical flow lines)
    const STREAK_COUNT = 160;
    this.streakPositions = new Float32Array(STREAK_COUNT * 2 * 3);
    for (let k = 0; k < STREAK_COUNT; k++) {
      const rx = (Math.random() - 0.5) * 40;
      const ry = 0.5 + Math.random() * 8;
      const rz = Math.random() * ROAD_LENGTH;
      const len = 3 + Math.random() * 6;
      this.streakPositions[k * 6] = rx;
      this.streakPositions[k * 6 + 1] = ry;
      this.streakPositions[k * 6 + 2] = rz;
      this.streakPositions[k * 6 + 3] = rx;
      this.streakPositions[k * 6 + 4] = ry;
      this.streakPositions[k * 6 + 5] = rz + len;
    }
    this.streakGeo = new THREE.BufferGeometry();
    this.streakGeo.setAttribute('position', new THREE.BufferAttribute(this.streakPositions, 3));
    const streakMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    this.speedStreaks = new THREE.LineSegments(this.streakGeo, streakMat);
    this.scene.add(this.speedStreaks);

    // Projected AR Trajectory Ribbons (Dual glowing holographic highway path)
    const trajGeo = new THREE.BufferGeometry();
    const trajGeo2 = new THREE.BufferGeometry();
    const trajMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    this.trajectoryLine = new THREE.Line(trajGeo, trajMat);
    this.trajectoryLine2 = new THREE.Line(trajGeo2, trajMat);
    this.scene.add(this.trajectoryLine);
    this.scene.add(this.trajectoryLine2);

    this.buildRoad();
    this.buildStreetLamps();
    this.buildSkyline();
    this.buildGantries();
    this.reseedTraffic();
  }

  private createCarBodyGeometry(): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const l = 4.4;
    const w = 2.05;
    shape.moveTo(-w / 2 + 0.35, -l / 2);
    shape.lineTo(w / 2 - 0.35, -l / 2);
    shape.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + 0.45);
    shape.lineTo(w / 2, l / 2 - 0.7);
    shape.quadraticCurveTo(w / 2, l / 2, w / 2 - 0.45, l / 2);
    shape.lineTo(-w / 2 + 0.45, l / 2);
    shape.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - 0.7);
    shape.lineTo(-w / 2, -l / 2 + 0.45);
    shape.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + 0.35, -l / 2);

    const extrudeSettings = { depth: 0.75, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.18, bevelThickness: 0.18 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0.45, 0);
    return geo;
  }

  private createCarCabinGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BoxGeometry(1.6, 0.58, 2.35);
    geo.translate(0, 1.0, -0.2);
    return geo;
  }

  private createHeadlightBeamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.25, 'rgba(186, 230, 253, 0.45)');
      grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(88, 0);
      ctx.lineTo(128, 256);
      ctx.lineTo(0, 256);
      ctx.closePath();
      ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createTailReflectTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 30, 60, 0.7)');
      grad.addColorStop(0.35, 'rgba(255, 0, 40, 0.35)');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createUnderglowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 64, 4, 32, 64, 55);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.35, 'rgba(0, 240, 255, 0.7)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createPacketTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(0,240,255,0.95)');
      grad.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }

  private createVehicleTagSprite(title: string, sub: string, color: string, isHazard: boolean): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 68;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.Sprite();
    }

    // Background pill with dark glass effect
    ctx.fillStyle = isHazard ? 'rgba(50, 12, 12, 0.92)' : 'rgba(8, 14, 26, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    const r = 10;
    const x = 4;
    const y = 4;
    const w = 248;
    const h = 60;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pulsing indicator dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(24, 34, 5, 0, Math.PI * 2);
    ctx.fill();

    // Primary Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(title, 38, 30);

    // Subtitle / Telemetry
    ctx.fillStyle = color;
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillText(sub, 38, 51);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4.0, 1.05, 1);
    sprite.position.set(0, 2.25, 0);
    return sprite;
  }

  private createPerceptionTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    const cx = 128;
    const cy = 128;

    // Ambient soft cyan radar aura
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.18)');
    grad.addColorStop(0.9, 'rgba(0, 240, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.fill();

    // 1. Forward Scanning Arc Cone (facing +Z in 3D, which is +Y in canvas: angle PI/2)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 124, Math.PI / 2 - Math.PI / 3.2, Math.PI / 2 + Math.PI / 3.2);
    ctx.closePath();
    const forwardGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 124);
    forwardGrad.addColorStop(0, 'rgba(0, 240, 255, 0.75)');
    forwardGrad.addColorStop(0.65, 'rgba(0, 240, 255, 0.35)');
    forwardGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = forwardGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 2. Rear Blindspot Arc Cone (facing -Z in 3D, which is -Y in canvas: angle -PI/2)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 88, -Math.PI / 2 - Math.PI / 4, -Math.PI / 2 + Math.PI / 4);
    ctx.closePath();
    const rearGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 88);
    rearGrad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
    rearGrad.addColorStop(0.8, 'rgba(0, 240, 255, 0.15)');
    rearGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = rearGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Concentric Range Rings with distance ticks
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 1.8;
    [32, 70, 110].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    return new THREE.CanvasTexture(canvas);
  }

  private buildRoad() {
    while (this.roadGroup.children.length > 0) {
      this.roadGroup.remove(this.roadGroup.children[0]);
    }

    const totalWidth = this.opts.lanes * LANE_WIDTH + 6;

    for (let i = 0; i < 2; i++) {
      const roadGeo = new THREE.PlaneGeometry(totalWidth, ROAD_LENGTH);
      roadGeo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(roadGeo, this.roadMat);
      mesh.position.set(0, 0, i * ROAD_LENGTH);
      this.roadGroup.add(mesh);
    }

    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf8fafc,
      dashSize: 4.5,
      gapSize: 4.5,
      linewidth: 1.5,
    });

    for (let l = 1; l < this.opts.lanes; l++) {
      const laneX = (l - this.opts.lanes / 2) * LANE_WIDTH;
      const points = [
        new THREE.Vector3(laneX, 0.02, -ROAD_LENGTH),
        new THREE.Vector3(laneX, 0.02, ROAD_LENGTH * 2),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      this.roadGroup.add(line);
    }

    const leftEdgeX = (-this.opts.lanes * LANE_WIDTH) / 2;
    const rightEdgeX = (this.opts.lanes * LANE_WIDTH) / 2;
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.85 });

    const leftEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(leftEdgeX, 0.03, -ROAD_LENGTH),
      new THREE.Vector3(leftEdgeX, 0.03, ROAD_LENGTH * 2),
    ]);
    const rightEdgeGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(rightEdgeX, 0.03, -ROAD_LENGTH),
      new THREE.Vector3(rightEdgeX, 0.03, ROAD_LENGTH * 2),
    ]);
    this.roadGroup.add(new THREE.Line(leftEdgeGeo, edgeMat));
    this.roadGroup.add(new THREE.Line(rightEdgeGeo, edgeMat));

    // Highway barrier concrete curb & silver guardrails (matching reference photo)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.2 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.25 });
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9, metalness: 0.05 });

    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, ROAD_LENGTH * 2), curbMat);
    leftCurb.position.set(leftEdgeX - 0.25, 0.2, ROAD_LENGTH / 2);
    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, ROAD_LENGTH * 2), curbMat);
    rightCurb.position.set(rightEdgeX + 0.25, 0.2, ROAD_LENGTH / 2);
    this.roadGroup.add(leftCurb);
    this.roadGroup.add(rightCurb);

    // Silver highway guardrails
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, ROAD_LENGTH * 2), railMat);
    leftRail.position.set(leftEdgeX - 0.75, 0.65, ROAD_LENGTH / 2);
    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, ROAD_LENGTH * 2), railMat);
    rightRail.position.set(rightEdgeX + 0.75, 0.65, ROAD_LENGTH / 2);
    this.roadGroup.add(leftRail);
    this.roadGroup.add(rightRail);

    // Expansive terrain shoulders under daylight
    for (let i = 0; i < 2; i++) {
      const leftShoulderGeo = new THREE.PlaneGeometry(100, ROAD_LENGTH);
      leftShoulderGeo.rotateX(-Math.PI / 2);
      const leftShoulder = new THREE.Mesh(leftShoulderGeo, shoulderMat);
      leftShoulder.position.set(-totalWidth / 2 - 50, -0.05, i * ROAD_LENGTH);
      this.roadGroup.add(leftShoulder);

      const rightShoulderGeo = new THREE.PlaneGeometry(100, ROAD_LENGTH);
      rightShoulderGeo.rotateX(-Math.PI / 2);
      const rightShoulder = new THREE.Mesh(rightShoulderGeo, shoulderMat);
      rightShoulder.position.set(totalWidth / 2 + 50, -0.05, i * ROAD_LENGTH);
      this.roadGroup.add(rightShoulder);
    }
  }

  private buildStreetLamps() {
    while (this.streetLampsGroup.children.length > 0) {
      this.streetLampsGroup.remove(this.streetLampsGroup.children[0]);
    }

    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const reflectorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6);
    const refGeo = new THREE.BoxGeometry(0.09, 0.18, 0.05);

    const leftX = -this.opts.lanes * LANE_WIDTH / 2 - 0.9;
    const rightX = this.opts.lanes * LANE_WIDTH / 2 + 0.9;

    for (let z = 0; z < ROAD_LENGTH; z += 20) {
      // Left Guardrail Reflector Post
      const postL = new THREE.Mesh(postGeo, postMat);
      postL.position.set(leftX, 0.55, z);
      const refL = new THREE.Mesh(refGeo, reflectorMat);
      refL.position.set(leftX + 0.04, 0.95, z);
      this.streetLampsGroup.add(postL);
      this.streetLampsGroup.add(refL);

      // Right Guardrail Reflector Post
      const postR = new THREE.Mesh(postGeo, postMat);
      postR.position.set(rightX, 0.55, z);
      const refR = new THREE.Mesh(refGeo, reflectorMat);
      refR.position.set(rightX - 0.04, 0.95, z);
      this.streetLampsGroup.add(postR);
      this.streetLampsGroup.add(refR);
    }
  }

  private buildSkyline() {
    while (this.skylineGroup.children.length > 0) {
      this.skylineGroup.remove(this.skylineGroup.children[0]);
    }

    // Scenic Highway Roadside: Earthen hills, rock outcrops and pine trees (matching reference photo)
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x968158, roughness: 0.95, metalness: 0.05 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x7c6d56, roughness: 0.9, metalness: 0.1 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9, metalness: 0.1 });
    const pineMat1 = new THREE.MeshStandardMaterial({ color: 0x2e5927, roughness: 0.85, metalness: 0.05 });
    const pineMat2 = new THREE.MeshStandardMaterial({ color: 0x3d6b35, roughness: 0.85, metalness: 0.05 });

    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 2.8, 6);
    const pineCone1 = new THREE.ConeGeometry(2.0, 3.4, 7);
    const pineCone2 = new THREE.ConeGeometry(1.5, 2.8, 7);
    const pineCone3 = new THREE.ConeGeometry(1.0, 2.2, 7);

    const sides = [-1, 1];
    for (const side of sides) {
      // 1. Distant rolling earthen hills & cliffs
      for (let z = 0; z < ROAD_LENGTH; z += 36) {
        const xDist = side * (32 + ((z * 7) % 18));
        const hillH = 14 + ((z * 11) % 18);
        const hillW = 28 + ((z * 5) % 16);

        const hill = new THREE.Mesh(new THREE.ConeGeometry(hillW / 2, hillH, 6), (z % 72 === 0) ? rockMat : hillMat);
        hill.position.set(xDist, hillH / 2 - 1.0, z);
        hill.rotation.y = (z * 0.4) % Math.PI;
        this.skylineGroup.add(hill);
      }

      // 2. Roadside coniferous pine trees along highway guardrail
      for (let z = 0; z < ROAD_LENGTH; z += 12) {
        const offset = ((z * 13) % 9);
        const xDist = side * (10.5 + offset);
        const treeGroup = new THREE.Group();

        // Trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(0, 1.4, 0);
        treeGroup.add(trunk);

        // Foliage tiers
        const pMat = (z % 24 === 0) ? pineMat2 : pineMat1;
        const c1 = new THREE.Mesh(pineCone1, pMat);
        c1.position.set(0, 3.2, 0);
        treeGroup.add(c1);

        const c2 = new THREE.Mesh(pineCone2, pMat);
        c2.position.set(0, 4.6, 0);
        treeGroup.add(c2);

        const c3 = new THREE.Mesh(pineCone3, pMat);
        c3.position.set(0, 5.8, 0);
        treeGroup.add(c3);

        const scale = 0.85 + (((z * 7) % 5) * 0.08);
        treeGroup.scale.set(scale, scale, scale);
        treeGroup.position.set(xDist, 0, z);
        this.skylineGroup.add(treeGroup);
      }
    }
  }

  private buildGantries() {
    while (this.gantriesGroup.children.length > 0) {
      this.gantriesGroup.remove(this.gantriesGroup.children[0]);
    }
  }

  public reseedTraffic() {
    for (const c of this.cars) {
      this.scene.remove(c.meshGroup);
    }
    this.cars = [];
    this.seq = 0;

    // 1. Ego car: Starts in Lane 1 (index 1), z=40
    const ego = this.createCar(1, 40, true, false, false);
    this.cars.push(ego);

    // 2. Peer vehicles in surrounding lanes (visible through windshield like reference image)
    this.cars.push(this.createCar(0, 58, false, false, false)); // 18m ahead left lane
    this.cars.push(this.createCar(2, 64, false, false, false)); // 24m ahead right lane
    this.cars.push(this.createCar(1, 76, false, false, false)); // 36m ahead lead car in ego lane
    this.cars.push(this.createCar(0, 18, false, false, false)); // trailing left lane
    this.cars.push(this.createCar(2, 110, false, false, false));

    // Trailing car in Lane 1 behind Ego
    this.cars.push(this.createCar(1, 10, false, false, false));

    // 3. Stalled Hazard Car in Lane 1 at z=165
    const hazardCar = this.createCar(1, 165, false, false, true);
    hazardCar.v = 0;
    hazardCar.vDesired = 0;
    hazardCar.intent = 'EMERGENCY: Disabled Vehicle';
    this.cars.push(hazardCar);

    // Extra density highway cars spaced out along the 360m highway
    for (let lane = 0; lane < this.opts.lanes; lane++) {
      const laneOffset = lane * 32;
      for (let k = 0; k < Math.min(3, this.opts.density); k++) {
        const z = (195 + k * 52 + laneOffset) % ROAD_LENGTH;
        if (lane === 1 && z > 130 && z < 190) continue;
        this.cars.push(this.createCar(lane, z, false, false, false));
      }
    }

    if (ego) {
      if (this.opts.cameraMode === 'cockpit') {
        this.camTargetPos.set(ego.x - 0.20, 2.05, ego.z + 0.6);
        this.camTargetLook.set(ego.x - 0.05, 0.40, ego.z + 28);
      } else if (this.opts.cameraMode === 'chase') {
        this.camTargetPos.set(ego.x * 0.8, 5.0, ego.z - 11.5);
        this.camTargetLook.set(ego.x * 0.4, 1.2, ego.z + 24);
      } else {
        const totalW = this.opts.lanes * LANE_WIDTH;
        this.camTargetPos.set(-totalW * 1.3 - 4, 16, ego.z - 8);
        this.camTargetLook.set(totalW * 0.2, 0.5, ego.z + 16);
      }
      this.camera.position.copy(this.camTargetPos);
      this.camCurrentLook.copy(this.camTargetLook);
      this.camera.lookAt(this.camCurrentLook);
    }

    if (!this.isRunning && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private createCar(lane: number, z: number, isEgo: boolean, isRamp: boolean, isHazard = false): SimCar3D {
    const group = new THREE.Group();
    const id = isEgo ? 'AEGIS-01' : isHazard ? 'HAZARD-99' : `DRV-${String.fromCharCode(65 + (this.seq % 6))}${((this.seq * 7) % 9) + 1}`;
    this.seq++;

    // Realistic automotive paints: crimson red, electric blue, pearl white, obsidian slate, solar amber, titanium
    const peerColors = [0xdc2626, 0x0284c7, 0xf8fafc, 0x1e293b, 0xeab308, 0x475569];
    const color = isEgo ? 0x0f172a : isHazard ? 0xb91c1c : peerColors[this.seq % peerColors.length];

    // Metallic paint
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.88,
      roughness: 0.22,
    });

    // 1. Lower Chassis (main sculpted sports body)
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.44, 4.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.42, 0);
    group.add(bodyMesh);

    // Front sloping hood wedge (visible in driver seat!)
    const hoodGeo = new THREE.BoxGeometry(1.92, 0.16, 1.35);
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
    hoodMesh.rotation.x = 0.14;
    hoodMesh.position.set(0, 0.52, 1.35);
    group.add(hoodMesh);

    // Front carbon splitter
    const splitterGeo = new THREE.BoxGeometry(1.98, 0.08, 0.35);
    const splitterMat = new THREE.MeshStandardMaterial({ color: 0x090e17, metalness: 0.8, roughness: 0.3 });
    const splitterMesh = new THREE.Mesh(splitterGeo, splitterMat);
    splitterMesh.position.set(0, 0.22, 2.2);
    group.add(splitterMesh);

    // Rear diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.96, 0.14, 0.4);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, splitterMat);
    diffuserMesh.position.set(0, 0.24, -2.18);
    group.add(diffuserMesh);

    // 2. Tinted aerodynamic glass cabin (Greenhouse)
    const cabinGroup = new THREE.Group();
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.04,
      metalness: 0.98,
      transparent: true,
      opacity: 0.92,
    });
    const cabinGeo = new THREE.BoxGeometry(1.56, 0.48, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 0.84, -0.15);
    cabinGroup.add(cabinMesh);

    // Windshield slope
    const windshieldGeo = new THREE.BoxGeometry(1.52, 0.1, 0.85);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
    windshieldMesh.rotation.x = -0.65;
    windshieldMesh.position.set(0, 0.76, 1.12);
    cabinGroup.add(windshieldMesh);

    // Rear window slope
    const rearWinGeo = new THREE.BoxGeometry(1.52, 0.1, 0.82);
    const rearWinMesh = new THREE.Mesh(rearWinGeo, glassMat);
    rearWinMesh.rotation.x = 0.58;
    rearWinMesh.position.set(0, 0.76, -1.38);
    cabinGroup.add(rearWinMesh);

    // Roof panel in body color
    const roofGeo = new THREE.BoxGeometry(1.48, 0.06, 1.6);
    const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
    roofMesh.position.set(0, 1.08, -0.12);
    cabinGroup.add(roofMesh);

    group.add(cabinGroup);

    // 3. Wheels with silver alloy rims
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const wheelPositions = [
      [-1.02, 0.36, 1.32],
      [1.02, 0.36, 1.32],
      [-1.02, 0.36, -1.32],
      [1.02, 0.36, -1.32],
    ];
    const wheelMeshes: THREE.Mesh[] = [];
    for (const [wx, wy, wz] of wheelPositions) {
      const wheel = new THREE.Mesh(this.wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
      wheelMeshes.push(wheel);

      // Alloy rim outer disc
      const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(wx > 0 ? wx + 0.13 : wx - 0.13, wy, wz);
      group.add(rim);
    }

    // 4. Dual Front LED headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: isHazard ? 0xf59e0b : 0xffffff });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.08), hlMat);
    hlLeft.position.set(-0.68, 0.46, 2.22);
    group.add(hlLeft);

    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.08), hlMat);
    hlRight.position.set(0.68, 0.46, 2.22);
    group.add(hlRight);

    // Projected Headlight Beam on Road
    if (!isHazard) {
      const beamMesh = new THREE.Mesh(this.beamGeo, this.beamMat);
      beamMesh.position.set(0, 0.04, 2.0);
      group.add(beamMesh);
    }

    // 5. Rear Taillight / Brake bar
    const brakeMat = new THREE.MeshBasicMaterial({ color: 0xff002e, transparent: true, opacity: 0.65 });
    const brakeLightMesh = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.08), brakeMat);
    brakeLightMesh.position.set(0, 0.54, -2.24);
    group.add(brakeLightMesh);

    // Rear road reflection puddle (wet road brake light bounce)
    const tailReflectMesh = new THREE.Mesh(this.tailReflectGeo, this.tailReflectMat);
    tailReflectMesh.position.set(0, 0.035, -3.8);
    group.add(tailReflectMesh);

    // Underglow Neon
    const ugMesh = new THREE.Mesh(this.underglowGeo, this.underglowMat.clone());
    const ugMat = ugMesh.material as THREE.MeshBasicMaterial;
    ugMat.color.setHex(isEgo ? 0x00f0ff : isHazard ? 0xf59e0b : 0x0284c7);
    ugMesh.position.set(0, 0.04, 0);
    group.add(ugMesh);

    // Hazard vehicle flashing amber beacon
    let hazardBlinkerMesh: THREE.Mesh | undefined;
    if (isHazard) {
      const blinkerGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16);
      const blinkerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      hazardBlinkerMesh = new THREE.Mesh(blinkerGeo, blinkerMat);
      hazardBlinkerMesh.position.set(0, 1.45, 0);
      group.add(hazardBlinkerMesh);
    }

    // Minus Zero 360° Perception Radar (Ego only)
    let perceptionRing: THREE.Mesh | undefined;
    if (isEgo) {
      perceptionRing = new THREE.Mesh(this.perceptionRingGeo, this.perceptionRingMat);
      perceptionRing.position.set(0, 0.06, 0);
      group.add(perceptionRing);
    }

    // 6. Holographic 3D Floating Tag Billboard Sprite (like concept art!)
    const tagTitle = isEgo ? 'AEGIS-1 · 96 KM/H' : isHazard ? '⚠️ HAZARD: STALLED' : `${id} · 92 KM/H`;
    const tagSub = isEgo ? 'V2V MESH ACTIVE · 38ms' : isHazard ? 'LANE 1 BLOCKED · 0 KM/H' : 'MESH LINK CONNECTED';
    const tagColor = isEgo ? '#00f0ff' : isHazard ? '#f59e0b' : '#38bdf8';
    const tagSprite = this.createVehicleTagSprite(tagTitle, tagSub, tagColor, isHazard);
    tagSprite.scale.set(3.2, 0.85, 1);
    group.add(tagSprite);

    const startX = this.getLaneX(lane, isRamp);
    group.position.set(startX, 0, z);
    this.scene.add(group);

    return {
      id,
      x: startX,
      z,
      v: isHazard ? 0 : isEgo ? 26.5 : 24 + (this.seq % 4) * 1.2,
      vDesired: isHazard ? 0 : isEgo ? 27 : 24 + (this.seq % 4) * 1.2,
      lane,
      targetLane: lane,
      laneProgress: 1,
      changing: false,
      yieldT: 0,
      intent: isHazard ? 'Hazard Vehicle' : 'Cruising',
      color,
      isEgo,
      isHazard,
      isRamp,
      rampMerged: !isRamp,
      meshGroup: group,
      cabinGroup,
      wheelMeshes,
      steerAngle: 0,
      perceptionRing,
      brakeLightMesh,
      hazardBlinkerMesh,
      hudSprite: tagSprite,
    };
  }

  private getLaneX(lane: number, isRamp = false): number {
    if (isRamp) {
      return (this.opts.lanes * LANE_WIDTH) / 2 + 3.8;
    }
    return (lane - this.opts.lanes / 2 + 0.5) * LANE_WIDTH;
  }

  private getTorusDistance(fromZ: number, toZ: number): number {
    let dz = toZ - fromZ;
    while (dz < 0) dz += ROAD_LENGTH;
    while (dz >= ROAD_LENGTH) dz -= ROAD_LENGTH;
    return dz;
  }

  /**
   * Find immediate lead vehicle in the same lane or target lane with torus wrap.
   */
  private findLeadVehicle(c: SimCar3D): { lead: SimCar3D; gap: number } | null {
    let minDz = Infinity;
    let lead: SimCar3D | null = null;
    const currentLane = c.lane;
    const targetLane = c.changing ? c.targetLane : c.lane;

    for (const other of this.cars) {
      if (other === c) continue;
      const otherInLane =
        other.lane === currentLane ||
        other.lane === targetLane ||
        (other.changing && (other.targetLane === currentLane || other.targetLane === targetLane));

      if (!otherInLane) continue;

      const dz = this.getTorusDistance(c.z, other.z);
      if (dz > 0.05 && dz < 140 && dz < minDz) {
        minDz = dz;
        lead = other;
      }
    }

    if (lead) {
      return { lead, gap: Math.max(0.1, minDz - 4.8) };
    }
    return null;
  }

  /**
   * Check if a lane has safe front and rear clearance for a lane change.
   */
  private isLaneSafeForMerge(c: SimCar3D, targetLane: number): boolean {
    for (const other of this.cars) {
      if (other === c) continue;
      if (other.lane === targetLane || (other.changing && other.targetLane === targetLane)) {
        const dzAhead = this.getTorusDistance(c.z, other.z);
        if (dzAhead < 18.0) return false;
        const dzBehind = this.getTorusDistance(other.z, c.z);
        if (dzBehind < 16.0) return false;
      }
    }
    return true;
  }

  // --- 7D Walkthrough Scripting & Intelligent Driver Model (IDM) Physics ---
  public step(dt: number) {
    this.time += dt;

    if (this.rideActive) {
      this.rideTime = (this.rideTime + dt) % this.rideDuration;
      for (const ch of RIDE_CHAPTERS) {
        if (this.rideTime >= ch.timeRange[0] && this.rideTime < ch.timeRange[1]) {
          this.currentChapter = ch;
          break;
        }
      }

      if (this.currentChapter.index !== this.lastPlayedChapter) {
        this.lastPlayedChapter = this.currentChapter.index;
      }
    }

    const ego = this.cars[0];
    const hazard = this.cars.find((c) => c.isHazard);
    const peerInLane0 = this.cars.find((c) => c.lane === 0 && !c.isEgo);

    // Dynamic 7D Scenario Orchestration
    if (this.rideActive && ego && hazard) {
      const chIdx = this.currentChapter.index;

      if (chIdx === 1) {
        ego.vDesired = 26.5;
        this.targetFov = 52;
        this.targetRoll = 0;
        ego.intent = 'High-Speed Platoon Cruise (96 km/h)';
      } else if (chIdx === 2) {
        ego.vDesired = 19;
        this.targetFov = 50;
        this.targetRoll = 0.02;
        ego.intent = 'HAZARD: Decelerating (Disabled Unit 140m ahead)';
      } else if (chIdx === 3) {
        ego.vDesired = 21;
        this.targetFov = 54;
        this.targetRoll = -0.03;
        ego.intent = 'NEGOTIATION: 38ms Mesh Gap Request Broadcast';
        if (peerInLane0) {
          peerInLane0.yieldT = 3.5;
          peerInLane0.vDesired = 18;
        }
      } else if (chIdx === 4) {
        ego.vDesired = 27.5;
        this.targetFov = 60; // Speed rush expansion
        this.targetRoll = -0.11; // 7D rollercoaster banking tilt (~6.5 deg)
        ego.intent = 'ZIP MERGE: Executing Slotted Gap Insertion';

        if (ego.lane === 1 && !ego.changing) {
          ego.changing = true;
          ego.targetLane = 0;
          ego.laneProgress = 0;
        }
      } else if (chIdx === 5) {
        ego.vDesired = 27;
        this.targetFov = 52;
        this.targetRoll = 0;
        ego.intent = 'HARMONY: Platoon Synchronized at Zero Congestion';

        // Return smoothly to Lane 1 after clearing the hazard
        const dzToHaz = this.getTorusDistance(hazard.z, ego.z);
        if (dzToHaz > 35 && ego.lane === 0 && !ego.changing) {
          if (this.isLaneSafeForMerge(ego, 1)) {
            ego.changing = true;
            ego.targetLane = 1;
            ego.laneProgress = 0;
          }
        }
      }
    }

    // Intelligent Driver Model (IDM) Traffic Dynamics - Guaranteed 0 collisions
    const s0 = 8.0; // minimum jam gap (meters)
    const T = 1.35; // safe time headway (seconds)
    const a = 1.8; // max comfortable acceleration (m/s^2)
    const b = 2.4; // comfortable deceleration (m/s^2)

    for (const c of this.cars) {
      if (c.isHazard) {
        if (c.hazardBlinkerMesh) {
          const blink = Math.sin(this.time * 12) > 0;
          c.hazardBlinkerMesh.visible = blink;
        }
        if (c.hudSprite) {
          c.hudSprite.visible = this.opts.cameraMode !== 'cockpit';
        }
        continue;
      }

      if (c.yieldT > 0) c.yieldT -= dt;

      // Autonomous hazard avoidance for background vehicles in Lane 1
      if (!c.isEgo && c.lane === 1 && !c.changing && hazard) {
        const dzToHaz = this.getTorusDistance(c.z, hazard.z);
        if (dzToHaz > 16 && dzToHaz < 85) {
          if (this.isLaneSafeForMerge(c, 0)) {
            c.changing = true;
            c.targetLane = 0;
            c.laneProgress = 0;
          } else if (this.isLaneSafeForMerge(c, 2)) {
            c.changing = true;
            c.targetLane = 2;
            c.laneProgress = 0;
          }
        }
      }

      // IDM Acceleration Calculation
      let accel = 0;
      const leadInfo = this.findLeadVehicle(c);
      if (leadInfo) {
        const { lead, gap } = leadInfo;
        const deltaV = c.v - lead.v;
        const sStar = s0 + Math.max(0, c.v * T + (c.v * deltaV) / (2 * Math.sqrt(a * b)));
        const vRatio = c.vDesired > 0 ? c.v / c.vDesired : 1;
        const gapRatio = sStar / Math.max(0.2, gap);

        accel = a * (1 - Math.pow(vRatio, 4) - Math.pow(gapRatio, 2));

        if (c.yieldT > 0) {
          accel = Math.min(accel, -1.8);
        }

        // Emergency buffer clamp: strictly prevents bumper overlap
        if (gap < 7.0) {
          accel = Math.min(accel, -4.5);
          if (gap < 3.2) {
            c.v = Math.min(c.v, Math.max(0, lead.v - 1.2));
          }
        }
      } else {
        const vRatio = c.vDesired > 0 ? c.v / c.vDesired : 1;
        accel = a * (1 - Math.pow(vRatio, 4));
        if (c.yieldT > 0) accel = Math.min(accel, -1.4);
      }

      // Update speed smoothly
      c.v = Math.max(0, c.v + accel * dt);

      // Longitudinal motion
      c.z += c.v * dt;
      if (c.z > ROAD_LENGTH) c.z -= ROAD_LENGTH;

      // Lateral motion and steering kinematics
      if (c.changing) {
        c.laneProgress += dt * 1.4;
        if (c.laneProgress >= 1) {
          c.laneProgress = 1;
          c.lane = c.targetLane;
          c.changing = false;
        }
        const xStart = this.getLaneX(c.lane, c.isRamp);
        const xEnd = this.getLaneX(c.targetLane, false);
        const smoothT = Math.sin((c.laneProgress * Math.PI) / 2);
        c.x = xStart + (xEnd - xStart) * smoothT;

        const steerDir = c.targetLane > c.lane ? 1 : -1;
        const steerFactor = Math.sin(c.laneProgress * Math.PI);
        c.meshGroup.rotation.y = steerDir * steerFactor * 0.08;
        c.meshGroup.rotation.z = -steerDir * steerFactor * 0.04;
        c.steerAngle = steerDir * steerFactor * 25;
      } else {
        c.x = this.getLaneX(c.lane, c.isRamp);
        c.meshGroup.rotation.y = 0;
        c.meshGroup.rotation.z = 0;
        c.steerAngle = 0;
      }

      c.meshGroup.position.set(c.x, 0, c.z);

      // Realistic wheel rotation
      if (c.wheelMeshes) {
        for (const w of c.wheelMeshes) {
          w.rotation.x += (c.v / 0.35) * dt;
        }
      }

      // Dynamic brake light glow on deceleration
      if (c.brakeLightMesh) {
        const isBraking = accel < -0.8;
        const mat = c.brakeLightMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = isBraking ? 1.0 : 0.55;
      }

      // Hide Ego 3D mesh entirely in cockpit mode so camera has zero geometry clipping through windshield
      if (c.isEgo) {
        c.meshGroup.visible = this.opts.cameraMode !== 'cockpit';
      }

      if (c.perceptionRing) {
        if (c.isEgo && this.opts.cameraMode === 'cockpit') {
          c.perceptionRing.visible = false;
        } else {
          c.perceptionRing.visible = true;
          const pulse = 1.0 + 0.08 * Math.sin(this.time * 6);
          c.perceptionRing.scale.set(pulse, pulse, pulse);
          c.perceptionRing.rotation.z += dt * 0.6;
        }
      }

      if (c.hudSprite) {
        if (this.opts.cameraMode === 'cockpit') {
          // Hide all floating video-game tags in cockpit mode for a pure, authentic windshield view
          c.hudSprite.visible = false;
        } else {
          const camZ = this.camera.position.z;
          c.hudSprite.visible = c.z > camZ + 3.8;
        }
      }
    }

    // Update Dual Projected Green AR Trajectory Ribbons (hidden in cockpit mode for authentic generic car realism)
    const isCockpit = this.opts.cameraMode === 'cockpit';
    this.trajectoryLine.visible = !isCockpit;
    this.trajectoryLine2.visible = !isCockpit;
    this.speedStreaks.visible = !isCockpit;

    if (ego && !isCockpit) {
      const points1: THREE.Vector3[] = [];
      const points2: THREE.Vector3[] = [];
      const targetX = ego.changing ? this.getLaneX(ego.targetLane) : ego.x;
      for (let t = 0; t <= 1; t += 0.04) {
        const pz = ego.z + t * 50;
        const px = ego.x + (targetX - ego.x) * Math.sin((t * Math.PI) / 2);
        points1.push(new THREE.Vector3(px - 0.72, 0.08, pz));
        points2.push(new THREE.Vector3(px + 0.72, 0.08, pz));
      }
      this.trajectoryLine.geometry.setFromPoints(points1);
      this.trajectoryLine2.geometry.setFromPoints(points2);
    }

    // Optical Flow Speed Streaks
    const streakPos = this.streakGeo.attributes.position as THREE.BufferAttribute;
    const streakSpeed = (ego ? ego.v : 25) * dt * 2.2;
    for (let k = 0; k < 160; k++) {
      let z1 = streakPos.getZ(k * 2);
      let z2 = streakPos.getZ(k * 2 + 1);
      z1 -= streakSpeed;
      z2 -= streakSpeed;
      if (z2 < 0) {
        z1 += ROAD_LENGTH;
        z2 += ROAD_LENGTH;
      }
      streakPos.setZ(k * 2, z1);
      streakPos.setZ(k * 2 + 1, z2);
    }
    streakPos.needsUpdate = true;

    // V2V Mesh Links & Packets
    let linkCount = 0;
    let packetCount = 0;
    const linkPosAttr = this.linkGeo.attributes.position as THREE.BufferAttribute;
    const linkColAttr = this.linkGeo.attributes.color as THREE.BufferAttribute;
    const packetPosAttr = this.packetGeo.attributes.position as THREE.BufferAttribute;
    const packetColAttr = this.packetGeo.attributes.color as THREE.BufferAttribute;

    const v2vEnabled = this.opts.v2v;

    if (v2vEnabled) {
      for (let i = 0; i < this.cars.length; i++) {
        for (let j = i + 1; j < this.cars.length; j++) {
          const a = this.cars[i];
          const b = this.cars[j];
          if (a.isHazard || b.isHazard) continue;

          const dz = Math.abs(a.z - b.z);
          if (dz > V2V_RADIUS) continue;
          const dist = Math.hypot(a.x - b.x, dz);

          if (dist < V2V_RADIUS && linkCount < 150) {
            const isNegotiating = a.changing || b.changing || a.yieldT > 0 || b.yieldT > 0;

            linkPosAttr.setXYZ(linkCount * 2, a.x, 0.85, a.z);
            linkPosAttr.setXYZ(linkCount * 2 + 1, b.x, 0.85, b.z);

            const cr = isNegotiating ? 1.0 : 0.0;
            const cg = isNegotiating ? 0.65 : 0.9;
            const cb = isNegotiating ? 0.1 : 1.0;

            linkColAttr.setXYZ(linkCount * 2, cr, cg, cb);
            linkColAttr.setXYZ(linkCount * 2 + 1, cr, cg, cb);
            linkCount++;

            const t = (this.time * 2.4 + i * 0.3 + j * 0.2) % 1;
            const px = a.x + (b.x - a.x) * t;
            const pz = a.z + (b.z - a.z) * t;

            packetPosAttr.setXYZ(packetCount, px, 0.95, pz);
            packetColAttr.setXYZ(packetCount, isNegotiating ? 1 : 0.2, isNegotiating ? 0.75 : 0.9, 1);
            packetCount++;
          }
        }
      }
    }

    this.linkGeo.setDrawRange(0, linkCount * 2);
    this.packetGeo.setDrawRange(0, packetCount);
    linkPosAttr.needsUpdate = true;
    linkColAttr.needsUpdate = true;
    packetPosAttr.needsUpdate = true;
    packetColAttr.needsUpdate = true;

    // Update 7D Camera
    this.updateCamera7D(dt);

    if (ego) {
      if (this.egoHeadlightSpot && this.egoHeadlightTarget) {
        this.egoHeadlightSpot.position.set(ego.x, 1.1, ego.z + 1.8);
        this.egoHeadlightTarget.position.set(ego.x, 0.1, ego.z + 32);
      }
    }

    if (this.onTelemetry && ego) {
      const avgSpeed = this.cars.reduce((s, c) => s + c.v, 0) / Math.max(1, this.cars.length);
      this.onTelemetry({
        vehicles: this.cars.length,
        links: linkCount,
        conflicts: v2vEnabled ? 0 : 3,
        latency: v2vEnabled ? Math.round(28 + Math.sin(this.time * 4) * 4) : 185,
        flow: Math.round(avgSpeed * 3.6),
        egoSpeed: Math.round(ego.v * 3.6),
        egoIntent: ego.intent,
        activeNegotiation: ego.changing ? '34ms Gap Negotiation Verified' : null,
        rideActive: this.rideActive,
        rideProgress: this.rideTime / this.rideDuration,
        currentChapter: this.currentChapter,
        egoSteer: ego.steerAngle || 0,
      });
    }
  }

  // --- 7D Rollercoaster Camera Choreography ---
  private updateCamera7D(dt: number) {
    const ego = this.cars[0];
    if (!ego) return;

    const mode = this.opts.cameraMode;

    if (mode === 'chase') {
      this.camTargetPos.set(ego.x * 0.8, 5.0, ego.z - 11.5);
      this.camTargetLook.set(ego.x * 0.4, 1.2, ego.z + 24);
    } else if (mode === 'cockpit') {
      // Driver seat perspective looking out through panoramic windshield down the highway
      this.camTargetPos.set(ego.x - 0.20, 2.05, ego.z + 0.6);
      this.camTargetLook.set(ego.x - 0.05, 0.40, ego.z + 28);
    } else {
      const totalW = this.opts.lanes * LANE_WIDTH;
      this.camTargetPos.set(-totalW * 1.3 - 4, 16, ego.z - 8);
      this.camTargetLook.set(totalW * 0.2, 0.5, ego.z + 16);
    }

    // Seamless toroidal highway camera wrap (prevents camera flying backwards across the map)
    if (Math.abs(this.camTargetPos.z - this.camera.position.z) > ROAD_LENGTH / 2) {
      if (this.camTargetPos.z < this.camera.position.z) {
        this.camera.position.z -= ROAD_LENGTH;
        this.camCurrentLook.z -= ROAD_LENGTH;
      } else {
        this.camera.position.z += ROAD_LENGTH;
        this.camCurrentLook.z += ROAD_LENGTH;
      }
    }

    const lerpFactor = Math.min(1, dt * 6.5);
    this.camera.position.lerp(this.camTargetPos, lerpFactor);
    this.camCurrentLook.lerp(this.camTargetLook, lerpFactor);
    this.camera.lookAt(this.camCurrentLook);

    this.camera.fov += (this.targetFov - this.camera.fov) * Math.min(1, dt * 4);
    this.camera.updateProjectionMatrix();

    this.currentRoll += (this.targetRoll - this.currentRoll) * Math.min(1, dt * 5);
    this.camera.rotation.z += this.currentRoll;
  }

  public seekChapter(chapterIdx: number) {
    const ch = RIDE_CHAPTERS.find((c) => c.index === chapterIdx);
    if (ch) {
      this.rideTime = ch.timeRange[0] + 0.1;
      this.currentChapter = ch;
    }
  }

  public toggleRide(): boolean {
    this.rideActive = !this.rideActive;
    return this.rideActive;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (now: number) => {
      if (!this.isRunning) return;
      const elapsed = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      this.accumTime += elapsed;
      let steps = 0;
      while (this.accumTime >= this.fixedDt && steps < 3) {
        this.step(this.fixedDt * this.opts.speed);
        this.accumTime -= this.fixedDt;
        steps++;
      }
      if (steps >= 3) this.accumTime = 0;

      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  public pause() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  public resize() {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth || 1000;
    const h = this.container.clientHeight || 470;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public setOptions(opts: Partial<SimOptions3D>) {
    const prevLanes = this.opts.lanes;
    const prevDensity = this.opts.density;
    const prevCamMode = this.opts.cameraMode;
    this.opts = { ...this.opts, ...opts };

    if (opts.cameraMode && opts.cameraMode !== prevCamMode) {
      if (opts.cameraMode === 'cockpit') {
        this.targetFov = 58;
      } else if (opts.cameraMode === 'drone') {
        this.targetFov = 48;
      } else {
        this.targetFov = 52;
      }
      this.speedStreaks.visible = opts.cameraMode !== 'cockpit';
      this.trajectoryLine.visible = opts.cameraMode !== 'cockpit';
      this.trajectoryLine2.visible = opts.cameraMode !== 'cockpit';
      const ego = this.cars[0];
      if (ego) {
        ego.meshGroup.visible = opts.cameraMode !== 'cockpit';
        if (opts.cameraMode === 'cockpit') {
          this.camTargetPos.set(ego.x - 0.20, 2.05, ego.z + 0.6);
          this.camTargetLook.set(ego.x - 0.05, 0.40, ego.z + 28);
        } else if (opts.cameraMode === 'chase') {
          this.camTargetPos.set(ego.x * 0.8, 5.0, ego.z - 11.5);
          this.camTargetLook.set(ego.x * 0.4, 1.2, ego.z + 24);
        } else {
          const totalW = this.opts.lanes * LANE_WIDTH;
          this.camTargetPos.set(-totalW * 1.3 - 4, 16, ego.z - 8);
          this.camTargetLook.set(totalW * 0.2, 0.5, ego.z + 16);
        }
        this.camera.position.copy(this.camTargetPos);
        this.camCurrentLook.copy(this.camTargetLook);
        this.camera.lookAt(this.camCurrentLook);
        this.camera.fov = this.targetFov;
        this.camera.updateProjectionMatrix();
      }
      this.cars.forEach((car) => {
        if (car.hudSprite) {
          car.hudSprite.visible = opts.cameraMode !== 'cockpit';
        }
      });
    }

    if (opts.lanes !== undefined && opts.lanes !== prevLanes) {
      this.buildRoad();
      this.buildStreetLamps();
      this.buildGantries();
      this.reseedTraffic();
    } else if (opts.density !== undefined && opts.density !== prevDensity) {
      this.reseedTraffic();
    }

    if (!this.isRunning && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public dispose() {
    this.pause();
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
