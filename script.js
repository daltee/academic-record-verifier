// Transcript Verification – client-side logic
// Temporary demo placeholder. Replace with real API calls later.

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('verify-form');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const reg = document.getElementById('reg-number').value.trim();
        const code = document.getElementById('verify-code').value.trim();
        const resultArea = document.getElementById('result-area');
        const statusEl = document.getElementById('result-status');
        const messageEl = document.getElementById('result-message');

        resultArea.hidden = false;

        // Temporary demo logic – replace with fetch('/api/verify') later
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
