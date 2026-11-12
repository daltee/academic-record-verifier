/**
 * script.js
 * Owner: Hillary Austin (Frontend) + Dalton (Integration)
 * Connects the verification form to the real Express API
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
    statusEl.className = 'result-status';
    statusEl.textContent = 'Checking...';
    messageEl.textContent = 'Please wait while we verify the transcript.';

    try {
      const response = await fetch('http://localhost:5000/api/transcripts/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationNumber: reg,
          verificationHash: code
        })
      });

      const data = await response.json();

      if (data.success && data.status === 'AUTHENTIC') {
        statusEl.className = 'result-status success';
        statusEl.textContent = 'Authentic';
        messageEl.textContent = data.message || 'This transcript has been verified as genuine and issued by the Academic Registrar.';
      } else if (data.status === 'REVOKED') {
        statusEl.className = 'result-status fail';
        statusEl.textContent = 'Revoked';
        messageEl.textContent = data.message || 'This transcript has been revoked.';
      } else {
        statusEl.className = 'result-status fail';
        statusEl.textContent = 'Invalid / Not Found';
        messageEl.textContent = data.message || 'No matching record found or the verification code is incorrect.';
      }
    } catch (error) {
      statusEl.className = 'result-status fail';
      statusEl.textContent = 'Error';
      messageEl.textContent = 'Could not reach the verification server. Please make sure the API is running.';
      console.error('Verification request failed:', error);
    }
  });
});
