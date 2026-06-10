// ─────────────────────────────────────────────
//  BLACK ONYX PREMIUM DETAILING — script.js
//  EmailJS + Supabase integration
// ─────────────────────────────────────────────

// ── EMAILJS SDK ──────────────────────────────
(function () {
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = function () {
    emailjs.init('-4Jac6_YMULEsfrPC');
  };
  document.head.appendChild(script);
})();

// ── SUPABASE SDK ─────────────────────────────
(function () {
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  document.head.appendChild(script);
})();

var supabaseClient = null;
var SUPABASE_URL    = 'https://xafdtpmlyvgxowsadzxr.supabase.co';
var SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZmR0cG1seXZneG93c2FkenhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTE5NjQsImV4cCI6MjA5NjAyNzk2NH0.IdJ8UDSnlZUYInCFT5Aez3_Xj18RM6LAGTinqvX7nWk';

function initSupabase() {
  if (window.supabase && !supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
}

// ── NAV SCROLL EFFECT ─────────────────────────
window.addEventListener('scroll', function () {
  var nav = document.getElementById('main-nav');
  if (nav) {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// ── HAMBURGER MENU ────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var hamburger  = document.getElementById('hamburger');
  var mobileNav  = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  // Set minimum date to today
  var dateInput = document.getElementById('preferred_date');
  if (dateInput) {
    var today = new Date();
    var yyyy  = today.getFullYear();
    var mm    = String(today.getMonth() + 1).padStart(2, '0');
    var dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  initVehicleButtons();
  initAddonCards();
  initBookingForm();
});

function closeMobileNav() {
  var mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.classList.remove('open');
}

// ── VEHICLE TYPE BUTTONS ──────────────────────
function initVehicleButtons() {
  var buttons    = document.querySelectorAll('#vehicle-grid .vehicle-btn');
  var hiddenInput = document.getElementById('vehicle_type');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (hiddenInput) hiddenInput.value = btn.getAttribute('data-vehicle');
    });
  });
}

// ── ADD-ON CARDS ──────────────────────────────
var selectedAddons = [];

function initAddonCards() {
  var cards = document.querySelectorAll('#addons-grid .addon-card');

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var addonName = card.getAttribute('data-addon');
      card.classList.toggle('selected');

      if (card.classList.contains('selected')) {
        if (selectedAddons.indexOf(addonName) === -1) {
          selectedAddons.push(addonName);
        }
      } else {
        selectedAddons = selectedAddons.filter(function (a) { return a !== addonName; });
      }

      updateAddonsDisplay();
    });
  });
}

function updateAddonsDisplay() {
  var display       = document.getElementById('selected-addons-display');
  var hiddenInput   = document.getElementById('addons-hidden');

  if (!display || !hiddenInput) return;

  if (selectedAddons.length === 0) {
    display.textContent = 'None selected — select above before booking.';
    display.classList.remove('has-items');
    hiddenInput.value = 'None';
  } else {
    display.textContent = selectedAddons.join(' · ');
    display.classList.add('has-items');
    hiddenInput.value = selectedAddons.join(', ');
  }
}

// ── MODAL ─────────────────────────────────────
function closeModal() {
  var modal = document.getElementById('success-modal');
  if (modal) modal.classList.remove('active');
}

