/*
 * Latent Research Field
 *
 * A dependency-free canvas background shared by the main website and blog
 * posts. Each section uses a different topology. Pointer movement gently
 * attracts nearby nodes; after a short idle period the field gathers into a
 * small abstract "thinking" formation.
 */
(() => {
  const validModes = new Set([
    "about",
    "current-work",
    "research",
    "phd-work",
    "publications",
    "teaching",
    "memories",
    "materials",
    "blog",
  ]);

  const fieldTerms = [
    "annotation",
    "selection",
    "alignment",
    "RAG",
    "multilinguality",
    "evaluation",
    "instruction tuning",
    "token budget",
    "human feedback",
    "reasoning",
    "retrieval",
    "data quality",
    "annotation",
  ];

  const seeded = (value) => {
    const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
    return result - Math.floor(result);
  };

  const fieldTarget = (mode, index, count, width, height) => {
    const u = seeded(index + 1);
    const v = seeded(index + 97);
    const usableTop = Math.min(190, height * 0.24);
    const usableHeight = Math.max(180, height - usableTop - 80);

    if (mode === "research" || mode === "current-work") {
      const branch = index % 4;
      const depth =
        Math.floor(index / 4) / Math.max(1, Math.ceil(count / 4) - 1);
      return {
        x: width * (0.08 + depth * 0.84),
        y:
          usableTop +
          usableHeight * (0.16 + branch * 0.22) +
          Math.sin(depth * 7 + branch) * 26,
      };
    }

    if (mode === "phd-work") {
      const cluster = index % 3;
      const angle = u * Math.PI * 2;
      const radius = 24 + v * Math.min(92, width * 0.08);
      return {
        x: width * (0.22 + cluster * 0.28) + Math.cos(angle) * radius,
        y: usableTop + usableHeight * 0.5 + Math.sin(angle) * radius,
      };
    }

    if (mode === "publications") {
      const paper = index % 5;
      const angle = u * Math.PI * 2;
      const radius = 20 + v * 58;
      return {
        x: width * (0.12 + paper * 0.19) + Math.cos(angle) * radius,
        y:
          usableTop +
          usableHeight * (0.22 + (paper % 2) * 0.48) +
          Math.sin(angle) * radius,
      };
    }

    if (mode === "teaching") {
      const depth = index / Math.max(1, count - 1);
      const lane = index % 7;
      return {
        x: width * (0.12 + depth * 0.76),
        y:
          usableTop +
          usableHeight * 0.5 +
          (lane - 3) * (18 + depth * 18) +
          Math.sin(index) * 12,
      };
    }

    if (mode === "memories") {
      const column = index % 3;
      const row = Math.floor(index / 3) % 3;
      return {
        x: width * (0.2 + column * 0.3) + (u - 0.5) * 100,
        y:
          usableTop +
          usableHeight * (0.16 + row * 0.34) +
          (v - 0.5) * 60,
      };
    }

    if (mode === "materials") {
      const columns = width < 760 ? 6 : 10;
      const column = index % columns;
      const row = Math.floor(index / columns);
      const rows = Math.ceil(count / columns);
      return {
        x: width * (0.1 + (column / Math.max(1, columns - 1)) * 0.8),
        y: usableTop + usableHeight * (row / Math.max(1, rows - 1)),
      };
    }

    if (mode === "blog") {
      const progress = index / Math.max(1, count - 1);
      return {
        x: width * (0.07 + progress * 0.86),
        y:
          usableTop +
          usableHeight *
            (0.5 + Math.sin(progress * Math.PI * 5) * 0.22) +
          (v - 0.5) * 36,
      };
    }

    const angle = u * Math.PI * 2;
    const radius = Math.sqrt(v);
    return {
      x: width * 0.5 + Math.cos(angle) * radius * width * 0.44,
      y:
        usableTop +
        usableHeight * 0.5 +
        Math.sin(angle) * radius * usableHeight * 0.46,
    };
  };

  const idleTarget = (index, count, width, height) => {
    const centerX =
      width > 1080 ? width - Math.min(130, width * 0.085) : width * 0.78;
    const centerY = height * 0.43;
    const ring = index % 3;
    const ringCount = Math.max(1, Math.floor(count / 3));
    const angle =
      (Math.floor(index / 3) / ringCount) * Math.PI * 2 + ring * 0.72;
    const radiusX = 18 + ring * 24;
    const radiusY = 26 + ring * 18;

    return {
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    };
  };

  const siteFrame = document.querySelector(".site-frame");
  if (!siteFrame) return;

  const canvas = document.createElement("canvas");
  canvas.className = "latent-field";
  canvas.setAttribute("aria-hidden", "true");
  siteFrame.prepend(canvas);

  const context = canvas.getContext("2d");
  if (!context) return;

  const isArticle = Boolean(document.querySelector(".article"));
  const initialHash = window.location.hash.slice(1);
  let mode = isArticle
    ? "blog"
    : validModes.has(initialHash)
      ? initialHash
      : "about";
  let width = 0;
  let height = 0;
  let frame = 0;
  let nodes = [];
  let animationFrame = 0;
  let palette = {
    fieldLine: "#9f9f9f",
    fieldNode: "#555555",
    muted: "#5d5d5d",
    foreground: "#111111",
  };
  let fieldFont = "sans-serif";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const pointer = {
    x: -1000,
    y: -1000,
    active: false,
    lastMoved: performance.now(),
  };

  const readPalette = () => {
    const styles = getComputedStyle(document.documentElement);
    palette = {
      fieldLine:
        styles.getPropertyValue("--field-line").trim() || "#9f9f9f",
      fieldNode:
        styles.getPropertyValue("--field-node").trim() || "#555555",
      muted: styles.getPropertyValue("--muted").trim() || "#5d5d5d",
      foreground:
        styles.getPropertyValue("--foreground").trim() || "#111111",
    };
    fieldFont = getComputedStyle(document.body).fontFamily || fieldFont;
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = width < 640 ? 34 : width < 1024 ? 50 : 68;
    nodes = Array.from({ length: count }, (_, index) => {
      const target = fieldTarget(mode, index, count, width, height);
      return {
        x: target.x + (seeded(index + 37) - 0.5) * 90,
        y: target.y + (seeded(index + 71) - 0.5) * 90,
        vx: 0,
        vy: 0,
        seed: seeded(index + 131),
        label: fieldTerms[index % fieldTerms.length],
      };
    });
    readPalette();
  };

  const setMode = (nextMode) => {
    if (isArticle || !validModes.has(nextMode) || nextMode === mode) return;
    mode = nextMode;
    resize();
  };

  const movePointer = (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointer.lastMoved = performance.now();
  };

  const leavePointer = () => {
    pointer.active = false;
  };

  const themeObserver = new MutationObserver(readPalette);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    if (document.hidden) {
      animationFrame = window.requestAnimationFrame(draw);
      return;
    }

    const idle =
      !reducedMotion && time - pointer.lastMoved > 4200 && width > 520;
    let hoveredIndex = -1;
    let hoveredDistance = 36;
    const attentionByNode = new Array(nodes.length).fill(0);

    nodes.forEach((node, index) => {
      const target = idle
        ? idleTarget(index, nodes.length, width, height)
        : fieldTarget(mode, index, nodes.length, width, height);
      const spring = idle ? 0.008 : 0.0048;

      if (reducedMotion) {
        node.x = target.x;
        node.y = target.y;
      } else {
        node.vx += (target.x - node.x) * spring;
        node.vy += (target.y - node.y) * spring;

        if (pointer.active && !idle) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 190 && distance > 0) {
            const attention = 1 - distance / 190;
            attentionByNode[index] = attention;
            const pull = attention * 0.055;
            node.vx += dx * pull;
            node.vy += dy * pull;
          }
          if (distance < hoveredDistance) {
            hoveredDistance = distance;
            hoveredIndex = index;
          }
        }

        node.vx += Math.sin(time * 0.00035 + node.seed * 8) * 0.006;
        node.vy += Math.cos(time * 0.0003 + node.seed * 9) * 0.006;
        node.vx *= 0.88;
        node.vy *= 0.88;
        node.x += node.vx;
        node.y += node.vy;
      }
    });

    const connectionDistance = idle ? 62 : width < 640 ? 86 : 122;
    context.lineWidth = 0.8;
    for (let first = 0; first < nodes.length; first += 1) {
      for (let second = first + 1; second < nodes.length; second += 1) {
        const a = nodes[first];
        const b = nodes[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < connectionDistance) {
          const localAttention = Math.max(
            attentionByNode[first],
            attentionByNode[second],
          );
          context.globalAlpha =
            (1 - distance / connectionDistance) *
            (idle ? 0.34 : 0.24 + localAttention * 0.42);
          context.strokeStyle = palette.fieldLine;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    }

    nodes.forEach((node, index) => {
      const focused = index === hoveredIndex;
      const localAttention = attentionByNode[index];
      context.globalAlpha = focused
        ? 0.96
        : idle
          ? 0.58
          : 0.42 + localAttention * 0.34;
      context.fillStyle = focused ? palette.foreground : palette.fieldNode;
      context.beginPath();
      context.arc(
        node.x,
        node.y,
        focused ? 3.4 : 1.7 + localAttention * 1.5,
        0,
        Math.PI * 2,
      );
      context.fill();

      if (focused) {
        context.globalAlpha = 0.24;
        context.strokeStyle = palette.foreground;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(node.x, node.y, 7, 0, Math.PI * 2);
        context.stroke();
      }
    });

    if (hoveredIndex >= 0 && !idle) {
      const node = nodes[hoveredIndex];
      context.globalAlpha = 0.94;
      context.fillStyle = palette.foreground;
      context.font = `12px ${fieldFont}`;
      context.fillText(node.label, node.x + 11, node.y - 10);
    }

    if (idle) {
      context.globalAlpha = 0.5;
      context.fillStyle = palette.muted;
      context.font = `11px ${fieldFont}`;
      context.textAlign = "center";
      context.fillText(
        "thinking",
        idleTarget(0, nodes.length, width, height).x,
        height * 0.43 + 5,
      );
      context.textAlign = "start";
    }

    context.globalAlpha = 1;
    frame += 1;
    if (frame % 180 === 0) readPalette();
    animationFrame = window.requestAnimationFrame(draw);
  };

  window.addEventListener("site:tabchange", (event) => {
    setMode(event.detail?.tab);
  });
  window.addEventListener("hashchange", () => {
    setMode(window.location.hash.slice(1));
  });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", movePointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", leavePointer);

  resize();
  animationFrame = window.requestAnimationFrame(draw);

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(animationFrame);
    themeObserver.disconnect();
  });
})();
