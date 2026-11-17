import * as THREE from "../../vendor/three/three.module.js";

const ANIMATION_DURATION_MS = 900;
const MAX_PIXEL_RATIO = 1.5;
const COLORS = Object.freeze({
  link: 0x315576,
  active: 0x00a9e8,
  correct: 0x00d884,
  incorrect: 0xff3f79,
  packet: 0x65e5ff,
});

function disposeObjectTree(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of objectMaterials) {
      if (!material) {
        continue;
      }
      materials.add(material);
      if (material.map) {
        textures.add(material.map);
      }
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function createRouterLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("A 2D canvas is required to label the router topology");
  }
  context.fillStyle = "rgba(5, 16, 36, 0.94)";
  context.fillRect(8, 8, 240, 80);
  context.strokeStyle = "rgba(100, 196, 255, 0.8)";
  context.lineWidth = 4;
  context.strokeRect(8, 8, 240, 80);
  context.fillStyle = "#e7f7ff";
  context.font = "700 36px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 48, 224);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const label = new THREE.Sprite(material);
  label.position.set(0, 0.77, 0);
  label.scale.set(1.05, 0.4, 1);
  return label;
}

function createOutcomeGlyphs(group) {
  const correct = new THREE.Group();
  const correctMaterial = new THREE.MeshBasicMaterial({ color: COLORS.correct });
  const shortCheck = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.065, 0.065),
    correctMaterial,
  );
  shortCheck.position.set(-0.07, -0.015, 0.04);
  shortCheck.rotation.z = -Math.PI / 4;
  const longCheck = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.065, 0.065),
    correctMaterial,
  );
  longCheck.position.set(0.075, 0.045, 0.04);
  longCheck.rotation.z = Math.PI / 4;
  correct.add(shortCheck, longCheck);
  correct.position.set(0, 0.02, 0.37);
  correct.visible = false;
  group.add(correct);

  const incorrect = new THREE.Group();
  const incorrectMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.incorrect,
  });
  const firstCross = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.065, 0.065),
    incorrectMaterial,
  );
  const secondCross = firstCross.clone();
  firstCross.rotation.z = Math.PI / 4;
  secondCross.rotation.z = -Math.PI / 4;
  incorrect.add(firstCross, secondCross);
  incorrect.position.set(0, 0.02, 0.37);
  incorrect.visible = false;
  group.add(incorrect);

  return { correct, incorrect };
}

function createRouterNode(label, position) {
  const group = new THREE.Group();
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: 0x274663,
    emissive: 0x061321,
    emissiveIntensity: 0.45,
    metalness: 0.32,
    roughness: 0.48,
  });
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x40668c,
    metalness: 0.38,
    roughness: 0.4,
  });
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x10253d,
    metalness: 0.2,
    roughness: 0.55,
  });
  const portMaterial = new THREE.MeshStandardMaterial({
    color: 0x55c9f4,
    emissive: 0x0b3450,
    emissiveIntensity: 0.7,
  });
  const indicatorMaterial = new THREE.MeshStandardMaterial({
    color: 0x55c9f4,
    emissive: 0x1689bd,
    emissiveIntensity: 1.5,
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.08, 0.72),
    panelMaterial,
  );
  base.position.y = -0.23;
  group.add(base);

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.36, 0.62),
    chassisMaterial,
  );
  chassis.position.y = -0.01;
  group.add(chassis);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.035, 0.4),
    topMaterial,
  );
  top.position.set(0, 0.19, -0.02);
  group.add(top);

  const frontPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.13, 0.025),
    panelMaterial,
  );
  frontPanel.position.set(0, -0.06, 0.318);
  group.add(frontPanel);

  for (const x of [-0.22, -0.075, 0.075, 0.22]) {
    const port = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.055, 0.025),
      portMaterial,
    );
    port.position.set(x, -0.06, 0.34);
    group.add(port);
  }

  for (const x of [-0.28, 0.28]) {
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.18, 8),
      topMaterial,
    );
    antenna.position.set(x, 0.29, -0.18);
    group.add(antenna);
  }

  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 12, 8),
    indicatorMaterial,
  );
  indicator.position.set(0.3, 0.15, 0.2);
  group.add(indicator);

  group.add(createRouterLabel(label));
  const glyphs = createOutcomeGlyphs(group);
  group.position.copy(position);

  function setState(state) {
    const stateColors = {
      neutral: { chassis: 0x274663, emissive: 0x061321, indicator: 0x55c9f4 },
      correct: { chassis: 0x087b4e, emissive: 0x064425, indicator: COLORS.correct },
      incorrect: {
        chassis: 0x8c2547,
        emissive: 0x441126,
        indicator: COLORS.incorrect,
      },
    };
    const colors = stateColors[state];
    if (!colors) {
      throw new TypeError(`Unsupported router state: ${state}`);
    }
    chassisMaterial.color.setHex(colors.chassis);
    chassisMaterial.emissive.setHex(colors.emissive);
    indicatorMaterial.color.setHex(colors.indicator);
    indicatorMaterial.emissive.setHex(colors.indicator);
    glyphs.correct.visible = state === "correct";
    glyphs.incorrect.visible = state === "incorrect";
  }

  return { group, setState };
}

