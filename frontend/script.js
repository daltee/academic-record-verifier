/**
 * script.js
 * Frontend logic for verification page and staff portal
 */

function getApiBase() {
  if (window.APP_CONFIG && typeof window.APP_CONFIG.getApiBase === 'function') {
    return window.APP_CONFIG.getApiBase();
  }
  // Fallback if config.js failed to load
  var host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'https://academic-record-verifier.onrender.com/api';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

document.addEventListener('DOMContentLoaded', function () {
  setupVerifyForm();
  setupStaffPortal();
});

function setupVerifyForm() {
  var form = document.getElementById('verify-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var reg = document.getElementById('reg-number').value.trim();
    var code = document.getElementById('verify-code').value.trim();
    var resultArea = document.getElementById('result-area');
    var statusEl = document.getElementById('result-status');
    var messageEl = document.getElementById('result-message');
    var detailsEl = document.getElementById('result-details');

    resultArea.hidden = false;
    statusEl.className = 'result-status';
    statusEl.textContent = 'Checking...';
    messageEl.textContent = 'Please wait while we verify the transcript.';
    if (detailsEl) detailsEl.innerHTML = '';

    try {
      var response = await fetch(getApiBase() + '/transcripts/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: reg,
          verificationHash: code
        })
      });

      var data = await response.json();

      if (data.success && data.status === 'AUTHENTIC') {
        statusEl.className = 'result-status success';
        statusEl.textContent = 'Authentic';
        messageEl.textContent = data.message || 'This transcript has been verified as genuine.';

        if (detailsEl && data.data) {
          var d = data.data;
          detailsEl.innerHTML =
            '<div class="detail-row"><span>Student</span><strong>' +
            escapeHtml(d.studentName || '-') +
            '</strong></div><div class="detail-row"><span>Registration</span><strong>' +
            escapeHtml(d.registrationNumber || '-') +
            '</strong></div><div class="detail-row"><span>Program</span><strong>' +
            escapeHtml(d.program || '-') +
            '</strong></div><div class="detail-row"><span>Year</span><strong>' +
            escapeHtml(String(d.yearOfStudy != null ? d.yearOfStudy : '-')) +
            '</strong></div>';
        }
      } else if (data.status === 'REVOKED') {
        statusEl.className = 'result-status fail';
        statusEl.textContent = 'Revoked';
        messageEl.textContent = data.message || 'This transcript has been revoked.';
      } else {
        statusEl.className = 'result-status fail';
        statusEl.textContent = 'Invalid / Not Found';
        messageEl.textContent =
          data.message || 'No matching record found or the verification code is incorrect.';
      }
    } catch (error) {
      statusEl.className = 'result-status fail';
      statusEl.textContent = 'Error';
      messageEl.textContent =
        'Could not reach the verification server. Please make sure the API is running.';
      console.error(error);
    }
  });
}

function setupStaffPortal() {
  var loginForm = document.getElementById('staff-login-form');
  var loginPanel = document.getElementById('login-panel');
  var issuePanel = document.getElementById('issue-panel');
  var staffStatus = document.getElementById('staff-status');
  var issueForm = document.getElementById('issue-form');
  var logoutBtn = document.getElementById('logout-btn');

  if (localStorage.getItem('staffToken') && loginPanel && issuePanel) {
    loginPanel.hidden = true;
    issuePanel.hidden = false;
    if (staffStatus) staffStatus.textContent = 'Logged in as Academic Registrar';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = document.getElementById('staff-email').value.trim();
      var password = document.getElementById('staff-password').value;
      var msgEl = document.getElementById('login-message');

      if (msgEl) {
        msgEl.textContent = 'Signing in...';
        msgEl.className = 'form-message';
      }

      try {
        var res = await fetch(getApiBase() + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();

        if (data.success && data.token) {
          localStorage.setItem('staffToken', data.token);
          if (loginPanel) loginPanel.hidden = true;
          if (issuePanel) issuePanel.hidden = false;
          if (staffStatus) {
            staffStatus.textContent =
              'Logged in as ' + (data.user && data.user.name ? data.user.name : 'Staff');
          }
          if (msgEl) msgEl.textContent = '';
        } else if (msgEl) {
          msgEl.textContent = data.message || 'Invalid credentials';
          msgEl.className = 'form-message error';
        }
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = 'Could not reach the server.';
          msgEl.className = 'form-message error';
        }
      }
    });
  }

  if (issueForm) {
    issueForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var token = localStorage.getItem('staffToken');
      var msgEl = document.getElementById('issue-message');
      var resultBox = document.getElementById('issue-result');

      var payload = {
        registrationNumber: document.getElementById('issue-reg').value.trim(),
        studentName: document.getElementById('issue-name').value.trim(),
        program: document.getElementById('issue-program').value.trim(),
        yearOfStudy: Number(document.getElementById('issue-year').value),
        gpa: document.getElementById('issue-gpa').value
          ? Number(document.getElementById('issue-gpa').value)
          : undefined
      };

      if (msgEl) {
        msgEl.textContent = 'Issuing...';
        msgEl.className = 'form-message';
      }

      try {
        var res = await fetch(getApiBase() + '/transcripts/issue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });
        var data = await res.json();

        if (data.success) {
          if (msgEl) {
            msgEl.textContent = 'Transcript issued successfully';
            msgEl.className = 'form-message success';
          }
          if (resultBox) {
            resultBox.hidden = false;
            resultBox.innerHTML =
              '<p><strong>Registration:</strong> ' +
              escapeHtml(data.data.registrationNumber) +
              '</p><p><strong>Student:</strong> ' +
              escapeHtml(data.data.studentName) +
              '</p><p><strong>Verification Hash:</strong></p><code class="hash-display">' +
              escapeHtml(data.data.verificationHash) +
              '</code><p class="hint">Print this hash on the transcript for employers to verify.</p>';
          }
          issueForm.reset();
        } else if (msgEl) {
          msgEl.textContent = data.message || 'Failed to issue transcript';
          msgEl.className = 'form-message error';
        }
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = 'Could not reach the server.';
          msgEl.className = 'form-message error';
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('staffToken');
      if (issuePanel) issuePanel.hidden = true;
      if (loginPanel) loginPanel.hidden = false;
      if (staffStatus) staffStatus.textContent = '';
    });
  }
}
