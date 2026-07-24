  // Mobile nav toggle
  const burger = document.getElementById('burgerBtn');
  const nav = document.getElementById('primaryNav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  // How it works tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.steps').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // Role toggle chips
  let selectedRole = 'Buyer';
  document.querySelectorAll('.role-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.role-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedRole = chip.dataset.role;
      saveDraft();
    });
  });

  // Remember form details — across role switches AND across visits on this device/browser.
  // Falls back silently if storage isn't available (e.g. private browsing) — nothing breaks either way.
  const DRAFT_KEY = 'snt_enquiry_draft';
  const draftFields = ['fname', 'fphone', 'ftown', 'fcat', 'fmsg'];

  function saveDraft(){
    try {
      const data = { role: selectedRole };
      draftFields.forEach(id => { data[id] = document.getElementById(id).value; });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable — ignore, form still works */ }
  }

  function loadDraft(){
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      draftFields.forEach(id => {
        if (data[id]) document.getElementById(id).value = data[id];
      });
      if (data.role) {
        selectedRole = data.role;
        document.querySelectorAll('.role-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.role === data.role);
        });
      }
    } catch (e) { /* storage unavailable — start blank, no error shown to user */ }
  }
  loadDraft();
  draftFields.forEach(id => {
    document.getElementById(id).addEventListener('input', saveDraft);
    document.getElementById(id).addEventListener('change', saveDraft);
  });

  // Enquiry -> WhatsApp deep link. Plain button click, not a form submit — so there is
  // no native page navigation/refresh path at all, on this page or any host.
  const WHATSAPP_NUMBER = "918904093932";

  // EDIT ME: paste your Google Apps Script Web App URL here once you've set it up
  // (see the "Save enquiries to a Google Sheet" section in README.md for the 5-minute setup).
  // Leave as-is if you don't want this — the site works fine without it, this part just won't run.
  const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyyXHbB0Fp1fj_7rraoDweGVv9ih1AEvKeZFzVTmLPPoYKPdSjaoH2Jj0te5CP_v8yD4g/exec";

  function saveToSheet(data, callback){
    if (!SHEET_WEBHOOK_URL || SHEET_WEBHOOK_URL.indexOf('PASTE_YOUR') === 0) { callback(); return; }
    try {
      // A 1x1 image request — the same technique used by email-open trackers and web
      // analytics for over 20 years. It bypasses CORS entirely (unlike fetch or
      // sendBeacon, which Apps Script's internal redirect silently blocks) because
      // loading an image was never subject to those restrictions in the first place.
      const params = new URLSearchParams(data).toString();
      const pixel = new Image();
      let done = false;
      const finish = function(){ if (!done) { done = true; callback(); } };
      pixel.onload = finish;
      pixel.onerror = finish; // still let the person continue even if this fails
      setTimeout(finish, 3000); // safety net — never block the person for more than 3s
      pixel.src = SHEET_WEBHOOK_URL + (SHEET_WEBHOOK_URL.indexOf('?') === -1 ? '?' : '&') + params;
    } catch (e) { callback(); }
  }

  function clearEnquiryForm(){
    draftFields.forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('fcat').selectedIndex = 0;
    selectedRole = 'Buyer';
    document.querySelectorAll('.role-chip').forEach(c => c.classList.toggle('active', c.dataset.role === 'Buyer'));
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
  }

  // Two-step flow, on purpose: mobile browsers only allow WhatsApp to open when it
  // happens synchronously inside a real, direct tap — so we can't make WhatsApp
  // wait for the Sheet save to finish within the SAME tap without mobile blocking it.
  // Instead: tap 1 saves and waits for real confirmation; tap 2 (a genuine fresh
  // user gesture) opens WhatsApp. This removes the race condition completely
  // instead of trying to out-run it.
  let pendingWaUrl = null;
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnLabel = submitBtn.querySelector('.btn-label');

  submitBtn.addEventListener('click', function(){
    if (pendingWaUrl) {
      // Step 2: a fresh, direct tap — safe to open on any device.
      window.open(pendingWaUrl, '_blank');
      clearEnquiryForm();
      pendingWaUrl = null;
      submitBtnLabel.textContent = 'Send via WhatsApp';
      document.getElementById('formSuccess').classList.remove('show');
      return;
    }

    const name = document.getElementById('fname').value.trim();
    const phone = document.getElementById('fphone').value.trim();
    const town = document.getElementById('ftown').value.trim();
    const cat = document.getElementById('fcat').value;
    const msg = document.getElementById('fmsg').value.trim();

    if (!name || !phone) {
      document.getElementById('formSuccess').textContent = 'Please add at least your name and phone number.';
      document.getElementById('formSuccess').classList.add('show');
      return;
    }

    const roleText = selectedRole==='Buyer' ? 'looking to buy materials' : selectedRole==='Dealer' ? 'a dealer/retailer interested in partnering' : 'a vendor/manufacturer interested in supplying';
    const plainText = `Hi SNT, I'm ${roleText}.\n\nName: ${name}\nPhone: ${phone}\nTown: ${town}\nCategory: ${cat}\nDetails: ${msg}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(plainText)}`;

    submitBtn.disabled = true;
    submitBtnLabel.textContent = 'Saving...';
    document.getElementById('formSuccess').textContent = 'Saving your enquiry...';
    document.getElementById('formSuccess').classList.add('show');

    saveToSheet({ role: selectedRole, name, phone, town, category: cat, message: msg }, function(){
      pendingWaUrl = url;
      submitBtn.disabled = false;
      submitBtnLabel.textContent = 'Saved! Tap again to open WhatsApp';
      document.getElementById('formSuccess').textContent = 'Saved. Tap the button once more to open WhatsApp.';
      document.getElementById('formSuccess').classList.add('show');
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }
