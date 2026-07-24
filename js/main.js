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

  function saveToSheet(data){
    if (!SHEET_WEBHOOK_URL || SHEET_WEBHOOK_URL.indexOf('PASTE_YOUR') === 0) return;
    try {
      // A 1x1 image request — the same technique used by email-open trackers and web
      // analytics for over 20 years, specifically because it's the most reliable way
      // to fire a background request that survives the page disappearing right after
      // (like when WhatsApp opens on mobile). It bypasses CORS entirely (unlike fetch
      // or sendBeacon, which Apps Script's internal redirect silently blocks) because
      // loading an image was never subject to those restrictions in the first place.
      const params = new URLSearchParams(data).toString();
      const pixel = new Image();
      pixel.src = SHEET_WEBHOOK_URL + (SHEET_WEBHOOK_URL.indexOf('?') === -1 ? '?' : '&') + params;
    } catch (e) { /* fail silently — WhatsApp send still works either way */ }
  }

  function clearEnquiryForm(){
    draftFields.forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('fcat').selectedIndex = 0;
    selectedRole = 'Buyer';
    document.querySelectorAll('.role-chip').forEach(c => c.classList.toggle('active', c.dataset.role === 'Buyer'));
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
  }

  document.getElementById('submitBtn').addEventListener('click', function(){
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

    // Save to the Sheet FIRST, as the very first thing this click does — this gives
    // the request the earliest possible head start before WhatsApp takes over the screen.
    saveToSheet({ role: selectedRole, name, phone, town, category: cat, message: msg });

    const roleText = selectedRole==='Buyer' ? 'looking to buy materials' : selectedRole==='Dealer' ? 'a dealer/retailer interested in partnering' : 'a vendor/manufacturer interested in supplying';
    const plainText = `Hi SNT, I'm ${roleText}.\n\nName: ${name}\nPhone: ${phone}\nTown: ${town}\nCategory: ${cat}\nDetails: ${msg}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(plainText)}`;

    document.getElementById('formSuccess').textContent = 'Sent! Opening WhatsApp — the form below is now clear and ready for the next enquiry.';
    document.getElementById('formSuccess').classList.add('show');
    window.open(url, '_blank');
    clearEnquiryForm();
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
