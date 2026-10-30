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
  const artifactDialog = document.querySelector("[data-artifact-dialog]");
  const artifactDialogLabel = document.querySelector(
    "[data-artifact-dialog-label]",
  );
  const artifactDialogTitle = document.querySelector(
    "[data-artifact-dialog-title]",
  );
  let artifactFrame = document.querySelector("[data-artifact-frame]");
  const artifactOriginalLink = document.querySelector(
    "[data-artifact-original-link]",
  );
  const artifactDownloadLink = document.querySelector(
    "[data-artifact-download-link]",
  );
  const artifactCloseButton = document.querySelector("[data-artifact-close]");
  const profileMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let profileMenuOpen = false;
  let profileMenuHideTimer;
  let nowHistoryOpen = false;
  let nowHistoryHideTimer;
  let artifactTrigger;

  const configureArtifactTrigger = (trigger, artifact) => {
    if (!trigger || !artifact?.preview) return false;
    trigger.classList.add("artifact-viewer-trigger");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.dataset.artifactKind = artifact.kind || "document";
    trigger.dataset.artifactLabel = artifact.label || "Document";
    trigger.dataset.artifactPreview = artifact.preview;
    trigger.dataset.artifactOriginal = artifact.original || artifact.preview;
    trigger.dataset.artifactDownload = artifact.download || artifact.preview;
    trigger.dataset.artifactTitle =
      artifact.title || trigger.textContent.trim() || artifact.label;
    return true;
  };

  const inferArtifactFromLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return null;
    if (link.hasAttribute("data-artifact-bypass")) return null;
    if (link.dataset.artifactPreview) return null;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return null;
    }

    const normalizedPath = url.pathname.replace(/\/$/, "");
    const normalizedUrl = `${url.origin}${normalizedPath}`;
    const title = link.textContent.trim();

    if (
      normalizedUrl ===
      "https://ojs.aaai.org/index.php/ICWSM/article/view/35855"
    ) {
      return {
        kind: "document",
        label: "Paper",
        title,
        original: url.href,
        preview: "https://arxiv.org/pdf/2503.15222",
        download:
          "https://ojs.aaai.org/index.php/ICWSM/article/download/35855/38009",
      };
    }

    if (url.hostname === "arxiv.org") {
      const match = normalizedPath.match(/^\/(?:abs|pdf)\/([^/]+?)(?:\.pdf)?$/);
      if (match) {
        const identifier = match[1];
        return {
          kind: "document",
          label: "Preprint",
          title,
          original: `https://arxiv.org/abs/${identifier}`,
          preview: `https://arxiv.org/pdf/${identifier}`,
          download: `https://arxiv.org/pdf/${identifier}`,
        };
      }
    }

    if (url.hostname === "aclanthology.org") {
      const identifier = normalizedPath.match(/^\/(\d{4}\.[^/]+?)(?:\.pdf)?$/)?.[1];
      if (identifier) {
        return {
          kind: "document",
          label: "Paper",
          title,
          original: `https://aclanthology.org/${identifier}/`,
          preview: `https://aclanthology.org/${identifier}.pdf`,
          download: `https://aclanthology.org/${identifier}.pdf`,
        };
      }
    }

    if (url.hostname === "drive.google.com") {
      const fileId = normalizedPath.match(/^\/file\/d\/([^/]+)/)?.[1];
      if (fileId) {
        return {
          kind: "document",
          label: /thesis/i.test(title) ? "Thesis" : "Document",
          title,
          original: url.href,
          preview: `https://drive.google.com/file/d/${fileId}/preview`,
          download: `https://drive.google.com/uc?export=download&id=${fileId}`,
        };
      }
    }

    return null;
  };

  document.querySelectorAll("a[href]").forEach((link) => {
    const artifact = inferArtifactFromLink(link);
    if (artifact) configureArtifactTrigger(link, artifact);
  });

  const closeArtifactViewer = () => {
    if (artifactDialog?.open) artifactDialog.close();
  };

  const openArtifactViewer = (trigger) => {
    const previewUrl = trigger.dataset.artifactPreview;
    const originalUrl = trigger.dataset.artifactOriginal || previewUrl;
    if (!previewUrl) return;

    if (!artifactDialog?.showModal) {
      window.open(originalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    artifactTrigger = trigger;
    const kind = trigger.dataset.artifactKind || "document";
    const label = trigger.dataset.artifactLabel || "Document";
    const title = trigger.dataset.artifactTitle || label;
    artifactDialog.dataset.artifactKind = kind;
    if (artifactDialogLabel) artifactDialogLabel.textContent = label;
    if (artifactDialogTitle) artifactDialogTitle.textContent = title;
    if (artifactFrame) {
      const freshFrame = artifactFrame.cloneNode(false);
      artifactFrame.replaceWith(freshFrame);
      artifactFrame = freshFrame;
      artifactFrame.src = previewUrl;
      artifactFrame.title = `${label}: ${title}`;
    }
    if (artifactOriginalLink) artifactOriginalLink.href = originalUrl;
    if (artifactDownloadLink) {
      artifactDownloadLink.href =
        trigger.dataset.artifactDownload || previewUrl;
    }
    artifactDialog.showModal();
  };

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target.closest("a, button");
    if (!target) return;
    if (!target.dataset.artifactPreview && target instanceof HTMLAnchorElement) {
      const artifact = inferArtifactFromLink(target);
      if (artifact) configureArtifactTrigger(target, artifact);
    }
    if (!target.classList.contains("artifact-viewer-trigger")) return;
    event.preventDefault();
    openArtifactViewer(target);
  });

  artifactCloseButton?.addEventListener("click", closeArtifactViewer);

  artifactDialog?.addEventListener("click", (event) => {
    if (event.target === artifactDialog) closeArtifactViewer();
  });

  artifactDialog?.addEventListener("close", () => {
    if (artifactDialog.open) return;
    if (artifactFrame) artifactFrame.removeAttribute("src");
    delete artifactDialog.dataset.artifactKind;
    artifactTrigger?.focus();
    artifactTrigger = undefined;
  });

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
