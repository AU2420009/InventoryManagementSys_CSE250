// ==========================================
// 0. CUSTOM POPUP UI LOGIC (WITH ANIMATED GRAPHICS)
// ==========================================
function showPopup(message, type) {
    if (!document.getElementById('custom-popup-styles')) {
      const styles = document.createElement('style');
      styles.id = 'custom-popup-styles';
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

    const iconContainer = document.createElement('div');
    iconContainer.className = `popup-icon-container ${type}`;
    Object.assign(iconContainer.style, {
      width: '100px', height: '100px', position: 'relative', margin: '0 auto 20px',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    });

    const spinner = document.createElement('div');
    spinner.className = 'popup-spinner';
    Object.assign(spinner.style, {
      borderColor: type === 'success' ? '#22c55e' : '#ef4444' 
    });

    const shape3 = document.createElement('div');
    shape3.className = 'popup-shape-3';

    iconContainer.appendChild(spinner);
    iconContainer.appendChild(shape3);

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

    box.appendChild(iconContainer); 
    box.appendChild(text);
    box.appendChild(btn); // Added to both success and error so user can dismiss it to see the next form
    
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// --- CAPTCHA GENERATOR LOGIC ---
let currentCaptcha = "";

function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) {
        console.error("Could not find CAPTCHA canvas!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a light background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate random 6-character string
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    currentCaptcha = "";
    for (let i = 0; i < 6; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Draw text evenly spaced (Fixed Congestion)
    const sectionWidth = canvas.width / 6;
    for (let i = 0; i < currentCaptcha.length; i++) {
        ctx.save();
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "#1e293b"; // Dark text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const x = (i * sectionWidth) + (sectionWidth / 2);
        const y = canvas.height / 2;
        
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.3);
        ctx.fillText(currentCaptcha[i], 0, 0);
        ctx.restore();
    }

    // Add noise lines to make it a real CAPTCHA
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = "#9d2b8c"; // Purple lines
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

// Call generation immediately 
generateCaptcha();

// Attach refresh button event
const refreshBtn = document.getElementById("refreshCaptcha");
if (refreshBtn) {
    refreshBtn.addEventListener("click", generateCaptcha);
}

// --- STEP 1: Request Reset Code ---
document.getElementById('requestTokenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate CAPTCHA first
    const userCaptcha = document.getElementById('captchaInput').value;
    const captchaError = document.getElementById('captchaError');
    
    // Strict Case-Sensitive comparison (Removed .toLowerCase())
    if (userCaptcha !== currentCaptcha) {
        captchaError.textContent = "Invalid Captcha";
        document.getElementById('captchaInput').value = ""; // Clear input
        generateCaptcha(); // Generate a new one
        return; // Stop form submission
    }
    
    captchaError.textContent = ""; // Clear error

    const identifier = document.getElementById('identifier').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Replaced alert with custom popup
            showPopup(data.message, "success");
            
            document.getElementById('requestTokenSection').style.display = 'none';
            document.getElementById('resetPasswordSection').style.display = 'block';
            document.getElementById('formSubtitle').innerText = "Enter your reset code and new password.";
            
            // Auto-fill the identifier in the second form
            document.getElementById('resetIdentifier').value = identifier;
        } else {
            // 🚨 Replaced alert with custom popup
            showPopup(data.error || "An error occurred.", "error");
            generateCaptcha(); // Refresh captcha on failure
            document.getElementById('captchaInput').value = "";
        }

    } catch (err) {
        // 🚨 Replaced alert with custom popup
        showPopup("System Error: " + err.message, "error");
        console.error("Full error:", err);
        generateCaptcha(); // Refresh captcha on failure
    } finally {
        submitBtn.innerText = "Send Reset Code";
        submitBtn.disabled = false;
    }
});

// --- STEP 2: Submit New Password ---
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // ✅ CRITICAL FIX: Grab the email and match the variable name to what the backend expects
    const email = document.getElementById('resetIdentifier').value;
    const token = document.getElementById('resetToken').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Checks that the new password matches the confirm password
    if (newPassword !== confirmPassword) {
        // 🚨 Replaced alert with custom popup
        showPopup("Passwords do not match!", "error");
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.innerText = "Updating...";
    submitBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // ✅ CRITICAL FIX: Sent 'email' instead of 'identifier' here
            body: JSON.stringify({ email, token, newPassword })
        });

        const data = await response.json();

       if (response.ok) {
            // ✅ Replaced alert with custom popup
            showPopup("Password reset successfully! Redirecting to login...", "success"); 
            
            // ✅ Wait 1.5s so user can see success popup before redirecting
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            // 🚨 Replaced alert with custom popup
            showPopup(data.error || "Invalid token or token expired.", "error");
        }
    } catch (err) {
        // 🚨 Replaced alert with custom popup
        showPopup("An error occurred during password reset.", "error");
        console.error("Full error:", err);
    } finally {
        submitBtn.innerText = "Reset Password";
        submitBtn.disabled = false;
    }
});