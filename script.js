// ─────────────────────────────────────────────
//  BLACK ONYX PREMIUM DETAILING — script.js
//  EmailJS + Supabase integration — CORREGIDO
// ─────────────────────────────────────────────

// ── EMAILJS INIT ──────────────────────────────
// The EmailJS + Supabase SDKs are now loaded via <script> tags
// in the <head> of index.html, BEFORE this file — so by the time
// this runs, `emailjs` and `supabase` already exist on `window`.
// This removes the old race condition where the dynamically
// injected SDK sometimes hadn't loaded yet when the form submitted,
// causing 0 requests to ever reach EmailJS.
if (typeof emailjs !== 'undefined') {
  emailjs.init('-4Jac6_YMULEsfrPC');
}

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
  initPackageSelectButtons();
  initScrollReveal();
  initActiveNavLink();
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
// ── "SELECT PACKAGE" BUTTONS (from #packages cards) ──
// Instead of just jumping to #booking and forcing the user to
// re-pick the package from the dropdown, this auto-fills the
// Service Package select with the exact package they clicked,
// flashes it so they see it was picked, then scrolls down.
function initPackageSelectButtons() {
  var buttons = document.querySelectorAll('.pkg-select-btn');
  var select  = document.getElementById('service_package');

  if (!buttons.length || !select) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var pkgValue = btn.getAttribute('data-package');
      if (!pkgValue) return;

      // Make sure the value exists as an option before assigning
      var match = Array.prototype.find.call(select.options, function (opt) {
        return opt.value === pkgValue;
      });

      if (match) {
        select.value = pkgValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        // Visual confirmation flash
        select.classList.remove('field-flash');
        // Force reflow so the animation can re-trigger on repeat clicks
        void select.offsetWidth;
        select.classList.add('field-flash');
        select.addEventListener('animationend', function handler() {
          select.classList.remove('field-flash');
          select.removeEventListener('animationend', handler);
        });
      }
      // Native smooth-scroll to #booking still happens via the href="#booking"
    });
  });
}

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
    var preferredTime  = document.getElementById('preferred_time').value;
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
          preferred_time:  preferredTime,
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

    // ── Send to EmailJS ──
    // SDK is loaded via <script> tag in <head>, so it's ready by now.
    // Keep one small safety retry in case of an unusually slow connection.
    function attemptEmailJS(retries) {
      if (typeof emailjs === 'undefined') {
        if (retries > 0) {
          setTimeout(function () { attemptEmailJS(retries - 1); }, 500);
        } else {
          resetSubmitBtn();
          onEmailError(new Error('EmailJS library failed to load. Please try again or call us directly.'));
        }
        return;
      }

      var serviceId = 'black_onyx_service';

      var templateParams = {
        to_email:        email,
        first_name:      firstName,
        last_name:       lastName,
        phone:           phone,
        email:           email,
        address:         address,
        vehicle_type:    vehicleType,
        service_package: servicePackage,
        preferred_date:  preferredDate,
        booking_time:    preferredTime,
        addons:          addonsValue,
        notes:           notes
      };

      // ── Email 1: Notify the business (Black Onyx) — CRITICAL ──
      // This is the email that actually creates the booking on our end.
      emailjs.send(serviceId, 'bo_nueva_reserva', templateParams)
        .then(function () {
          // Booking received by the business — treat as success
          // regardless of what happens with the client confirmation below.
          resetSubmitBtn();
          onEmailSuccess(preferredDate, preferredTime);

          // ── Email 2: Confirm to client — BEST EFFORT ──
          // If this fails (e.g. template "To Email" misconfigured, or
          // monthly send limit reached), do NOT show an error to the
          // client — their booking already went through.
          emailjs.send(serviceId, 'bo_confirmacion', templateParams)
            .catch(function (err) {
              console.warn('Client confirmation email failed (booking still registered):', err);
            });
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

    attemptEmailJS(4);
  });
}

function onEmailSuccess(confirmedDate, confirmedTime) {
  var form      = document.getElementById('booking-form');
  var submitBtn = document.getElementById('submit-btn');

  // Inject confirmed date/time into modal before showing
  var dateEl = document.getElementById('confirm-date');
  var timeEl = document.getElementById('confirm-time');
  if (dateEl) dateEl.textContent = confirmedDate || '—';
  if (timeEl) timeEl.textContent = confirmedTime  || '—';

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

// ── SCROLL-REVEAL ANIMATIONS ──────────────────
// Adds a subtle fade-up entrance to key sections/cards as the
// user scrolls. Purely visual — never affects form logic.
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  var selectors = [
    '.pkg-card', '.addon-card', '.contact-card', '.process-step',
    '.section-eye', '.section-title', '.section-sub',
    '.hero-stats', '.service-area', '#booking-form', '.standard-layout > div'
  ].join(',');

  var els = document.querySelectorAll(selectors);

  els.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
  });

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { observer.observe(el); });
}

// ── ACTIVE NAV LINK ON SCROLL ─────────────────
// Highlights the current section's nav link in red as the
// user scrolls through the page.
function initActiveNavLink() {
  if (!('IntersectionObserver' in window)) return;

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.getAttribute('id');

      navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === '#' + id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -40% 0px' });

  sections.forEach(function (sec) { observer.observe(sec); });
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
  console.error('EmailJS error:', (err && (err.text || err.message)) ? (err.text || err.message) : err, err);
}
