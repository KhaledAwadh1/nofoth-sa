// ============================================================
// Nofoth - site interactions
// ============================================================
(function () {
  "use strict";

  /* -------- Mobile nav toggle -------- */
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  const navList = document.getElementById("navList");

  if (header && toggle && navList) {
    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute(
        "aria-label",
        isOpen ? "إغلاق القائمة" : "فتح القائمة",
      );
    });

    // Close menu when a link is tapped (mobile)
    navList.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element && target.closest("a")) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!header.contains(e.target)) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* -------- Active nav link on scroll -------- */
  const links = document.querySelectorAll(".nav-link[href^='#']");
  const sections = Array.from(links)
    .map((link) => {
      const id = link.getAttribute("href").slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  /* -------- Sliding nav indicator (desktop) -------- */
  let indicator = null;
  if (navList && links.length) {
    indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navList.appendChild(indicator);
  }

  const isDesktopNav = () => window.matchMedia("(min-width: 769px)").matches;

  const moveIndicator = (link) => {
    if (!indicator || !navList || !link || !isDesktopNav()) return;
    const linkRect = link.getBoundingClientRect();
    const listRect = navList.getBoundingClientRect();
    const left = linkRect.left - listRect.left;
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.classList.add("is-ready");
  };

  const setActiveLink = (link) => {
    if (!link) return;
    links.forEach((l) => l.classList.remove("is-active"));
    link.classList.add("is-active");
    moveIndicator(link);
  };

  if ("IntersectionObserver" in window && sections.length) {
    const linkById = new Map();
    links.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      linkById.set(id, link);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const active = linkById.get(entry.target.id);
            if (active) setActiveLink(active);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // Initial position + reposition on resize / load
  const positionInitial = () => {
    const active = document.querySelector(".nav-link.is-active");
    if (active) moveIndicator(active);
  };
  window.addEventListener("load", positionInitial);
  window.addEventListener("resize", positionInitial);
  requestAnimationFrame(positionInitial);

  /* -------- Dynamic footer year -------- */
  const yearEl = document.getElementById("footerYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -------- Works video modal (YouTube) -------- */
  const videoModal = document.getElementById("videoModal");
  const videoIframe = document.getElementById("videoModalIframe");
  const videoTitle = document.getElementById("videoModalTitle");

  if (videoModal && videoIframe) {
    let lastFocused = null;

    const openVideo = (videoId, title) => {
      if (!videoId) return;
      const src =
        "https://www.youtube.com/embed/" +
        encodeURIComponent(videoId) +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      videoIframe.setAttribute("src", src);
      if (videoTitle && title) videoTitle.textContent = title;
      videoModal.classList.add("is-open");
      videoModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("video-modal-open");
      lastFocused = document.activeElement;
      const closeBtn = videoModal.querySelector(".video-modal-close");
      if (closeBtn instanceof HTMLElement) closeBtn.focus();
    };

    const closeVideo = () => {
      if (!videoModal.classList.contains("is-open")) return;
      videoModal.classList.remove("is-open");
      videoModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("video-modal-open");
      videoIframe.setAttribute("src", "");
      if (lastFocused instanceof HTMLElement) lastFocused.focus();
    };

    document.querySelectorAll(".work-card[data-video-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-video-id");
        const title = card.getAttribute("data-video-title") || "";
        openVideo(id, title);
      });
    });

    videoModal.querySelectorAll("[data-video-close]").forEach((el) => {
      el.addEventListener("click", closeVideo);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeVideo();
    });
  }

  /* -------- Entrance animations -------- */
  const root = document.documentElement;
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Trigger hero / header load-in once layout + key assets are ready.
  const markLoaded = () => root.classList.add("is-loaded");
  if (document.readyState === "complete") {
    requestAnimationFrame(markLoaded);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(markLoaded), {
      once: true,
    });
    window.setTimeout(markLoaded, 1500);
  }

  // Declarative auto-reveal map
  const revealRules = [
    // Section headings
    { sel: ".section-title", variant: "up" },
    { sel: ".section-title-wrap", variant: "up" },

    // About
    { sel: ".about-text .eyebrow", variant: "up" },
    { sel: ".about-text .underline", variant: "scale" },
    { sel: ".about-text p", variant: "up" },
    { sel: ".about-cards-wrapper", variant: "up" },

    // Why us
    { sel: ".why-grid", stagger: true },
    { sel: ".why-grid .why-card", variant: "up" },

    // Services
    { sel: ".services-grid", stagger: true },
    { sel: ".services-grid .service-card", variant: "up" },

    // Works
    { sel: ".works-grid", stagger: true },
    { sel: ".works-grid .work-card", variant: "scale" },

    // Clients
    { sel: ".clients-logos", variant: "fade" },

    // Stats
    { sel: ".stats-grid", stagger: true },
    { sel: ".stats-grid .stat-card", variant: "up" },

    // Contact
    { sel: ".contact-card", variant: "scale" },

    // Footer
    { sel: ".footer-grid", stagger: true },
    { sel: ".footer-grid > *", variant: "up" },
    { sel: ".footer-bottom", variant: "fade" },
  ];

  const applyRules = () => {
    revealRules.forEach((rule) => {
      document.querySelectorAll(rule.sel).forEach((el) => {
        if (rule.stagger) el.setAttribute("data-stagger", "");
        if (rule.variant && !el.hasAttribute("data-reveal")) {
          el.setAttribute("data-reveal", rule.variant);
        }
      });
    });
  };
  applyRules();

  /* -------- Dynamic SVG Inlining for client logos -------- */
  const inlineLogosSvg = () => {
    const clientsLogosDiv = document.querySelector(".clients-logos");
    if (!clientsLogosDiv) return;
    const img = clientsLogosDiv.querySelector("img");
    if (!img) return;
    const src = img.getAttribute("src");
    if (!src || !src.endsWith(".svg")) return;

    fetch(src)
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("class", "partners-logos-svg");
        svg.setAttribute("alt", img.getAttribute("alt") || "");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "auto");
        svg.removeAttribute("style");

        img.parentNode.replaceChild(svg, img);

        const checkVisibility = () => {
          if (clientsLogosDiv.classList.contains("is-visible") || prefersReduced) {
            svg.classList.add("animate");
            window.clearInterval(pollInterval);
          }
        };

        const pollInterval = window.setInterval(checkVisibility, 50);
        checkVisibility();
      })
      .catch((err) => console.error("Error inlining SVG:", err));
  };
  inlineLogosSvg();

  /* -------- Dynamic SVG Inlining for about shapes -------- */
  const inlineAboutShapesSvg = () => {
    const aboutCardsWrapper = document.querySelector(".about-cards-wrapper");
    if (!aboutCardsWrapper) return;
    const img = aboutCardsWrapper.querySelector("img");
    if (!img) return;
    const src = img.getAttribute("src");
    if (!src || !src.endsWith(".svg")) return;

    fetch(src)
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("class", "about-shapes-svg");
        svg.setAttribute("alt", img.getAttribute("alt") || "");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "auto");
        svg.removeAttribute("style");

        img.parentNode.replaceChild(svg, img);

        const checkVisibility = () => {
          if (aboutCardsWrapper.classList.contains("is-visible") || prefersReduced) {
            svg.classList.add("animate");
            window.clearInterval(pollInterval);
          }
        };

        const pollInterval = window.setInterval(checkVisibility, 50);
        checkVisibility();
      })
      .catch((err) => console.error("Error inlining about shapes SVG:", err));
  };
  inlineAboutShapesSvg();

  if (prefersReduced || !("IntersectionObserver" in window)) {
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    },
  );

  document
    .querySelectorAll("[data-reveal]")
    .forEach((el) => revealObserver.observe(el));
})();

