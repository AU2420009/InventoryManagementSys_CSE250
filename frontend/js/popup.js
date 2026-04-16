// Global popup utility (shared across admin/staff/customer pages)
// Matches the popup UI used in `frontend/js/auth.js`.
(function () {
  function ensureStyles() {
    if (document.getElementById("custom-popup-styles")) return;

    const styles = document.createElement("style");
    styles.id = "custom-popup-styles";
    styles.innerHTML = `
      @keyframes popup-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

      .popup-spinner {
        width: 60px; height: 60px; border-radius: 50%;
        border-width: 5px; border-style: dotted;
        position: relative; animation: popup-spin 1.5s linear infinite;
      }

      .popup-icon-container::before, .popup-icon-container::after {
        content: ''; position: absolute; border-radius: 50%; opacity: 0.8;
      }

      .popup-icon-container::before {
        width: 15px; height: 15px; background: #f59e0b; top: 10px; left: 10px;
      }

      .popup-icon-container::after {
        width: 12px; height: 12px; background: #3b82f6; bottom: 10px; right: 10px;
      }

      .popup-shape-3 {
        width: 20px; height: 20px; border: 3px solid #a855f7; border-radius: 50%;
        position: absolute; top: 5px; right: 20px; opacity: 0.8;
      }
    `;
    document.head.appendChild(styles);
  }

  function showPopup(message, type) {
    if (typeof document === "undefined") return;

    ensureStyles();

    const existing = document.getElementById("custom-popup-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "custom-popup-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999",
      backdropFilter: "blur(2px)",
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      backgroundColor: "#fff",
      padding: "30px 40px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      textAlign: "center",
      minWidth: "320px",
      maxWidth: "80%",
      fontFamily: "sans-serif",
    });

    const popupType = type === "error" ? "error" : "success";

    const iconContainer = document.createElement("div");
    iconContainer.className = `popup-icon-container ${popupType}`;
    Object.assign(iconContainer.style, {
      width: "100px",
      height: "100px",
      position: "relative",
      margin: "0 auto 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });

    const spinner = document.createElement("div");
    spinner.className = "popup-spinner";
    Object.assign(spinner.style, {
      borderColor: popupType === "success" ? "#22c55e" : "#ef4444",
    });

    const shape3 = document.createElement("div");
    shape3.className = "popup-shape-3";

    iconContainer.appendChild(spinner);
    iconContainer.appendChild(shape3);

    const text = document.createElement("p");
    text.textContent = message;
    Object.assign(text.style, {
      fontSize: "18px",
      color: "#333",
      margin: "0 0 20px 0",
    });

    const btn = document.createElement("button");
    btn.textContent = "OK";
    Object.assign(btn.style, {
      padding: "10px 25px",
      border: "none",
      borderRadius: "6px",
      backgroundColor: popupType === "success" ? "#22c55e" : "#ef4444",
      color: "white",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "opacity 0.2s",
    });

    btn.onmouseover = () => (btn.style.opacity = "0.8");
    btn.onmouseout = () => (btn.style.opacity = "1");
    btn.onclick = () => overlay.remove();

    box.appendChild(iconContainer);
    box.appendChild(text);

    if (popupType === "error") {
      box.appendChild(btn);
    }

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  window.showPopup = window.showPopup || showPopup;
})();

