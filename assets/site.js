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
  const nowHistory = document.querySelector("[data-now-history]");
  const nowHistoryTrigger = document.querySelector(
    "[data-now-history-trigger]",
  );
  const nowHistoryPanel = document.querySelector("[data-now-history-panel]");
  const profileMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let profileMenuOpen = false;
  let profileMenuHideTimer;
  let nowHistoryOpen = false;
  let nowHistoryHideTimer;

  const closeMobileMenu = () => {
    navigation?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
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

  const positionNowHistoryPanel = () => {
    if (!nowHistoryPanel || !nowHistoryTrigger || nowHistoryPanel.hidden) return;

    const triggerRect = nowHistoryTrigger.getBoundingClientRect();
    const footerTop =
      document.querySelector("footer")?.getBoundingClientRect().top ||
      window.innerHeight;
    const margin = 18;
    const gap = 8;
    const panelWidth = nowHistoryPanel.offsetWidth;
    const panelHeight = nowHistoryPanel.offsetHeight;
    const maximumLeft = window.innerWidth - margin - panelWidth;
    const rightSpace = window.innerWidth - margin - triggerRect.right;
    const placeBeside = rightSpace >= panelWidth + gap;
    let left;
    let top;

    if (placeBeside) {
      left = triggerRect.right + gap;
      top = Math.max(
        margin,
        Math.min(triggerRect.top, footerTop - margin - panelHeight),
      );
    } else {
      left = Math.max(
        margin,
        Math.min(triggerRect.right - panelWidth, maximumLeft),
      );
      const belowTop = triggerRect.bottom + gap;
      const belowSpace = footerTop - margin - belowTop;
      const aboveSpace = triggerRect.top - margin - gap;
      top =
        panelHeight > belowSpace && aboveSpace > belowSpace
          ? Math.max(margin, triggerRect.top - gap - panelHeight)
          : belowTop;
    }

    nowHistoryPanel.style.left = `${Math.round(left)}px`;
    nowHistoryPanel.style.top = `${Math.round(top)}px`;
  };

  const finishNowHistoryClose = () => {
    if (!nowHistoryPanel || nowHistoryOpen) return;
    window.clearTimeout(nowHistoryHideTimer);
    nowHistoryPanel.hidden = true;
    nowHistoryPanel.classList.remove("is-closing");
  };

  const openNowHistory = () => {
    if (!nowHistoryPanel || nowHistoryOpen) return;
    nowHistoryOpen = true;
    window.clearTimeout(nowHistoryHideTimer);
    nowHistoryPanel.hidden = false;
    nowHistoryPanel.classList.remove("is-closing");
    nowHistoryTrigger?.setAttribute("aria-expanded", "true");
    positionNowHistoryPanel();

    if (profileMotionQuery.matches) return;
    nowHistoryPanel.classList.remove("is-opening");
    void nowHistoryPanel.offsetWidth;
    nowHistoryPanel.classList.add("is-opening");
  };

  const closeNowHistory = () => {
    if (!nowHistoryPanel || !nowHistoryOpen) return;
    nowHistoryOpen = false;
    nowHistoryTrigger?.setAttribute("aria-expanded", "false");
    nowHistoryPanel.classList.remove("is-opening");

    if (profileMotionQuery.matches) {
      finishNowHistoryClose();
      return;
    }

    void nowHistoryPanel.offsetWidth;
    nowHistoryPanel.classList.add("is-closing");
    window.clearTimeout(nowHistoryHideTimer);
    nowHistoryHideTimer = window.setTimeout(finishNowHistoryClose, 180);
  };

  nowHistoryPanel?.addEventListener("animationend", (event) => {
    if (event.target !== nowHistoryPanel) return;
    if (nowHistoryPanel.classList.contains("is-closing")) {
      finishNowHistoryClose();
    } else {
      nowHistoryPanel.classList.remove("is-opening");
    }
  });

  menuButton?.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
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

  nowHistoryTrigger?.addEventListener("click", () => {
    if (nowHistoryOpen) closeNowHistory();
    else openNowHistory();
  });

  profileMenuPanel?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeProfileMenu);
  });

  document.addEventListener("mousedown", (event) => {
    if (
      navigation?.classList.contains("open") &&
      !navigation.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      closeMobileMenu();
    }
    if (researchGroup && !researchGroup.contains(event.target)) {
      closeResearchMenu();
    }
    if (profileMenu && !profileMenu.contains(event.target)) {
      closeProfileMenu();
    }
    if (nowHistory && !nowHistory.contains(event.target)) {
      closeNowHistory();
    }
  });

  document.addEventListener("focusin", (event) => {
    if (
      navigation?.classList.contains("open") &&
      !navigation.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      closeMobileMenu();
    }
    if (
      profileMenuOpen &&
      profileMenu &&
      !profileMenu.contains(event.target)
    ) {
      closeProfileMenu();
    }
    if (
      nowHistoryOpen &&
      nowHistory &&
      !nowHistory.contains(event.target)
    ) {
      closeNowHistory();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const profileWasOpen = profileMenuOpen;
      const nowHistoryWasOpen = nowHistoryOpen;
      const researchWasOpen = researchSubmenu?.classList.contains("open");
      const mobileWasOpen = navigation?.classList.contains("open");
      closeProfileMenu();
      closeNowHistory();
      closeResearchMenu();
      closeMobileMenu();
      if (profileWasOpen) profileMenuTrigger?.focus();
      else if (nowHistoryWasOpen) nowHistoryTrigger?.focus();
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
    closeNowHistory();
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

  window.addEventListener("resize", () => {
    if (nowHistoryOpen) positionNowHistoryPanel();
  });

  document.addEventListener(
    "scroll",
    (event) => {
      if (
        nowHistoryOpen &&
        nowHistoryPanel &&
        !nowHistoryPanel.contains(event.target)
      ) {
        closeNowHistory();
      }
    },
    true,
  );

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
