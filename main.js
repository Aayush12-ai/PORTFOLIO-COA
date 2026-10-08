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
  reveal.reveal(
    ".quickfacts, .timeline, .project__card, .minor-projects, .skill__group, .credential__grid article, .contact__card, .interest__card, .goal__card, .coa__panel, .gallery__card, .project-showcase-card",
    {
      interval: 90,
    }
  );
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

// ==========================================
// ---- Theme Toggle Controller (Light/Dark) ----
// ==========================================
(() => {
  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  const storedTheme = localStorage.getItem("portfolio_theme");
  const currentTheme = storedTheme || "dark";

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio_theme", theme);
    themeToggleBtns.forEach((btn) => {
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = theme === "light" ? "ri-moon-line" : "ri-sun-line";
      }
      btn.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
      btn.title = `Switch to ${theme === "light" ? "dark" : "light"} mode`;
    });
  };

  applyTheme(currentTheme);

  themeToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = activeTheme === "light" ? "dark" : "light";
      applyTheme(nextTheme);
    });
  });
})();

// ==========================================
// ---- COA Learning Tool: Conversion Logic ----
// ==========================================
(() => {
  const coaInput = document.getElementById("coa-input");
  const coaFrom = document.getElementById("coa-from");
  const coaTo = document.getElementById("coa-to");
  const coaSwap = document.getElementById("coa-swap");
  const coaConvertBtn = document.getElementById("coa-convert-btn");
  const coaError = document.getElementById("coa-error");
  const coaErrorMsg = document.getElementById("coa-error-msg");
  const coaResultCard = document.getElementById("coa-result-card");
  const coaResultVal = document.getElementById("coa-result-value");
  const coaResultBase = document.getElementById("coa-result-base");
  const coaCopyBtn = document.getElementById("coa-copy-btn");
  const coaToggleSteps = document.getElementById("coa-toggle-steps");
  const coaStepsContent = document.getElementById("coa-steps-content");
  const coaPrefix = document.getElementById("coa-prefix");
  const presetBtns = document.querySelectorAll(".coa__preset-btn");

  // Base Pill Selectors
  const fromPills = document.querySelectorAll(".base-pill[data-from]");
  const toPills = document.querySelectorAll(".base-pill[data-to]");

  // 4-in-1 Live Cards
  const liveBin = document.getElementById("live-bin");
  const liveOct = document.getElementById("live-oct");
  const liveDec = document.getElementById("live-dec");
  const liveHex = document.getElementById("live-hex");
  const liveCards = document.querySelectorAll(".coa__live-card");
  const bitStreamContainer = document.getElementById("coa-bit-stream");

  if (!coaInput || !coaFrom || !coaTo || !coaConvertBtn) return;

  const BASE_CONFIGS = {
    2: { name: "Binary", base: 2, prefix: "0b", radixName: "Base 2", placeholder: "e.g. 1010", helper: "Allowed digits: 0, 1", validRegex: /^[01]+$/, invalidMsg: "Invalid binary number. Please enter only 0 and 1." },
    8: { name: "Octal", base: 8, prefix: "0o", radixName: "Base 8", placeholder: "e.g. 77", helper: "Allowed digits: 0 to 7", validRegex: /^[0-7]+$/, invalidMsg: "Invalid octal number. Please enter only digits from 0 to 7." },
    10: { name: "Decimal", base: 10, prefix: "DEC", radixName: "Base 10", placeholder: "e.g. 255", helper: "Allowed digits: 0 to 9", validRegex: /^[0-9]+$/, invalidMsg: "Invalid decimal number. Please enter only digits from 0 to 9." },
    16: { name: "Hexadecimal", base: 16, prefix: "0x", radixName: "Base 16", placeholder: "e.g. 1A3F", helper: "Allowed digits: 0–9, A–F", validRegex: /^[0-9A-Fa-f]+$/, invalidMsg: "Invalid hexadecimal number. Please enter only characters 0-9 and A-F." },
  };

  const helperText = document.getElementById("coa-helper-text");

  const updatePrefix = () => {
    const fromBase = parseInt(coaFrom.value, 10);
    const cfg = BASE_CONFIGS[fromBase];
    if (cfg) {
      if (coaPrefix) coaPrefix.textContent = cfg.prefix;
      if (helperText) helperText.textContent = cfg.helper;
      if (coaInput && !coaInput.value) coaInput.placeholder = cfg.placeholder;
    }
  };

  coaFrom.addEventListener("change", () => {
    updatePrefix();
    hideError();
    convertNumber();
  });

  coaTo.addEventListener("change", () => {
    hideError();
    convertNumber();
  });

  if (coaSwap) {
    coaSwap.addEventListener("click", () => {
      const temp = coaFrom.value;
      coaFrom.value = coaTo.value;
      coaTo.value = temp;
      updatePrefix();
      if (coaResultVal && coaResultVal.textContent && coaResultVal.textContent !== "—" && !coaError?.classList.contains("active")) {
        coaInput.value = coaResultVal.textContent.trim().replace(/\s+/g, "");
      }
      hideError();
      convertNumber();
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.val;
      const from = btn.dataset.from;
      const to = btn.dataset.to;
      if (from) coaFrom.value = from;
      if (to) coaTo.value = to;
      if (val) coaInput.value = val;
      updatePrefix();
      convertNumber();
    });
  });

  function showError(msg) {
    if (coaError && coaErrorMsg) {
      coaErrorMsg.textContent = msg;
      coaError.classList.add("active");
    }
    if (coaResultCard) coaResultCard.style.display = "none";
  }

  function hideError() {
    if (coaError) coaError.classList.remove("active");
  }

  if (coaToggleSteps && coaStepsContent) {
    coaToggleSteps.addEventListener("click", () => {
      const isHidden = coaStepsContent.style.display === "none" || !coaStepsContent.style.display;
      coaStepsContent.style.display = isHidden ? "flex" : "none";
      coaToggleSteps.classList.toggle("open", isHidden);
      const span = coaToggleSteps.querySelector("span");
      if (span) span.textContent = isHidden ? "Hide Step-by-Step Explanation" : "View Step-by-Step Explanation";
    });
  }

  if (coaCopyBtn && coaResultVal) {
    coaCopyBtn.addEventListener("click", () => {
      const text = coaResultVal.textContent.trim();
      if (!text || text === "—") return;
      navigator.clipboard.writeText(text).then(() => {
        const original = coaCopyBtn.innerHTML;
        coaCopyBtn.innerHTML = `<i class="ri-check-line" aria-hidden="true"></i> Copied!`;
        setTimeout(() => {
          coaCopyBtn.innerHTML = original;
        }, 2000);
      }).catch(() => {});
    });
  }

  // --- Step Builder ---
  function buildSteps(rawInput, fromBase, toBase, resultVal, decBigInt) {
    const fromCfg = BASE_CONFIGS[fromBase];
    const toCfg = BASE_CONFIGS[toBase];
    const steps = [];

    // Case 1: Same Base
    if (fromBase === toBase) {
      steps.push({
        title: "Direct Mapping (Same Radix)",
        math: `Source and target systems are both <strong>${fromCfg.name} (${fromCfg.radixName})</strong>.<br>Input value <code>${rawInput}</code> remains identical: <strong>${resultVal}</strong>.`
      });
      return steps;
    }

    // Case 2: From Any Base to Decimal (Positional Weighted Sum)
    if (toBase === 10) {
      const digits = rawInput.split("");
      const n = digits.length;
      const terms = [];
      const evaluatedTerms = [];
      let grandTotal = 0n;

      digits.forEach((d, idx) => {
        const power = BigInt(n - 1 - idx);
        const digitVal = BigInt(parseInt(d, fromBase));
        const placeWeight = BigInt(fromBase) ** power;
        const termVal = digitVal * placeWeight;
        grandTotal += termVal;
        terms.push(`<span style="color:var(--accent);">${d}</span> × ${fromBase}<sup>${power}</sup>`);
        evaluatedTerms.push(`${termVal.toString()}`);
      });

      let mathHtml = `<strong>Formula:</strong> Value = ∑ (d<sub>i</sub> × ${fromBase}<sup>i</sup>)<br><br>`;
      mathHtml += `<strong>1. Expanded Positional Polynomial:</strong><br>${terms.join(" + ")}<br><br>`;
      mathHtml += `<strong>2. Evaluated Place Values:</strong><br>= ${evaluatedTerms.join(" + ")}<br><br>`;
      mathHtml += `<strong>3. Decimal Sum:</strong><br>= <strong style="color:var(--dec-color);font-size:1.15rem;">${grandTotal.toString()}<sub>10</sub></strong>`;

      steps.push({
        title: `Convert ${fromCfg.name} to Decimal (Positional Weighting)`,
        math: mathHtml
      });
      return steps;
    }

    // Case 3: From Decimal to Any Base (Successive Division Algorithm)
    if (fromBase === 10) {
      let current = decBigInt;
      const baseBig = BigInt(toBase);
      const rows = [];
      let remDigits = [];

      if (current === 0n) {
        rows.push({ div: "0", base: toBase, quot: "0", rem: "0", digit: "0" });
        remDigits.push("0");
      } else {
        while (current > 0n) {
          const quot = current / baseBig;
          const rem = current % baseBig;
          let digitChar = rem.toString(toBase).toUpperCase();
          rows.push({
            div: current.toString(),
            base: toBase,
            quot: quot.toString(),
            rem: rem.toString(),
            digit: digitChar
          });
          remDigits.push(digitChar);
          current = quot;
        }
      }

      let tableHtml = `<strong>Method:</strong> Repeatedly divide the quotient by target base <code>${toBase}</code> and collect the remainders.<br><br>`;
      tableHtml += `<div style="overflow-x:auto;"><table class="coa__division-table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Dividend</th>
            <th>Divisor</th>
            <th>Quotient</th>
            <th>Remainder</th>
            <th>Digit Symbol</th>
          </tr>
        </thead>
        <tbody>`;

      rows.forEach((row, idx) => {
        const isMSB = idx === rows.length - 1 ? ' <span style="color:var(--accent);font-weight:800;">(MSB)</span>' : '';
        const isLSB = idx === 0 ? ' <span style="color:var(--muted);">(LSB)</span>' : '';
        tableHtml += `<tr>
          <td>#${idx + 1}</td>
          <td>${row.div}</td>
          <td>÷ ${row.base}</td>
          <td>${row.quot}</td>
          <td class="rem">${row.rem}${isLSB}${isMSB}</td>
          <td style="font-weight:700;color:var(--accent-2);">${row.digit}</td>
        </tr>`;
      });

      tableHtml += `</tbody></table></div>`;
      tableHtml += `<br><strong>Reading remainders from Bottom to Top (MSB → LSB):</strong><br>`;
      tableHtml += `Result = <strong style="color:var(--accent);font-size:1.15rem;">${remDigits.slice().reverse().join("")}<sub>${toBase}</sub></strong>`;

      steps.push({
        title: `Repeated Division by ${toBase} (Radix ${toCfg.radixName})`,
        math: tableHtml
      });
      return steps;
    }

    // Case 4: Binary to Octal (3-bit grouping)
    if (fromBase === 2 && toBase === 8) {
      const bin = rawInput;
      const padLen = (3 - (bin.length % 3)) % 3;
      const padded = "0".repeat(padLen) + bin;
      const groups = [];
      const octDigits = [];

      for (let i = 0; i < padded.length; i += 3) {
        const grp = padded.slice(i, i + 3);
        const octD = parseInt(grp, 2).toString(8);
        groups.push(grp);
        octDigits.push(octD);
      }

      let mathHtml = `<strong>Method: Grouping 3 bits from right-to-left (2³ = 8):</strong><br><br>`;
      if (padLen > 0) {
        mathHtml += `1. Padded binary to multiple of 3 bits: <code>${padded}</code><br><br>`;
      }
      mathHtml += `2. Binary 3-bit groups: [ <span style="color:var(--bin-color);">${groups.join("</span> ] [ <span style=\"color:var(--bin-color);\">")}</span> ]<br><br>`;
      mathHtml += `3. Converted each 3-bit group to Octal digit:<br>`;
      groups.forEach((g, idx) => {
        mathHtml += `&nbsp;&nbsp;• <code>${g}₂</code> → <strong style="color:var(--oct-color);">${octDigits[idx]}₈</strong><br>`;
      });
      mathHtml += `<br>Combined result = <strong style="color:var(--oct-color);font-size:1.15rem;">${resultVal}₈</strong>`;

      steps.push({
        title: "Binary to Octal Direct 3-Bit Grouping",
        math: mathHtml
      });
      return steps;
    }

    // Case 5: Binary to Hexadecimal (4-bit nibble grouping)
    if (fromBase === 2 && toBase === 16) {
      const bin = rawInput;
      const padLen = (4 - (bin.length % 4)) % 4;
      const padded = "0".repeat(padLen) + bin;
      const groups = [];
      const hexDigits = [];

      for (let i = 0; i < padded.length; i += 4) {
        const grp = padded.slice(i, i + 4);
        const hexD = parseInt(grp, 2).toString(16).toUpperCase();
        groups.push(grp);
        hexDigits.push(hexD);
      }

      let mathHtml = `<strong>Method: Grouping 4 bits (Nibbles) from right-to-left (2⁴ = 16):</strong><br><br>`;
      if (padLen > 0) {
        mathHtml += `1. Padded binary to multiple of 4 bits: <code>${padded}</code><br><br>`;
      }
      mathHtml += `2. Binary 4-bit nibbles: [ <span style="color:var(--bin-color);">${groups.join("</span> ] [ <span style=\"color:var(--bin-color);\">")}</span> ]<br><br>`;
      mathHtml += `3. Converted each nibble to Hexadecimal digit:<br>`;
      groups.forEach((g, idx) => {
        mathHtml += `&nbsp;&nbsp;• <code>${g}₂</code> → <strong style="color:var(--hex-color);">${hexDigits[idx]}₁₆</strong> (${parseInt(g, 2)} in decimal)<br>`;
      });
      mathHtml += `<br>Combined result = <strong style="color:var(--hex-color);font-size:1.15rem;">${resultVal}₁₆</strong>`;

      steps.push({
        title: "Binary to Hexadecimal Direct 4-Bit Nibble Grouping",
        math: mathHtml
      });
      return steps;
    }

    // Case 6: Octal to Binary (3-bit expansion)
    if (fromBase === 8 && toBase === 2) {
      const digits = rawInput.split("");
      let mathHtml = `<strong>Method: Expand each Octal digit into 3 binary bits:</strong><br><br>`;
      digits.forEach((d) => {
        const bin3 = parseInt(d, 8).toString(2).padStart(3, "0");
        mathHtml += `&nbsp;&nbsp;• Digit <code>${d}₈</code> → <strong style="color:var(--bin-color);">${bin3}₂</strong><br>`;
      });
      mathHtml += `<br>Concatenated Binary = <strong style="color:var(--bin-color);font-size:1.15rem;">${resultVal}₂</strong>`;

      steps.push({
        title: "Octal to Binary 3-Bit Expansion",
        math: mathHtml
      });
      return steps;
    }

    // Case 7: Hexadecimal to Binary (4-bit expansion)
    if (fromBase === 16 && toBase === 2) {
      const digits = rawInput.split("");
      let mathHtml = `<strong>Method: Expand each Hexadecimal digit into 4 binary bits:</strong><br><br>`;
      digits.forEach((d) => {
        const bin4 = parseInt(d, 16).toString(2).padStart(4, "0");
        mathHtml += `&nbsp;&nbsp;• Digit <code>${d}₁₆</code> (${parseInt(d, 16)}) → <strong style="color:var(--bin-color);">${bin4}₂</strong><br>`;
      });
      mathHtml += `<br>Concatenated Binary = <strong style="color:var(--bin-color);font-size:1.15rem;">${resultVal}₂</strong>`;

      steps.push({
        title: "Hexadecimal to Binary 4-Bit Expansion",
        math: mathHtml
      });
      return steps;
    }

    // Case 8: Octal <-> Hexadecimal (Bridge via Binary/Decimal)
    if ((fromBase === 8 && toBase === 16) || (fromBase === 16 && toBase === 8)) {
      const intermediateBin = decBigInt.toString(2);
      let mathHtml = `<strong>Architecture Bridge via Binary:</strong><br><br>`;
      mathHtml += `<strong>Stage 1:</strong> Convert ${fromCfg.name} (<code>${rawInput}</code>) to Binary:<br>`;
      mathHtml += `= <code style="color:var(--bin-color);">${intermediateBin}₂</code> (Decimal value: ${decBigInt.toString()})<br><br>`;
      mathHtml += `<strong>Stage 2:</strong> Convert Binary (<code>${intermediateBin}₂</code>) to ${toCfg.name}:<br>`;
      mathHtml += `= <strong style="color:var(--accent);font-size:1.15rem;">${resultVal}<sub>${toBase}</sub></strong>`;

      steps.push({
        title: `${fromCfg.name} to ${toCfg.name} via Binary Bridge`,
        math: mathHtml
      });
      return steps;
    }

    return steps;
  }

  function updateBitVisualizer(binStr) {
    if (!bitStreamContainer) return;
    const cleanBin = binStr.replace(/\s+/g, "");
    if (!/^[01]+$/.test(cleanBin)) {
      bitStreamContainer.style.display = "none";
      return;
    }

    // Pad to multiple of 4 bits for clean nibble representation
    const padLen = (4 - (cleanBin.length % 4)) % 4;
    const padded = "0".repeat(padLen) + cleanBin;
    const nibbles = [];

    for (let i = 0; i < padded.length; i += 4) {
      nibbles.push(padded.slice(i, i + 4));
    }

    const totalBits = padded.length;
    let html = `<div style="width:100%;font-size:0.8rem;font-weight:700;color:var(--bin-color);margin-bottom:0.5rem;display:flex;justify-content:space-between;">
      <span>Bit Level Decomposition (${cleanBin.length}-bit value / ${nibbles.length} nibble${nibbles.length > 1 ? 's' : ''})</span>
      <span style="color:var(--muted);font-weight:400;">MSB → LSB</span>
    </div>`;

    html += `<div style="display:flex;flex-wrap:wrap;gap:0.75rem;">`;

    nibbles.forEach((nib, nIdx) => {
      html += `<div class="coa__bit-nibble">`;
      for (let bitIdx = 0; bitIdx < 4; bitIdx++) {
        const bitChar = nib[bitIdx];
        const overallPower = totalBits - 1 - (nIdx * 4 + bitIdx);
        const isOn = bitChar === "1";
        html += `<div class="coa__bit-box ${isOn ? "on" : "off"}" title="2^${overallPower} = ${2n ** BigInt(overallPower)}">
          <span>${bitChar}</span>
          <span class="coa__bit-power">2<sup>${overallPower}</sup></span>
        </div>`;
      }
      html += `</div>`;
    });

    html += `</div>`;
    bitStreamContainer.innerHTML = html;
    bitStreamContainer.style.display = "flex";
  }

  function convertNumber() {
    hideError();
    const rawVal = coaInput.value.trim().toUpperCase();
    const fromBase = parseInt(coaFrom.value, 10);
    const toBase = parseInt(coaTo.value, 10);

    if (!rawVal) {
      showError("Please enter a number to convert.");
      return;
    }

    const cfg = BASE_CONFIGS[fromBase];
    if (!cfg || !cfg.validRegex.test(rawVal)) {
      showError(cfg.invalidMsg);
      return;
    }

    let parsedBigInt;
    try {
      if (fromBase === 2) parsedBigInt = BigInt("0b" + rawVal);
      else if (fromBase === 8) parsedBigInt = BigInt("0o" + rawVal);
      else if (fromBase === 10) parsedBigInt = BigInt(rawVal);
      else if (fromBase === 16) parsedBigInt = BigInt("0x" + rawVal);
    } catch (err) {
      showError("Error parsing input. Please verify that the number is formatted correctly.");
      return;
    }

    const binVal = parsedBigInt.toString(2);
    const octVal = parsedBigInt.toString(8);
    const decVal = parsedBigInt.toString(10);
    const hexVal = parsedBigInt.toString(16).toUpperCase();
    // Compute and route converted result based on target base
    let convertedResult = "";
    if (toBase === 2) convertedResult = binVal;
    else if (toBase === 8) convertedResult = octVal;
    else if (toBase === 10) convertedResult = decVal;
    else if (toBase === 16) convertedResult = hexVal;

    // Display Result in main focused card
    if (coaResultVal) coaResultVal.textContent = convertedResult;
    if (coaResultBase) {
      const targetCfg = BASE_CONFIGS[toBase];
      coaResultBase.textContent = `(${targetCfg.name} / ${targetCfg.radixName})`;
    }

    // Build & render steps
    const steps = buildSteps(rawVal, fromBase, toBase, convertedResult, parsedBigInt);
    if (coaStepsContent) {
      coaStepsContent.innerHTML = steps
        .map(
          (st) => `
        <div class="coa__step-block">
          <div class="coa__step-heading">${st.title}</div>
          <div class="coa__step-math">${st.math}</div>
        </div>
      `
        )
        .join("");
    }

    if (coaResultCard) coaResultCard.style.display = "block";
  }

  coaConvertBtn.addEventListener("click", convertNumber);
  coaInput.addEventListener("input", () => {
    if (coaInput.value.trim()) {
      convertNumber();
    }
  });

  coaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      convertNumber();
    }
  });

  updatePrefix();
  // Perform initial default conversion on load
  if (coaInput.value.trim()) {
    convertNumber();
  }
})();

