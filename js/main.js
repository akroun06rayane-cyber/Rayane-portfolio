// Portfolio BTS SIO — Rayane

/* ============================================================
   1. Filtres (réalisations et compétences)
   ============================================================ */
function initFilter(filtersId, itemSelector, emptyId) {
  const container = document.getElementById(filtersId);
  if (!container) return;

  const buttons = container.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(itemSelector);
  const emptyMessage = emptyId ? document.getElementById(emptyId) : null;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      let visibleCount = 0;
      items.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !match);
        if (match) {
          visibleCount++;
          item.classList.remove("fade-in");
          void item.offsetWidth;
          item.classList.add("fade-in");
        }
      });

      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    });
  });
}

initFilter("projectFilters", ".project-item", "emptyMessage");
initFilter("skillFilters", ".skill-item", null);

/* ============================================================
   1bis. Compétences : clic pour afficher le niveau (barre %)
   ============================================================ */
document.querySelectorAll(".skill-item").forEach((item) => {
  function toggle() {
    const isOpen = item.classList.toggle("is-open");
    item.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
  item.addEventListener("click", toggle);
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
});

/* ============================================================
   2. Formulaire de contact sécurisé (Web3Forms)
   ============================================================ */
const form = document.getElementById("contactForm");
const statusBox = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const pageLoadedAt = Date.now();
const MIN_FILL_TIME_MS = 3000;

function setStatus(message) {
  statusBox.textContent = message;
}

function markInvalid(field, isInvalid) {
  field.classList.toggle("is-invalid", isInvalid);
  field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  const data = new FormData(form);

  // 1) Piège anti-robot
  if (data.get("botcheck")) return;

  // 2) Délai minimum
  if (Date.now() - pageLoadedAt < MIN_FILL_TIME_MS) {
    setStatus("Erreur : envoi trop rapide, réessaie dans quelques secondes.");
    return;
  }

  // 3) Validation des champs
  const name       = form.elements["name"];
  const email      = form.elements["email"];
  const subjectFld = form.elements["subject_user"];
  const message    = form.elements["message"];
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

  markInvalid(name,       name.value.trim().length < 2);
  markInvalid(email,      !emailValid);
  markInvalid(subjectFld, subjectFld.value.trim().length < 2);
  markInvalid(message,    message.value.trim().length < 10);

  if (name.value.trim().length < 2) {
    setStatus("Erreur : indique ton nom.");
    return;
  }
  if (!emailValid) {
    setStatus("Erreur : l'adresse e-mail saisie n'est pas valide.");
    return;
  }
  if (subjectFld.value.trim().length < 2) {
    setStatus("Erreur : indique un sujet pour ton message.");
    return;
  }
  if (message.value.trim().length < 10) {
    setStatus("Erreur : le message est trop court (10 caractères minimum).");
    return;
  }

  // 4) Captcha
  if (typeof window.hcaptcha === "undefined") {
    setStatus("Erreur : le captcha n'a pas pu se charger. Ouvre le site avec Live Server et désactive ton bloqueur de publicités.");
    return;
  }
  const captchaField = form.querySelector('[name="h-captcha-response"]');
  const captchaToken = (captchaField && captchaField.value) || window.hcaptcha.getResponse();
  if (!captchaToken) {
    setStatus("Erreur : coche la case du captcha avant d'envoyer.");
    return;
  }

  // 5) Clé Web3Forms non configurée
  if (data.get("access_key") === "VOTRE_CLE_WEB3FORMS") {
    setStatus("Formulaire non configuré : ajoute ta clé Web3Forms dans index.html (voir README).");
    return;
  }

  // 6) Envoi
  submitBtn.disabled = true;
  setStatus("Envoi en cours…");

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
    });
    const result = await response.json();

    if (response.ok && result.success) {
      setStatus("Message envoyé, merci ! Je te réponds rapidement.");
      form.reset();
      if (window.hcaptcha) window.hcaptcha.reset();
    } else {
      setStatus("Erreur : l'envoi a échoué. " + (result.message || "Réessaie plus tard."));
    }
  } catch (error) {
    setStatus("Erreur : impossible d'envoyer le message. Vérifie ta connexion.");
  } finally {
    submitBtn.disabled = false;
  }
});

// Avertissement si le captcha ne s'affiche pas
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!document.querySelector(".h-captcha iframe") && !statusBox.textContent) {
      setStatus("Le captcha ne s'affiche pas : ouvre le site avec Live Server (http://127.0.0.1…) et désactive ton bloqueur de publicités.");
    }
  }, 5000);
});