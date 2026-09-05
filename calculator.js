/**
 * Регионы: north (Чуй, Талас, Нарын, Иссык-Куль), south (Ош, Джалал-Абад, Баткен).
 * Базовая ставка до 2 кг: 350 при доставке внутри одного региона или внутри города,
 * 400 — межрегиональные маршруты (север ↔ юг).
 */
const CITY_REGION = {
  Айдаркен: "south",
  "Ак-Туз": "north",
  Араван: "south",
  Ананьево: "north",
  "Ат-Башы": "north",
  Балыкчы: "north",
  Баткен: "south",
  Беловодское: "north",
  Бишкек: "north",
  Гульча: "south",
  "Джалал-Абад": "south",
  Джиргитал: "north",
  Ивановка: "north",
  Исфана: "south",
  Кадамжай: "south",
  Каинды: "north",
  Кант: "north",
  "Кара-Балта": "north",
  Каракол: "north",
  "Кара-С\u0443\u0443": "south",
  Кемин: "north",
  Кербен: "south",
  "Кызыл-Кия": "south",
  "Кызыл-С\u0443\u0443": "north",
  "Кызыл-Адыр": "north",
  "Кок-Янгак": "south",
  Кочкор: "north",
  Ленинское: "north",
  Лейлек: "south",
  "Майли-С\u0443\u0443": "south",
  Манас: "north",
  Маймак: "north",
  Нарын: "north",
  Ноокат: "south",
  Орловка: "north",
  Ош: "south",
  Раззаков: "south",
  Самаркандек: "south",
  Сокулук: "north",
  Сулюкта: "south",
  Талас: "north",
  Тамчы: "north",
  "Таш-Кумыр": "south",
  Токмок: "north",
  Тюп: "north",
  Узген: "south",
  "Уч-Курпан": "north",
  Чаек: "north",
  "Чолпон-Ата": "north",
  Шопоков: "north",
  "Кызыл-Бел": "south",
  "Бакай-Ата": "north",
  Бостери: "north",
  Достук: "south",
  "Жаны-Арык": "north",
  Кайнар: "south",
  "Кызыл-Жар": "north",
  Приозёрск: "north",
  Шахидон: "south",
};

const CITIES = Object.keys(CITY_REGION).sort((a, b) => a.localeCompare(b, "ru"));

const BASE_SAME_OR_INTRAREGION = 350;
const BASE_INTERREGION = 400;
const PER_KG_OVER_2 = 100;
const FREE_KG_LIMIT = 2;

function getBaseRate(fromCity, toCity) {
  if (fromCity === toCity) return BASE_SAME_OR_INTRAREGION;
  const r1 = CITY_REGION[fromCity];
  const r2 = CITY_REGION[toCity];
  if (r1 && r2 && r1 === r2) return BASE_SAME_OR_INTRAREGION;
  return BASE_INTERREGION;
}

function calculateDelivery(fromCity, toCity, weightKg) {
  const w = parseFloat(String(weightKg).replace(",", "."));
  if (!fromCity || !toCity || Number.isNaN(w) || w <= 0) return null;
  const base = getBaseRate(fromCity, toCity);
  const over = Math.max(0, w - FREE_KG_LIMIT);
  const extra = over > 0 ? Math.ceil(over) * PER_KG_OVER_2 : 0;
  return base + extra;
}

function fillCitySelect(selectEl) {
  for (const city of CITIES) {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    selectEl.appendChild(opt);
  }
}

function initCalculator() {
  const fromSel = document.getElementById("calc-from");
  const toSel = document.getElementById("calc-to");
  if (!fromSel || !toSel) return;

  fillCitySelect(fromSel);
  fillCitySelect(toSel);

  fromSel.value = "Бишкек";
  toSel.value = "Ош";

  const form = document.getElementById("calc-form");
  const weightInput = document.getElementById("calc-weight");
  const resultEl = document.getElementById("calc-result");

  function showResult() {
    const from = fromSel.value;
    const to = toSel.value;
    const total = calculateDelivery(from, to, weightInput?.value);
    if (total == null) {
      resultEl.textContent = "—";
      return;
    }
    resultEl.textContent = String(total);
  }

  fromSel.addEventListener("change", showResult);
  toSel.addEventListener("change", showResult);
  weightInput?.addEventListener("input", showResult);

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    showResult();
  });

  showResult();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCalculator);
} else {
  initCalculator();
}
