/**
 * script.js
 * Frontend logic for verification page and staff portal + dashboard
 */

function getApiBase() {
  if (window.APP_CONFIG && typeof window.APP_CONFIG.getApiBase === 'function') {
    return window.APP_CONFIG.getApiBase();
  }
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

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch (e) {
    return String(value);
  }
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
          var gpaText = d.gpa != null && d.gpa !== undefined ? String(d.gpa) : '-';
          detailsEl.innerHTML =
            '<div class="detail-row"><span>Student</span><strong>' +
            escapeHtml(d.studentName || '-') +
            '</strong></div><div class="detail-row"><span>Registration</span><strong>' +
            escapeHtml(d.registrationNumber || '-') +
            '</strong></div><div class="detail-row"><span>Program</span><strong>' +
            escapeHtml(d.program || '-') +
            '</strong></div><div class="detail-row"><span>Year</span><strong>' +
            escapeHtml(String(d.yearOfStudy != null ? d.yearOfStudy : '-')) +
            '</strong></div><div class="detail-row"><span>GPA</span><strong>' +
            escapeHtml(gpaText) +
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

async function loadDashboard() {
  var body = document.getElementById('dashboard-body');
  var countEl = document.getElementById('dashboard-count');
  var msgEl = document.getElementById('dashboard-message');
  var token = localStorage.getItem('staffToken');

  if (!body) return;

  if (!token) {
    body.innerHTML =
      '<tr><td colspan="9" class="empty-cell">Sign in to load records.</td></tr>';
    if (countEl) countEl.textContent = '';
    return;
  }

  if (msgEl) {
    msgEl.textContent = 'Loading dashboard...';
    msgEl.className = 'form-message';
  }
  body.innerHTML =
    '<tr><td colspan="9" class="empty-cell">Loading...</td></tr>';

  try {
    var res = await fetch(getApiBase() + '/transcripts', {
      headers: { Authorization: 'Bearer ' + token }
    });
    var data = await res.json();

    if (!res.ok || !data.success) {
      body.innerHTML =
        '<tr><td colspan="9" class="empty-cell">Could not load records.</td></tr>';
      if (msgEl) {
        msgEl.textContent = data.message || 'Failed to load dashboard';
        msgEl.className = 'form-message error';
      }
      if (countEl) countEl.textContent = '';
      return;
    }

    var rows = data.data || [];
    if (countEl) {
      countEl.textContent = rows.length + ' record' + (rows.length === 1 ? '' : 's');
    }

    if (rows.length === 0) {
      body.innerHTML =
        '<tr><td colspan="9" class="empty-cell">No transcripts issued yet.</td></tr>';
      if (msgEl) msgEl.textContent = '';
      return;
    }

    body.innerHTML = rows
      .map(function (t) {
        var statusClass = t.isRevoked ? 'badge revoked' : 'badge active';
        var statusText = t.isRevoked ? 'Revoked' : 'Active';
        var revokeBtn = t.isRevoked
          ? '<span class="muted">—</span>'
          : '<button type="button" class="table-btn revoke-btn" data-id="' +
            escapeHtml(t._id) +
            '">Revoke</button>';

        return (
          '<tr>' +
          '<td>' +
          escapeHtml(t.registrationNumber || '-') +
          '</td>' +
          '<td>' +
          escapeHtml(t.studentName || '-') +
          '</td>' +
          '<td>' +
          escapeHtml(t.program || '-') +
          '</td>' +
          '<td>' +
          escapeHtml(String(t.yearOfStudy != null ? t.yearOfStudy : '-')) +
          '</td>' +
          '<td>' +
          escapeHtml(t.gpa != null ? String(t.gpa) : '-') +
          '</td>' +
          '<td><code class="hash-cell">' +
          escapeHtml(t.verificationHash || '-') +
          '</code></td>' +
          '<td><span class="' +
          statusClass +
          '">' +
          statusText +
          '</span></td>' +
          '<td>' +
          escapeHtml(formatDate(t.createdAt)) +
          '</td>' +
          '<td>' +
          revokeBtn +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    if (msgEl) msgEl.textContent = '';

    var revokeButtons = body.querySelectorAll('.revoke-btn');
    revokeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        revokeTranscript(btn.getAttribute('data-id'));
      });
    });
  } catch (err) {
    body.innerHTML =
      '<tr><td colspan="9" class="empty-cell">Could not reach the server.</td></tr>';
    if (msgEl) {
      msgEl.textContent = 'Could not reach the server.';
      msgEl.className = 'form-message error';
    }
    if (countEl) countEl.textContent = '';
  }
}

async function revokeTranscript(id) {
  if (!id) return;
  if (!window.confirm('Revoke this transcript? Employers will see it as Revoked.')) {
    return;
  }

  var token = localStorage.getItem('staffToken');
  var msgEl = document.getElementById('dashboard-message');

  try {
    var res = await fetch(getApiBase() + '/transcripts/revoke/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ reason: 'Revoked from registrar dashboard' })
    });
    var data = await res.json();

    if (data.success) {
      if (msgEl) {
        msgEl.textContent = 'Transcript revoked.';
        msgEl.className = 'form-message success';
      }
      loadDashboard();
    } else if (msgEl) {
      msgEl.textContent = data.message || 'Failed to revoke';
      msgEl.className = 'form-message error';
    }
  } catch (err) {
    if (msgEl) {
      msgEl.textContent = 'Could not reach the server.';
      msgEl.className = 'form-message error';
    }
  }
}

function setupStaffPortal() {
  var loginForm = document.getElementById('staff-login-form');
  var loginPanel = document.getElementById('login-panel');
  var issuePanel = document.getElementById('issue-panel');
  var staffStatus = document.getElementById('staff-status');
  var issueForm = document.getElementById('issue-form');
  var logoutBtn = document.getElementById('logout-btn');
  var refreshBtn = document.getElementById('refresh-dashboard-btn');

  function enterStaffWorkspace(name) {
    if (loginPanel) loginPanel.hidden = true;
    if (issuePanel) issuePanel.hidden = false;
    if (staffStatus) {
      staffStatus.textContent = 'Logged in as ' + (name || 'Academic Registrar');
    }
    loadDashboard();
  }

  if (localStorage.getItem('staffToken') && loginPanel && issuePanel) {
    enterStaffWorkspace('Academic Registrar');
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
          if (msgEl) msgEl.textContent = '';
          enterStaffWorkspace(data.user && data.user.name ? data.user.name : 'Staff');
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
          loadDashboard();
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

  if (refreshBtn) {
    refreshBtn.addEventListener('click', function () {
      loadDashboard();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('staffToken');
      if (issuePanel) issuePanel.hidden = true;
      if (loginPanel) loginPanel.hidden = false;
      if (staffStatus) staffStatus.textContent = '';
      var body = document.getElementById('dashboard-body');
      if (body) {
        body.innerHTML =
          '<tr><td colspan="9" class="empty-cell">Sign in to load records.</td></tr>';
      }
    });
  }
}