function showModal() {
  var modal = document.getElementById('success-modal');
  if (modal) modal.classList.add('active');
}

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// ── FORM SUBMISSION ───────────────────────────
function initBookingForm() {
  var form      = document.getElementById('booking-form');
  var submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // ── Manual validation for hidden vehicle field ──
    var vehicleInput = document.getElementById('vehicle_type');
    if (!vehicleInput || !vehicleInput.value) {
      alert('Please select a vehicle type (Coupe, Sedan, SUV, or Truck) before submitting.');
      return;
    }

    // ── HTML5 native validation ──
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // ── Disable button + update text ──
    submitBtn.disabled = true;
    var originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'PROCESANDO RESERVA DE LUJO...';

    // ── Collect form data ──
    var firstName   = document.getElementById('first_name').value.trim();
    var lastName    = document.getElementById('last_name').value.trim();
    var phone       = document.getElementById('phone').value.trim();
    var email       = document.getElementById('email').value.trim();
    var address     = document.getElementById('address').value.trim();
    var vehicleType = document.getElementById('vehicle_type').value;
    var servicePackage = document.getElementById('service_package').value;
    var preferredDate  = document.getElementById('preferred_date').value;
    var addonsValue    = document.getElementById('addons-hidden').value;
    var notes          = document.getElementById('notes').value.trim();

    // ── Save to Supabase ──
    initSupabase();
    if (supabaseClient) {
      supabaseClient
        .from('reservations')
        .insert([{
          first_name:      firstName,
          last_name:       lastName,
          phone:           phone,
          email:           email,
          address:         address,
          vehicle_type:    vehicleType,
          service_package: servicePackage,
          preferred_date:  preferredDate,
          addons:          addonsValue,
          notes:           notes,
          status:          'pending',
          created_at:      new Date().toISOString()
        }])
        .then(function (result) {
          if (result.error) {
            console.warn('Supabase insert error:', result.error.message);
          }
        })
        .catch(function (err) {
          console.warn('Supabase error:', err);
        });
    }

    // ── Send to EmailJS — wait for SDK to load ──
    function attemptEmailJS(retries) {
      if (typeof emailjs === 'undefined') {
        if (retries > 0) {
          setTimeout(function () { attemptEmailJS(retries - 1); }, 400);
        } else {
          resetSubmitBtn();
          onEmailError(new Error('EmailJS library failed to load. Please try again or call us directly.'));
        }
        return;
      }

      var serviceId = 'black_onyx_service';

      // Estructura limpia de variables mapeadas para tus plantillas
      var templateParams = {
        first_name:      firstName,
        last_name:       lastName,
        phone:           phone,
        email:           email,
        address:         address,
        vehicle_type:    vehicleType,
        service_package: servicePackage,
        preferred_date:  preferredDate,
        addons:          addonsValue,
        notes:           notes
      };

      // ── Email 1: Notify the business (Black Onyx) ──
      emailjs.send(serviceId, 'bo_nueva_reserva', templateParams)
        .then(function () {
          // ── Email 2: Confirm to client ──
          return emailjs.send(serviceId, 'bo_confirmacion', templateParams);
        })
        .then(function () {
          resetSubmitBtn();
          onEmailSuccess();
        })
        .catch(function (err) {
          resetSubmitBtn();
          onEmailError(err);
        });
    }

    function resetSubmitBtn() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }

    attemptEmailJS(10);
  });
}

function onEmailSuccess() {
  var form      = document.getElementById('booking-form');
  var submitBtn = document.getElementById('submit-btn');

  if (form) form.reset();

  // Reset vehicle buttons
  var vButtons = document.querySelectorAll('#vehicle-grid .vehicle-btn');
  vButtons.forEach(function (b) { b.classList.remove('active'); });
  var vehicleInput = document.getElementById('vehicle_type');
  if (vehicleInput) vehicleInput.value = '';

  // Reset add-ons
  selectedAddons = [];
  var addonCards = document.querySelectorAll('#addons-grid .addon-card');
  addonCards.forEach(function (c) { c.classList.remove('selected'); });
  updateAddonsDisplay();

  if (submitBtn) {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Confirm Booking — Lock My Slot';
  }

  showModal();
}

function onEmailError(err) {
  var submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Confirm Booking — Lock My Slot';
  }

  var message = 'We were unable to send your booking request at this time.\n\n';
  message += 'Please contact us directly:\n';
  message += '📞 (854) 273-4916\n';
  message += '✉ blackonyxpremium@gmail.com\n\n';
  message += 'We apologize for the inconvenience.';

  alert(message);
  console.error('EmailJS error:', err);
}
