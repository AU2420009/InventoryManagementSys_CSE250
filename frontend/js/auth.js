document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements (Preserved Perfectly) ---
  const loginForm = document.getElementById("loginForm");
  const captchaCanvas = document.getElementById("captchaCanvas");
  const captchaInput = document.getElementById("captchaInput");
  const captchaError = document.getElementById("captchaError");
  const refreshCaptchaBtn = document.getElementById("refreshCaptcha");

  let currentCaptcha = "";

  // ==========================================
  // 0. NEW POPUP UI LOGIC (REPLACED EMOJIS WITH GRAPHIC INSPIRED BY SCREENSHOT)
  // ==========================================
  function showPopup(message, type) {
    // 0a. Define Dynamic CSS for the complex icon graphics (Do this once)
    if (!document.getElementById('custom-popup-styles')) {
      const styles = document.createElement('style');
      styles.id = 'custom-popup-styles';
      styles.innerHTML = `
        /* Central Spinner Animation */
        @keyframes popup-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* Central Spinner style (mimicking dotted ring in screenshot, color based on success/error) */
        .popup-spinner {
          width: 60px; height: 60px; border-radius: 50%;
          border-width: 5px; border-style: dotted;
          position: relative; animation: popup-spin 1.5s linear infinite;
        }

        /* Floating background shapes mimicking screenshot (stars, rings, dots) */
        .popup-icon-container::before, .popup-icon-container::after {
          content: ''; position: absolute; border-radius: 50%; opacity: 0.8;
        }

        /* Shape 1 (like the yellow sun/star) */
        .popup-icon-container::before {
          width: 15px; height: 15px; background: #f59e0b; top: 10px; left: 10px;
        }
        
        /* Shape 2 (like the blue dot/face) */
        .popup-icon-container::after {
          width: 12px; height: 12px; background: #3b82f6; bottom: 10px; right: 10px;
        }

        /* Shape 3 (like the purple ring) */
        .popup-shape-3 {
          width: 20px; height: 20px; border: 3px solid #a855f7; border-radius: 50%;
          position: absolute; top: 5px; right: 20px; opacity: 0.8;
        }
      `;
      document.head.appendChild(styles);
    }

    // 0b. Popup Structure
    const existing = document.getElementById('custom-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-popup-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: '9999',
      backdropFilter: 'blur(2px)'
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center',
      minWidth: '320px', maxWidth: '80%', fontFamily: 'sans-serif'
    });

    // =========================================================================
    // ✅ REPLACED EMOJI WITH DYNAMIC GRAPHIC STRUCTURE MIMICKING SCREENSHOT
    // =========================================================================
    const iconContainer = document.createElement('div');
    iconContainer.className = `popup-icon-container ${type}`;
    Object.assign(iconContainer.style, {
      width: '100px', height: '100px', position: 'relative', margin: '0 auto 20px',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    // The central spinner (dotted ring in screenshot style, colored green/red based on success/error)
    const spinner = document.createElement('div');
    spinner.className = 'popup-spinner';
    Object.assign(spinner.style, {
      borderColor: type === 'success' ? '#22c55e' : '#ef4444' // Map color to result
    });

    // A third floating shape element to add complexity like screenshot background
    const shape3 = document.createElement('div');
    shape3.className = 'popup-shape-3';

    // Assemble complex icon
    iconContainer.appendChild(spinner);
    iconContainer.appendChild(shape3);
    // =========================================================================

    const text = document.createElement('p');
    text.textContent = message;
    Object.assign(text.style, { fontSize: '18px', color: '#333', marginBottom: '25px', margin: '0 0 20px 0' });

    const btn = document.createElement('button');
    btn.textContent = 'OK';
    Object.assign(btn.style, {
      padding: '10px 25px', border: 'none', borderRadius: '6px',
      backgroundColor: type === 'success' ? '#22c55e' : '#ef4444',
      color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
      transition: 'opacity 0.2s'
    });
    
    btn.onmouseover = () => btn.style.opacity = '0.8';
    btn.onmouseout = () => btn.style.opacity = '1';
    btn.onclick = () => overlay.remove();

    box.appendChild(iconContainer); // Add the new dynamic icon structure
    box.appendChild(text);
    if (type === 'error') {
      box.appendChild(btn); 
    }
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // ==========================================
  // 1. CAPTCHA GENERATOR LOGIC (Preserved Perfectly)
  // ==========================================
  function generateCaptcha() {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext('2d');
    
    // Clear previous canvas
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);

    // White background for the captcha box
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);

    // Generate 6 random characters
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    currentCaptcha = "";
    for (let i = 0; i < 6; i++) {
      currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Draw the text with colors
    const colors = ['#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#3b82f6'];
    for (let i = 0; i < currentCaptcha.length; i++) {
      ctx.save();
      ctx.font = "bold 24px Courier";
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      // Random placement and rotation
      const x = 20 + (i * 20);
      const y = 30 + (Math.random() * 5);
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3); 
      ctx.fillText(currentCaptcha[i], 0, 0);
      ctx.restore();
    }

    // Add a few interference lines for security
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
      ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
      ctx.strokeStyle = "#cbd5e1"; 
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Initialize CAPTCHA when page loads (Preserved Perfectly)
  if (captchaCanvas) {
    generateCaptcha();
    // Refresh CAPTCHA when the button is clicked
    refreshCaptchaBtn.addEventListener("click", generateCaptcha);
  }

  // ==========================================
  // 2. LOGIN SUBMISSION & VALIDATION LOGIC (Preserved Perfectly, utilizing custom popup calls)
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Stop page from refreshing

      // Step A: Verify CAPTCHA first
      if (captchaInput.value !== currentCaptcha) {
        captchaError.textContent = "Invalid Captcha. Please try again.";
        captchaInput.value = ""; // Clear the input
        generateCaptcha();       // Regenerate a new CAPTCHA
        return;                  // Stop the login process here
      }
      captchaError.textContent = ""; // Clear any previous errors

      // Step B: Grab Login Credentials
      const loginId = document.getElementById("loginIdentifier").value;
      const loginPass = document.getElementById("loginPassword").value;

      // Step C: Send to Node Backend
      fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginId,
          password: loginPass
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          // Use custom 'error' graphic popup
          showPopup("Security Alert: " + data.error, "error");
          
          // If login fails, force them to do a new CAPTCHA
          captchaInput.value = "";
          generateCaptcha(); 
        } else {
          // Use custom 'success' graphic popup
          showPopup("Authentication successful. Redirecting...", "success");
          
          localStorage.setItem("sessionId", data.sessionId);
          localStorage.setItem("role", data.role);
          
          // Wait 1.5 seconds so the user can see the success popup before redirecting
          setTimeout(() => {
            switch(data.role) {
              case 'admin':
                window.location.href = "admin/dashboard.html";
                break;
              case 'staff':
                window.location.href = "staff/dashboard.html";
                break;
              case 'customer':
                window.location.href = "customer/dashboard.html";
                break;
              default:
                window.location.href = "customer/dashboard.html";
                break;
            }
          }, 1500); 
        }
      })
      .catch(error => {
        console.error("Error connecting to server:", error);
        // Use custom 'error' graphic popup
        showPopup("Failed to connect to the backend. Is your Node server running?", "error");
      });
    });
  }
});