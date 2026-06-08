(function () {
  const WHATSAPP_E164 = "996555012731";
  const WA_TEXT = encodeURIComponent(
    "Здравствуйте! Хочу связаться с INDEX по вопросу доставки."
  );

  function waUrl() {
    return `https://wa.me/${WHATSAPP_E164}?text=${WA_TEXT}`;
  }

  const EMAILS = [
    { addr: "Index_irm@mail.ru", label: "Index_irm@mail.ru" },
    { addr: "help@index.kg", label: "help@index.kg" },
    { addr: "about@index.kg", label: "about@index.kg" },
  ];

  let modalEl = null;
  let lastFocus = null;

  function buildModal() {
    const root = document.createElement("div");
    root.id = "contacts-modal";
    root.className = "contacts-modal";
    root.setAttribute("hidden", "");
    root.innerHTML = `
      <div class="contacts-modal__backdrop" data-contacts-close tabindex="-1"></div>
      <div
        class="contacts-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacts-modal-title"
      >
        <button type="button" class="contacts-modal__close" data-contacts-close aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <h2 id="contacts-modal-title" class="contacts-modal__title">Контакты</h2>
        <p class="contacts-modal__lead">Свяжитесь с нами удобным способом — ответим в рабочее время.</p>

        <div class="contacts-modal__block">
          <span class="contacts-modal__label">WhatsApp</span>
          <a class="contacts-modal__wa" href="${waUrl()}" target="_blank" rel="noopener noreferrer">
            <span class="contacts-modal__wa-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            Написать в WhatsApp
          </a>
        </div>

        <div class="contacts-modal__block">
          <span class="contacts-modal__label">Почта</span>
          <ul class="contacts-modal__mails">
            ${EMAILS.map(
              (e) => `
            <li>
              <a class="contacts-modal__mail" href="mailto:${e.addr}">${e.label}</a>
            </li>`
            ).join("")}
          </ul>
        </div>

        <button type="button" class="contacts-modal__secondary" data-contacts-close>Закрыть</button>
      </div>
    `;
    document.body.appendChild(root);
    return root;
  }

  function openModal() {
    if (!modalEl) modalEl = buildModal();
    lastFocus = document.activeElement;
    const wa = modalEl.querySelector(".contacts-modal__wa");
    if (wa) wa.href = waUrl();
    modalEl.removeAttribute("hidden");
    requestAnimationFrame(() => modalEl.classList.add("contacts-modal--open"));
    document.body.classList.add("contacts-modal-active");
    const btn = modalEl.querySelector(".contacts-modal__wa");
    if (btn) btn.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove("contacts-modal--open");
    document.body.classList.remove("contacts-modal-active");
    window.setTimeout(() => {
      modalEl.setAttribute("hidden", "");
    }, 220);
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-contacts]");
    if (open) {
      e.preventDefault();
      openModal();
      return;
    }
    if (e.target.closest("[data-contacts-close]")) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalEl && !modalEl.hasAttribute("hidden")) {
      closeModal();
    }
  });
})();
