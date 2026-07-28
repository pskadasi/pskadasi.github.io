(() => {
  const config = window.SITE_CONFIG || {};
  const validTabs = new Set(
    Array.from(
      document.querySelectorAll("[data-panel]"),
      (panel) => panel.dataset.panel,
    ).filter(Boolean),
  );
  const fallbackTab = validTabs.has("about")
    ? "about"
    : validTabs.values().next().value;

  document.querySelectorAll("[data-site-name]").forEach((element) => {
    element.textContent = config.name || "Pritam Kadasi";
  });

  document.querySelectorAll("[data-role]").forEach((element) => {
    element.textContent = config.role || "AI Research Engineer at Logituit";
  });

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll("[data-email-link]").forEach((element) => {
    const email = config.email || "pritamkadasi@gmail.com";
    element.setAttribute("href", `mailto:${email}`);
    if (element.textContent.trim() !== "Email") element.textContent = email;
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const external =
      ["http:", "https:"].includes(url.protocol) &&
      url.origin !== window.location.origin;

    if (external) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  const themeButton = document.querySelector(".theme-button");
  const applyTheme = (useDark) => {
    document.documentElement.dataset.theme = useDark ? "dark" : "light";
    if (!themeButton) return;
    themeButton.querySelector("span").textContent = useDark ? "☀" : "◕";
    const label = useDark ? "Use light theme" : "Use dark theme";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  };

  const savedTheme = window.localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

  themeButton?.addEventListener("click", () => {
    const useDark = document.documentElement.dataset.theme !== "dark";
    applyTheme(useDark);
    window.localStorage.setItem("theme", useDark ? "dark" : "light");
  });

  const menuButton = document.querySelector(".menu-button");
  const navigation = document.querySelector(".site-nav");
  const researchGroup = document.querySelector("[data-research-menu]");
  const researchTrigger = document.querySelector("#research-menu-trigger");
  const researchSubmenu = document.querySelector("#research-submenu");
  const profileMenu = document.querySelector("[data-profile-menu]");
  const profileMenuTrigger = document.querySelector(
    "[data-profile-menu-trigger]",
  );
  const profileMenuPanel = document.querySelector("[data-profile-menu-panel]");
  const profileMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let profileMenuOpen = false;
  let profileMenuHideTimer;

  const closeMobileMenu = () => {
    navigation?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  const closeResearchMenu = () => {
    researchSubmenu?.classList.remove("open");
    researchTrigger?.setAttribute("aria-expanded", "false");
  };

  const finishProfileMenuClose = () => {
    if (!profileMenuPanel || profileMenuOpen) return;
    window.clearTimeout(profileMenuHideTimer);
    profileMenuPanel.hidden = true;
    profileMenuPanel.classList.remove("is-closing");
  };

  const openProfileMenu = () => {
    if (!profileMenuPanel || profileMenuOpen) return;
    profileMenuOpen = true;
    window.clearTimeout(profileMenuHideTimer);
    profileMenuPanel.hidden = false;
    profileMenuPanel.classList.remove("is-closing");
    profileMenuTrigger?.setAttribute("aria-expanded", "true");

    if (profileMotionQuery.matches) return;
    profileMenuPanel.classList.remove("is-opening");
    void profileMenuPanel.offsetWidth;
    profileMenuPanel.classList.add("is-opening");
  };

  const closeProfileMenu = () => {
    if (!profileMenuPanel || !profileMenuOpen) return;
    profileMenuOpen = false;
    profileMenuTrigger?.setAttribute("aria-expanded", "false");

    profileMenuPanel.classList.remove("is-opening");
    if (profileMotionQuery.matches) {
      finishProfileMenuClose();
      return;
    }

    void profileMenuPanel.offsetWidth;
    profileMenuPanel.classList.add("is-closing");
    window.clearTimeout(profileMenuHideTimer);
    profileMenuHideTimer = window.setTimeout(finishProfileMenuClose, 220);
  };

  profileMenuPanel?.addEventListener("animationend", (event) => {
    if (event.target !== profileMenuPanel) return;
    if (profileMenuPanel.classList.contains("is-closing")) {
      finishProfileMenuClose();
    } else {
      profileMenuPanel.classList.remove("is-opening");
    }
  });

  menuButton?.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  navigation?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeResearchMenu();
      closeMobileMenu();
    });
  });

  researchTrigger?.addEventListener("click", () => {
    const open = researchSubmenu.classList.toggle("open");
    researchTrigger.setAttribute("aria-expanded", String(open));
  });

  profileMenuTrigger?.addEventListener("click", () => {
    if (!profileMenuPanel) return;
    closeResearchMenu();
    closeMobileMenu();
    if (profileMenuOpen) closeProfileMenu();
    else openProfileMenu();
  });

  profileMenuPanel?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeProfileMenu);
  });

  document.addEventListener("mousedown", (event) => {
    if (researchGroup && !researchGroup.contains(event.target)) {
      closeResearchMenu();
    }
    if (profileMenu && !profileMenu.contains(event.target)) {
      closeProfileMenu();
    }
  });

  document.addEventListener("focusin", (event) => {
    if (
      profileMenuOpen &&
      profileMenu &&
      !profileMenu.contains(event.target)
    ) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const profileWasOpen = profileMenuOpen;
      const researchWasOpen = researchSubmenu?.classList.contains("open");
      const mobileWasOpen = navigation?.classList.contains("open");
      closeProfileMenu();
      closeResearchMenu();
      closeMobileMenu();
      if (profileWasOpen) profileMenuTrigger?.focus();
      else if (researchWasOpen) researchTrigger?.focus();
      else if (mobileWasOpen) menuButton?.focus();
    }
  });

  const selectTab = (tab, updateHash = true) => {
    if (validTabs.size === 0) return;
    if (!validTabs.has(tab)) {
      tab = fallbackTab;
      if (window.location.hash) {
        window.history.replaceState(null, "", `#${tab}`);
      }
    }

    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab;
    });

    document.querySelectorAll("[data-tab]").forEach((button) => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("active", active);
      if (button.getAttribute("role") === "tab") {
        button.setAttribute("aria-selected", String(active));
      }
    });

    const researchActive = ["research", "phd-work"].includes(tab);
    researchGroup?.classList.toggle("active", researchActive);

    document.querySelector(`[data-panel="${tab}"]`)?.scrollTo({ top: 0 });
    closeProfileMenu();
    closeResearchMenu();
    closeMobileMenu();

    if (updateHash) {
      window.history.replaceState(null, "", `#${tab}`);
    }

    window.dispatchEvent(
      new CustomEvent("site:tabchange", { detail: { tab } }),
    );
  };

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => selectTab(button.dataset.tab));
  });

  const syncTabFromHash = () => {
    selectTab(window.location.hash.slice(1) || "about", false);
  };
  if (validTabs.size > 0) {
    window.addEventListener("hashchange", syncTabFromHash);
    syncTabFromHash();
  }

  const gallery = document.querySelector("#memory-gallery");
  if (gallery) {
    const memories = Array.isArray(config.memories) ? config.memories : [];

    if (memories.length === 0) {
      ["Add image", "Add image", "Add image"].forEach((label) => {
        const message = document.createElement("div");
        message.className = "empty-message";
        message.textContent = label;
        gallery.appendChild(message);
      });
    } else {
      memories.forEach((memory) => {
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        image.src = memory.src;
        image.alt = memory.alt || "";
        image.loading = "lazy";
        figure.appendChild(image);

        if (memory.caption) {
          const caption = document.createElement("figcaption");
          caption.textContent = memory.caption;
          figure.appendChild(caption);
        }

        gallery.appendChild(figure);
      });
    }
  }
})();
