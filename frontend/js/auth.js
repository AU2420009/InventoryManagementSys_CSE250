document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const loginForm = document.getElementById("loginForm");
  const captchaCanvas = document.getElementById("captchaCanvas");
  const captchaInput = document.getElementById("captchaInput");
  const captchaError = document.getElementById("captchaError");
  const refreshCaptchaBtn = document.getElementById("refreshCaptcha");

  let currentCaptcha = "";

  // ==========================================
  // 1. CAPTCHA GENERATOR LOGIC
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

  // Initialize CAPTCHA when page loads
  if (captchaCanvas) {
    generateCaptcha();
    // Refresh CAPTCHA when the button is clicked
    refreshCaptchaBtn.addEventListener("click", generateCaptcha);
  }

  // ==========================================
  // 2. LOGIN SUBMISSION & VALIDATION LOGIC
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
          alert("Security Alert: " + data.error);
          // If login fails, force them to do a new CAPTCHA
          captchaInput.value = "";
          generateCaptcha(); 
        } else {
          alert("Authentication successful. Welcome!");
          localStorage.setItem("token", "logged-in"); 
          window.location.href = "dashboard.html";
        }
      })
      .catch(error => {
        console.error("Error connecting to server:", error);
        alert("Failed to connect to the backend. Is your Node server running?");
      });
    });
  }
});