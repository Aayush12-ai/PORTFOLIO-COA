const navLinks = document.getElementById("nav-links");
const menuBtn = document.getElementById("menu-btn");
const menuBtnIcon = menuBtn?.querySelector("i");

menuBtn?.addEventListener("click", () => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtnIcon?.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-3-line");
});

navLinks?.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
  menuBtnIcon?.setAttribute("class", "ri-menu-3-line");
});

const animatedText = document.querySelectorAll(".reveal-text");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createTextType = (element) => {
  const phrases = (element.dataset.texts || element.textContent)
    .split("|")
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  if (!phrases.length) return;

  const typingSpeed = Number(element.dataset.typingSpeed) || 46;
  const deletingSpeed = Number(element.dataset.deletingSpeed) || 26;
  const pauseDuration = Number(element.dataset.pauseDuration) || 1500;
  const initialDelay = Number(element.dataset.initialDelay) || 350;
  const cursorCharacter = element.dataset.cursor || "|";

  if (reduceMotion) {
    element.textContent = phrases[0];
    return;
  }

  const textNode = document.createElement("span");
  const cursor = document.createElement("span");
  cursor.className = "text-type__cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.textContent = cursorCharacter;

  element.textContent = "";
  element.append(textNode, cursor);

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeoutId;
  let started = false;

  const tick = () => {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex -= 1;
      textNode.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex <= 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeoutId = window.setTimeout(tick, 250);
        return;
      }

      timeoutId = window.setTimeout(tick, deletingSpeed);
      return;
    }

    charIndex += 1;
    textNode.textContent = currentPhrase.slice(0, charIndex);

    if (charIndex >= currentPhrase.length) {
      timeoutId = window.setTimeout(() => {
        isDeleting = phrases.length > 1;
        if (isDeleting) {
          tick();
        }
      }, pauseDuration);
      return;
    }

    timeoutId = window.setTimeout(tick, typingSpeed + Math.random() * 28);
  };

  const start = () => {
    if (started) return;
    started = true;
    timeoutId = window.setTimeout(tick, initialDelay);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(element);
  } else {
    start();
  }

  window.addEventListener("beforeunload", () => window.clearTimeout(timeoutId));
};

document.querySelectorAll("[data-text-type]").forEach(createTextType);

// ---- Reserve hero title height so typing does not shift the layout/photo ----
(() => {
  const heroTitle = document.querySelector(".hero__title");
  if (!heroTitle) return;

  const phrases = (heroTitle.dataset.texts || heroTitle.textContent)
    .split("|")
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  if (!phrases.length) return;

  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "fixed";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.whiteSpace = "pre-wrap";

  const applyStyles = () => {
    const cs = getComputedStyle(heroTitle);
    ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "maxWidth"].forEach(
      (prop) => {
        probe.style[prop] = cs[prop];
      }
    );
    const maxWidth = parseFloat(cs.maxWidth) || 760;
    const containerWidth = heroTitle.parentElement?.clientWidth || maxWidth;
    probe.style.width = `${Math.min(containerWidth, maxWidth)}px`;
  };

  const measure = () => {
    applyStyles();
    let maxHeight = 0;
    phrases.forEach((phrase) => {
      probe.textContent = phrase;
      maxHeight = Math.max(maxHeight, probe.offsetHeight);
    });
    probe.textContent = "";
    if (maxHeight > 0) heroTitle.style.minHeight = `${maxHeight}px`;
  };

  document.body.appendChild(probe);
  measure();

  window.addEventListener("resize", measure);
  if (document.fonts?.ready) {
    document.fonts.ready.then(measure).catch(() => {});
  }
})();

// ---- Specular button shine for technical toolkit tags ----
document.querySelectorAll(".tag").forEach((tag) => {
  const updateShine = (event) => {
    const rect = tag.getBoundingClientRect();
    tag.style.setProperty("--x", `${event.clientX - rect.left}px`);
    tag.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };
  // Position the shine immediately on enter so there is no perceived delay.
  tag.addEventListener("pointerenter", updateShine);
  tag.addEventListener("pointermove", updateShine);
});