function createTube(curve, color, radius) {
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, radius, 8, false),
    new THREE.MeshBasicMaterial({ color }),
  );
}

export function getPacketRouteIndex(event) {
  return event.decisionStatus === "wrong"
    ? event.selectedRouteIndex
    : event.winningRouteIndex;
}

export function getRouteVisualState(event, index, settled) {
  if (!settled) {
    return {
      branchState: index === getPacketRouteIndex(event) ? "active" : "neutral",
      routerState: "neutral",
    };
  }
  if (index === event.winningRouteIndex) {
    return { branchState: "correct", routerState: "correct" };
  }
  if (event.decisionStatus === "wrong" && index === event.selectedRouteIndex) {
    return { branchState: "incorrect", routerState: "incorrect" };
  }
  return { branchState: "neutral", routerState: "neutral" };
}

const BRANCH_COLORS = Object.freeze({
  neutral: COLORS.link,
  active: COLORS.active,
  correct: COLORS.correct,
  incorrect: COLORS.incorrect,
});

function createTopology(event) {
  const { routes, selectedRouteIndex, winningRouteIndex } = event;
  if (
    !Array.isArray(routes) ||
    routes.length === 0 ||
    !Number.isInteger(selectedRouteIndex) ||
    selectedRouteIndex < 0 ||
    selectedRouteIndex >= routes.length ||
    !Number.isInteger(winningRouteIndex) ||
    winningRouteIndex < 0 ||
    winningRouteIndex >= routes.length
  ) {
    throw new TypeError("Decision event must include valid candidate route indices");
  }

  const group = new THREE.Group();
  try {
    const edgePosition = new THREE.Vector3(-3.9, 0, 0);
    const corePosition = new THREE.Vector3(-0.25, 0, 0);
    const edge = createRouterNode("EDGE", edgePosition);
    const core = createRouterNode("CORE", corePosition);
    group.add(edge.group, core.group);

    const candidateSpacing = Math.min(1.8, 3.6 / Math.max(1, routes.length - 1));
    const candidates = routes.map((route, index) => {
      const position = new THREE.Vector3(
        3.45,
        (index - (routes.length - 1) / 2) * candidateSpacing,
        index % 2 === 0 ? -0.28 : 0.28,
      );
      const candidate = createRouterNode(`NH ${index + 1}`, position);
      group.add(candidate.group);
      return candidate;
    });

    const edgeExit = edgePosition.clone().add(new THREE.Vector3(0.5, 0, 0));
    const coreEntry = corePosition.clone().add(new THREE.Vector3(-0.46, 0, 0));
    const coreExit = corePosition.clone().add(new THREE.Vector3(0.46, 0, 0));
    const backbone = new THREE.CatmullRomCurve3(
      [edgeExit, new THREE.Vector3(-2.05, 0.12, -0.12), coreEntry],
      false,
      "centripetal",
    );
    group.add(createTube(backbone, COLORS.active, 0.045));

    const branches = candidates.map((candidate, index) => {
      const target = candidate.group.position;
      const entry = target.clone().add(new THREE.Vector3(-0.5, 0, 0));
      const branch = new THREE.CatmullRomCurve3(
        [
          coreExit,
          new THREE.Vector3(0.95, target.y * 0.2, target.z * 0.2),
          new THREE.Vector3(2.1, target.y * 0.78, target.z),
          entry,
        ],
        false,
        "centripetal",
      );
      const { branchState } = getRouteVisualState(event, index, false);
      const line = createTube(
        branch,
        BRANCH_COLORS[branchState],
        index === winningRouteIndex ? 0.055 : 0.035,
      );
      group.add(line);
      return { curve: branch, line };
    });

    const packetRouteIndex = getPacketRouteIndex(event);
    const packetEntry = candidates[packetRouteIndex].group.position
      .clone()
      .add(new THREE.Vector3(-0.5, 0, 0));
    const packetBranch = branches[packetRouteIndex].curve;
    const packetCurve = new THREE.CatmullRomCurve3(
      [
        edgeExit,
        new THREE.Vector3(-2.05, 0.12, -0.12),
        coreEntry,
        corePosition,
        coreExit,
        packetBranch.getPointAt(0.48),
        packetEntry,
      ],
      false,
      "centripetal",
    );
    const packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 16, 12),
      new THREE.MeshBasicMaterial({
        color:
          event.decisionStatus === "wrong" ? COLORS.incorrect : COLORS.packet,
      }),
    );
    packet.position.copy(packetCurve.getPointAt(0));
    group.add(packet);

    return {
      group,
      packet,
      packetCurve,
      candidates,
      branches,
      selectedRouteIndex,
      winningRouteIndex,
      decisionStatus: event.decisionStatus,
    };
  } catch (error) {
    disposeObjectTree(group);
    throw error;
  }
}