/* -------- Stats count-up -------- */
(function () {
  "use strict";
  const values = document.querySelectorAll(".stat-value[data-count-to]");
  if (!values.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const format = (n) =>
    Math.round(n)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (prefersReduced || !("IntersectionObserver" in window)) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute("data-count-to")) || 0;
    const suffix = el.getAttribute("data-count-suffix") || "";
    const duration = 2000;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let startTs = 0;
    const step = (ts) => {
      if (!startTs) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / duration);
      el.textContent = format(target * ease(progress)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  values.forEach((el) => {
    const suffix = el.getAttribute("data-count-suffix") || "";
    el.textContent = "0" + suffix;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );

  values.forEach((el) => observer.observe(el));

  /* -------- Equal section tag widths (longest title) -------- */
  const equalizeSectionTagWidths = () => {
    const tags = document.querySelectorAll(".section-tag");
    const root = document.documentElement;
    if (!tags.length) return;

    root.style.removeProperty("--section-tag-width");
    tags.forEach((tag) => {
      tag.style.width = "auto";
    });

    let maxWidth = 0;
    tags.forEach((tag) => {
      maxWidth = Math.max(maxWidth, Math.ceil(tag.scrollWidth));
    });

    tags.forEach((tag) => {
      tag.style.width = "";
    });

    if (maxWidth > 0) {
      root.style.setProperty("--section-tag-width", `${maxWidth}px`);
    }
  };

  let sectionTagWidthTimer = 0;
  const scheduleSectionTagWidths = () => {
    window.clearTimeout(sectionTagWidthTimer);
    sectionTagWidthTimer = window.setTimeout(equalizeSectionTagWidths, 100);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeSectionTagWidths);
  } else {
    equalizeSectionTagWidths();
  }
  window.addEventListener("resize", scheduleSectionTagWidths);
})();