if (!reduceMotion && "IntersectionObserver" in window) {
  const textObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          textObserver.unobserve(entry.target);
          // Clear the staggered reveal delay once the animation completes so
          // it does not delay any later hover/interaction transitions.
          entry.target.addEventListener(
            "transitionend",
            () => {
              entry.target.style.transitionDelay = "";
            },
            { once: true }
          );
        }
      });
    },
    { threshold: 0.35 }
  );

  animatedText.forEach((item, index) => {
    item.style.transitionDelay = `${index * 90}ms`;
    textObserver.observe(item);
  });
} else {
  animatedText.forEach((item) => item.classList.add("in-view"));
}

if (window.ScrollReveal) {
  const reveal = ScrollReveal({
    distance: "28px",
    duration: 850,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    origin: "bottom",
    viewFactor: 0.15,
    // Keep the scroll fade animation intact. After each reveal completes,
    // ScrollReveal removes its injected inline transition styles so they
    // don't override/delay the CSS hover transitions (e.g. .btn).
    cleanup: true,
  });

  reveal.reveal(".hero__content > *", { interval: 90 });
  reveal.reveal(".avatar-card", { delay: 180 });
  reveal.reveal(".section__intro", { interval: 80 });
  reveal.reveal(".quickfacts, .timeline, .project__card, .minor-projects, .skill__group, .credential__grid article, .contact__card", {
    interval: 90,
  });
}

// ---- Side Rays: animated glowing rays sweeping from the bottom corners ----
(() => {
  const container = document.getElementById("side-rays");
  const canvas = document.getElementById("side-rays-canvas");
  if (!container || !canvas) return;

  const reduceMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const COLORS = [
    [67, 224, 179],
    [242, 196, 109],
    [255, 122, 144],
  ];

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = 0;
  let height = 0;
  let time = 0;
  let rafId = null;
  let running = false;

  const rays = [];

  const createRay = (fromLeft) => {
    const baseAngle = fromLeft ? Math.PI / 2 : -Math.PI / 2;
    return {
      fromLeft,
      baseAngle,
      angle: baseAngle + (Math.random() - 0.5) * 0.7,
      angleSpeed: (Math.random() - 0.5) * 0.02,
      sweep: 0.22 + Math.random() * 0.5,
      length: 0.5 + Math.random() * 0.5,
      width: 0.012 + Math.random() * 0.022,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.12 + Math.random() * 0.22,
      pulseSpeed: 0.5 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
    };
  };

  const initRays = () => {
    rays.length = 0;
    const count = Math.max(5, Math.min(16, Math.round(width / 140)));
    for (let i = 0; i < count; i += 1) {
      rays.push(createRay(i < count / 2));
    }
  };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initRays();
  };

  const drawRay = (ray, t) => {
    const pulse = 0.75 + 0.25 * Math.sin(t * ray.pulseSpeed + ray.phase);
    const angle = ray.baseAngle + ray.sweep * Math.sin(t * 0.4 + ray.phase);
    const tailLen = height * 1.5 * ray.length;
    const originX = width * (ray.fromLeft ? 0.06 : 0.94);
    const originY = height * 1.02;
    const cx = Math.cos(angle);
    const cy = Math.sin(angle);
    const tx = originX + cx * tailLen;
    const ty = originY + cy * tailLen;

    const [r, g, b] = ray.color;
    const alpha = ray.opacity * pulse;

    const grad = ctx.createLinearGradient(originX, originY, tx, ty);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    const baseWidth = Math.max(2, width * ray.width * (0.6 + pulse * 0.4));
    ctx.lineWidth = baseWidth;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.lineWidth = baseWidth * 0.4;
    ctx.strokeStyle = grad;
    ctx.globalAlpha = alpha * 0.55;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.restore();
  };

  const frame = (now) => {
    time = now * 0.001;
    ctx.clearRect(0, 0, width, height);
    rays.forEach((ray) => drawRay(ray, time));
    rafId = window.requestAnimationFrame(frame);
  };

  const start = () => {
    if (running) return;
    running = true;
    rafId = window.requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);

  if (reduceMotionPref) {
    ctx.fillStyle = "rgba(67, 224, 179, 0.14)";
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.3, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 122, 144, 0.12)";
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.7, 0);
    ctx.lineTo(width, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    start();
  }
})();
