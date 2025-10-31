(function () {
  const navbar = document.getElementById("site-navbar");
  const navbarInner = document.querySelector(".navbar-inner");

  // Configuration
  const config = {
    shrinkAt: 200,
    initialMaxWidth: 1180,
    shrunkMaxWidth: 850,
    initialPadding: "16px 48px",
    shrunkPadding: "8px 28px",
    initialScale: 1,
    shrunkScale: 0.88,
  };

  // Responsive breakpoints
  const breakpoints = {
    mobile: 640,
    tablet: 800,
    desktop: 1024,
  };

  let lastKnownScroll = 0;
  let ticking = false;
  let currentBreakpoint = "desktop";

  function getBreakpoint() {
    const width = window.innerWidth;
    if (width <= breakpoints.mobile) return "mobile";
    if (width <= breakpoints.tablet) return "tablet";
    if (width <= breakpoints.desktop) return "desktop-small";
    return "desktop";
  }

  function updateResponsiveConfig() {
    const breakpoint = getBreakpoint();

    if (breakpoint !== currentBreakpoint) {
      currentBreakpoint = breakpoint;

      // Adjust config based on breakpoint
      switch (breakpoint) {
        case "mobile":
          config.shrinkAt = 100;
          config.shrunkScale = 0.96;
          break;
        case "tablet":
          config.shrinkAt = 150;
          config.shrunkScale = 0.92;
          break;
        case "desktop-small":
          config.shrinkAt = 180;
          config.shrunkScale = 0.9;
          break;
        default:
          config.shrinkAt = 200;
          config.shrunkScale = 0.88;
      }

      // Re-evaluate scroll state
      onScroll();
    }
  }

  function updateNavbarSize(scrolled) {
    if (!navbarInner) return;

    if (scrolled) {
      navbar.classList.add("shrink");
      document.body.classList.add("scrolled");
      navbarInner.classList.add("hide-icons");
      navbarInner.style.maxWidth = `${config.shrunkMaxWidth}px`;
      navbarInner.style.padding = config.shrunkPadding;
      navbarInner.style.transform = `scale(${config.shrunkScale})`;
    } else {
      navbar.classList.remove("shrink");
      document.body.classList.remove("scrolled");
      navbarInner.classList.remove("hide-icons");
      navbarInner.style.maxWidth = `${config.initialMaxWidth}px`;
      navbarInner.style.padding = config.initialPadding;
      navbarInner.style.transform = `scale(${config.initialScale})`;
    }
  }

  function onScroll() {
    lastKnownScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const shouldShrink = lastKnownScroll > config.shrinkAt;
        updateNavbarSize(shouldShrink);
        ticking = false;
      });
      ticking = true;
    }
  }

  // ✅ New function: hide icons when screen width ≤ 950px
  function updateIconVisibility() {
    const icons = document.querySelectorAll(".navbar-inner .icon");
    if (!icons.length) return;

    if (window.innerWidth <= 950) {
      icons.forEach((icon) => (icon.style.display = "none"));
    } else {
      icons.forEach((icon) => (icon.style.display = ""));
    }
  }

  // Enhanced navbar controls
  (function initNavControls() {
    function closeAll() {
      document
        .querySelectorAll(".dropdown .dropdown-menu.show")
        .forEach((m) => m.classList.remove("show"));
    }

    // Dropdown handling
    document.addEventListener(
      "click",
      function (e) {
        const toggle = e.target.closest(".dropdown .dropdown-toggle");
        if (toggle) {
          const dropdown = toggle.closest(".dropdown");
          const menu = dropdown.querySelector(".dropdown-menu");
          const isShown = menu.classList.contains("show");
          closeAll();
          if (!isShown) menu.classList.add("show");
          e.preventDefault();
          return;
        }
        if (!e.target.closest(".dropdown")) closeAll();
      },
      { capture: false }
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAll();
        closeMobileMenu();
      }
    });

    // Mobile toggle
    const toggle = document.getElementById("navToggle");
    const navLeft = document.getElementById("navLeft");
    const navRight = document.getElementById("navRight");

    function closeMobileMenu() {
      if (toggle) {
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      }
      if (navLeft) navLeft.classList.remove("mobile-open");
      if (navRight) navRight.classList.remove("mobile-open");
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }

    function openMobileMenu() {
      if (toggle) {
        toggle.classList.add("active");
        toggle.setAttribute("aria-expanded", "true");
      }
      if (navLeft) navLeft.classList.add("mobile-open");
      if (navRight) navRight.classList.add("mobile-open");
      document.body.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    }

    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        const expanded = this.getAttribute("aria-expanded") === "true";

        if (expanded) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (e) {
      if (window.innerWidth <= 640) {
        const isNavClick = e.target.closest("#site-navbar");
        const isMenuOpen =
          navLeft?.classList.contains("mobile-open") ||
          navRight?.classList.contains("mobile-open");

        if (!isNavClick && isMenuOpen) {
          closeMobileMenu();
        }
      }
    });

    // Close mobile menu on link click
    document.querySelectorAll(".nav-left a, .nav-right a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 640) {
          closeMobileMenu();
        }
      });
    });

    // Close menu on resize if going above mobile breakpoint
    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) {
        closeMobileMenu();
      }
    });

    // Expose close function globally
    window.closeMobileMenu = closeMobileMenu;
  })();

  // Public API
  window.navbarControls = {
    setShrinkThreshold: (pixels) => {
      config.shrinkAt = pixels;
      onScroll();
    },
    setShrunkSize: (maxWidth, padding = null) => {
      config.shrunkMaxWidth = maxWidth;
      if (padding) config.shrunkPadding = padding;
      if (lastKnownScroll > config.shrinkAt) {
        updateNavbarSize(true);
      }
    },
    setInitialSize: (maxWidth, padding = null) => {
      config.initialMaxWidth = maxWidth;
      if (padding) config.initialPadding = padding;
      if (lastKnownScroll <= config.shrinkAt) {
        updateNavbarSize(false);
      }
    },
    setShrunkScale: (scale) => {
      config.shrunkScale = scale;
      if (lastKnownScroll > config.shrinkAt) {
        updateNavbarSize(true);
      }
    },
    getConfig: () => ({ ...config }),
    forceShrink: () => updateNavbarSize(true),
    forceExpand: () => updateNavbarSize(false),
  };

  // Initialize
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Handle window resize with debouncing
  let resizeTimeout;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateResponsiveConfig();
        updateIconVisibility(); // ✅ Check icon visibility on resize
        onScroll();
      }, 150);
    },
    { passive: true }
  );

  // Initial responsive config
  updateResponsiveConfig();
  updateIconVisibility(); // ✅ Initial icon visibility check
})();