// ==========================================
// ---- Filter Tabs Logic (Gallery & Projects) ----
// ==========================================
(() => {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryCards = document.querySelectorAll(".gallery__card[data-category]");
  const projectCards = document.querySelectorAll(".project-showcase-card[data-category]");

  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      if (galleryCards.length) {
        galleryCards.forEach((card) => {
          const cat = card.dataset.category || "";
          const cats = cat.split(/\s+/);
          if (filter === "all" || cats.includes(filter)) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      }

      if (projectCards.length) {
        projectCards.forEach((card) => {
          const cat = card.dataset.category || "";
          const cats = cat.split(/\s+/);
          if (filter === "all" || cats.includes(filter)) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      }
    });
  });
})();

// ==========================================
// ---- Interactive Box Ladder Controller ----
// ==========================================
(() => {
  const ladderRungs = document.querySelectorAll(".ladder-rung");
  const btnLadderView = document.getElementById("btn-view-ladder");
  const btnGridView = document.getElementById("btn-view-grid");
  const boxLadder = document.getElementById("box-ladder");
  const goalsGrid = document.getElementById("goals-grid");

  if (!ladderRungs.length && !btnLadderView) return;

  // View Switcher (Ladder vs Grid)
  if (btnLadderView && btnGridView && boxLadder && goalsGrid) {
    btnLadderView.addEventListener("click", () => {
      btnLadderView.classList.add("active");
      btnGridView.classList.remove("active");
      boxLadder.classList.remove("hidden-view");
      goalsGrid.classList.remove("active-view");
    });

    btnGridView.addEventListener("click", () => {
      btnGridView.classList.add("active");
      btnLadderView.classList.remove("active");
      boxLadder.classList.add("hidden-view");
      goalsGrid.classList.add("active-view");
    });
  }

  // Interactive Rung Expansion & Focus
  ladderRungs.forEach((rung) => {
    const toggleRung = () => {
      const isCurrentlyActive = rung.classList.contains("active");
      rung.classList.toggle("active", !isCurrentlyActive);
      rung.setAttribute("aria-expanded", String(!isCurrentlyActive));
    };

    rung.addEventListener("click", toggleRung);

    rung.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleRung();
      }
    });
  });
})();

