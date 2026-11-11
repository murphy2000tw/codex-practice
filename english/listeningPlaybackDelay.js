// English-only scheduling. Keep speech synthesis and playback rules in each page.
window.EnglishListeningPlayback = (() => {
  const delayMs = 1000;
  let pending = null;
  let generation = 0;

  function cancel() {
    generation += 1;
    if (!pending) return;
    window.clearTimeout(pending.timer);
    pending.restore();
    pending = null;
  }

  function schedule(play, control = null) {
    // One pending request per page, including result lists with many replay buttons.
    if (pending) return false;
    const token = ++generation;
    const label = control?.textContent;
    const disabled = control?.disabled;
    const restore = () => {
      if (!control) return;
      control.textContent = label;
      control.removeAttribute("aria-busy");
      if ("disabled" in control) control.disabled = disabled;
    };
    if (control) {
      control.textContent = "準備播放…";
      control.setAttribute("aria-busy", "true");
      if ("disabled" in control) control.disabled = true;
    }
    const timer = window.setTimeout(() => {
      if (token !== generation) return;
      pending = null;
      restore();
      if (!control || control.isConnected) play();
    }, delayMs);
    pending = { timer, restore };
    return true;
  }

  window.addEventListener("pagehide", cancel);
  window.addEventListener("beforeunload", cancel);
  window.addEventListener("hashchange", cancel);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancel();
  });
  // Cancel at navigation intent, before the browser unloads the old document.
  document.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) cancel();
  }, true);
  return { schedule, cancel };
})();
