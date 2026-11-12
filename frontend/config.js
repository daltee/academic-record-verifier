/**
 * config.js
 * API base URL for the frontend.
 *
 * LOCAL:   uses http://localhost:5000/api
 * LIVE:    uses the public backend URL below
 *
 * After you deploy the backend on Render (or Railway), paste the public URL here.
 * Example: https://academic-record-verifier.onrender.com/api
 */

window.APP_CONFIG = {
  // Change this one line after deploying the backend
  PRODUCTION_API_BASE: 'https://academic-record-verifier.onrender.com/api',

  getApiBase: function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return this.PRODUCTION_API_BASE;
  }
};
