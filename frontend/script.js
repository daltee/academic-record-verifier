/**
 * script.js
 * Owner: Hillary Austin (Frontend) + Dalton (Integration)
 * Client-side logic for transcript verification
 *
 * Later: replace the demo logic with a real fetch() call to your Express API
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('verify-form');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const reg = document.getElementById('reg-number').value.trim();
        const code = document.getElementById('verify-code').value.trim();
        const resultArea = document.getElementById('result-area');
        const statusEl = document.getElementById('result-status');
        const messageEl = document.getElementById('result-message');

        resultArea.hidden = false;

        // -------------------------------------------------------
        // TODO (Hillary / Dalton): Replace this demo with real API
        // Example:
        // const response = await fetch('http://localhost:5000/api/transcripts/verify', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ registrationNumber: reg, verificationHash: code })
        // });
        // const data = await response.json();
        // -------------------------------------------------------

        // Temporary demo logic
        if (reg && code.length >= 6) {
            statusEl.className = 'result-status success';
            statusEl.textContent = 'Authentic';
            messageEl.textContent = 'This transcript has been verified as genuine and issued by the Academic Registrar.';
        } else {
            statusEl.className = 'result-status fail';
            statusEl.textContent = 'Invalid / Not Found';
            messageEl.textContent = 'No matching record found or the verification code is incorrect. Please check the details and try again.';
        }
    });
});