export function createRouteFeedbackView({ onUnavailable } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    throw new Error("Three.js could not initialize WebGL", { cause: error });
  }

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 1.35));
  const keyLight = new THREE.DirectionalLight(0xd5efff, 2.2);
  keyLight.position.set(-3, 7, 6);
  scene.add(keyLight);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);

  renderer.setClearColor(0x00001e, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.tabIndex = -1;
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  let host = null;
  let topology = null;
  let frameId = 0;
  let animationStart = 0;
  let animationElapsed = 0;
  let progress = 0;
  let unavailable = false;
  let disposed = false;

  function clearTopology() {
    if (!topology) {
      return;
    }
    scene.remove(topology.group);
    disposeObjectTree(topology.group);
    topology = null;
  }

  function notifyUnavailable(error) {
    if (unavailable || disposed) {
      return;
    }
    unavailable = true;
    stop();
    clearTopology();
    onUnavailable?.(error);
  }

  function settleTopology() {
    if (!topology) {
      return;
    }
    topology.candidates.forEach((candidate, index) => {
      const { routerState } = getRouteVisualState(topology, index, true);
      candidate.setState(routerState);
    });
    topology.branches.forEach(({ line }, index) => {
      const { branchState } = getRouteVisualState(topology, index, true);
      line.material.color.setHex(BRANCH_COLORS[branchState]);
    });
  }

  function renderAt(value) {
    if (!topology) {
      return;
    }
    progress = Math.max(0, Math.min(1, value));
    topology.packet.position.copy(topology.packetCurve.getPointAt(progress));
    topology.packet.visible = progress < 1;
    if (progress === 1) {
      settleTopology();
    }
    try {
      renderer.render(scene, camera);
    } catch (error) {
      notifyUnavailable(
        new Error("Three.js failed to render route feedback", { cause: error }),
      );
    }
  }

  function resize() {
    if (!host || disposed || unavailable) {
      return;
    }
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const requiredDistance =
      4.65 /
      (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const cameraDistance = Math.max(9.5, requiredDistance);
    camera.position.set(0, cameraDistance * 0.46, cameraDistance * 0.89);
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
    if (frameId === 0) {
      renderAt(progress);
    }
  }

  function stop() {
    if (frameId !== 0) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    if (animationStart !== 0) {
      animationElapsed = Math.min(
        ANIMATION_DURATION_MS,
        animationElapsed + performance.now() - animationStart,
      );
      animationStart = 0;
    }
  }

  function animate(timestamp) {
    if (disposed || unavailable || document.hidden) {
      stop();
      return;
    }
    if (animationStart === 0) {
      animationStart = timestamp;
    }
    const elapsed = animationElapsed + timestamp - animationStart;
    const linearProgress = Math.min(1, elapsed / ANIMATION_DURATION_MS);
    const easedProgress =
      linearProgress * linearProgress * (3 - 2 * linearProgress);
    renderAt(easedProgress);
    if (progress < 1 && !unavailable) {
      frameId = requestAnimationFrame(animate);
    } else {
      frameId = 0;
      animationElapsed = ANIMATION_DURATION_MS;
      animationStart = 0;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stop();
      return;
    }
    if (progress < 1 && host && !unavailable && !disposed) {
      frameId = requestAnimationFrame(animate);
    } else if (host && !unavailable && !disposed) {
      renderer.render(scene, camera);
    }
  }

  function handleMotionPreferenceChange(event) {
    if (event.matches && frameId !== 0) {
      stop();
      animationElapsed = ANIMATION_DURATION_MS;
      renderAt(1);
    }
  }

  function handleContextLost(event) {
    event.preventDefault();
    notifyUnavailable(new Error("The WebGL context for route feedback was lost"));
  }

  const resizeObserver =
    typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  motionPreference.addEventListener?.("change", handleMotionPreferenceChange);
  if (!resizeObserver) {
    window.addEventListener("resize", resize);
  }

  function present(event, nextHost) {
    if (disposed) {
      throw new Error("Cannot present route feedback after disposal");
    }
    if (unavailable) {
      onUnavailable?.(new Error("Three.js route feedback is unavailable"));
      return;
    }
    if (!event || !nextHost) {
      throw new TypeError("A decision event and feedback host are required");
    }

    stop();
    clearTopology();
    topology = createTopology(event);
    scene.add(topology.group);
    host = nextHost;
    host.append(renderer.domElement);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver.observe(host);
    }

    progress = 0;
    animationStart = 0;
    animationElapsed = 0;
    topology.packet.position.copy(topology.packetCurve.getPointAt(0));
    resize();

    if (motionPreference.matches) {
      animationElapsed = ANIMATION_DURATION_MS;
      renderAt(1);
      return;
    }
    frameId = requestAnimationFrame(animate);
  }

  function dispose() {
    if (disposed) {
      return;
    }
    disposed = true;
    stop();
    clearTopology();
    resizeObserver?.disconnect();
    if (!resizeObserver) {
      window.removeEventListener("resize", resize);
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    motionPreference.removeEventListener?.("change", handleMotionPreferenceChange);
    renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.remove();
    renderer.dispose();
  }

  return { present, stop, dispose };
}
