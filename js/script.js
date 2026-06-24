const LOTTERIES = [
  {
    id: "megasena",
    flag: "🇧🇷",
    name: "Mega-Sena",
    country: "Brasil",
    min: 1,
    max: 60,
    pick: 6,
    special: null,
    hot: [10, 53, 23, 42, 33, 5, 41, 27, 34, 38, 20, 45, 15, 58, 11],
    warm: [4, 8, 22, 36, 2, 44, 13, 16, 50, 7, 25, 29, 47, 32, 19],
    desc: "O maior sorteio do Brasil. Escolha 6 números de 1 a 60. Sorteios às quartas e sábados. Acumulações históricas chegam a R$600M.",
  },
  {
    id: "lotofacil",
    flag: "🇧🇷",
    name: "Lotofácil",
    country: "Brasil",
    min: 1,
    max: 25,
    pick: 15,
    special: null,
    hot: [5, 10, 24, 11, 20, 4, 18, 3, 23, 16, 13, 19, 8, 12, 17],
    warm: [1, 6, 9, 14, 15, 21, 25, 2, 7, 22],
    desc: "Escolha 15 números de 25. A loteria com maior probabilidade de acerto da Caixa. Sorteio todos os dias úteis.",
  },
  {
    id: "quina",
    flag: "🇧🇷",
    name: "Quina",
    country: "Brasil",
    min: 1,
    max: 80,
    pick: 5,
    special: null,
    hot: [4, 13, 19, 55, 72, 11, 29, 45, 62, 78, 7, 33, 48, 66, 20],
    warm: [2, 17, 36, 50, 68, 9, 24, 41, 57, 74, 14, 31, 46, 60, 5],
    desc: "Escolha 5 números de 80. Sorteio de segunda a sábado. Acumula com frequência e premia quem acerta 2 ou mais números.",
  },
  {
    id: "lotomania",
    flag: "🇧🇷",
    name: "Lotomania",
    country: "Brasil",
    min: 0,
    max: 99,
    pick: 20,
    special: null,
    hot: [11, 33, 55, 77, 0, 22, 44, 66, 88, 13, 37, 59, 81, 4, 26],
    warm: [9, 28, 47, 63, 79, 15, 38, 52, 71, 90, 6, 19, 43, 68, 85],
    desc: "Escolha 20 números de 0 a 99. Única loteria que também premia quem não acerta nenhum número. Sorteio duas vezes por semana.",
  },
  {
    id: "trilegal",
    flag: "🇧🇷",
    name: "+Milionária",
    country: "Brasil",
    min: 1,
    max: 50,
    pick: 6,
    special: { min: 1, max: 6, label: "Trevos", count: 2 },
    hot: [12, 28, 40, 5, 33, 19, 47, 8, 22, 36, 3, 44, 17, 31, 50],
    warm: [6, 14, 25, 38, 48, 10, 21, 34, 42, 2, 16, 29, 45, 7, 39],
    desc: "Escolha 6 números de 1 a 50 + 2 Trevos de 1 a 6. A mais nova loteria da Caixa, com jackpots que chegam a R$900M.",
  },
];

const MODES = {
  smart: {
    desc: "Combina números quentes com alguns frios e aleatórios, simulando a distribuição histórica real dos sorteios.",
  },
  hot: {
    desc: "Prioriza os números que mais saíram historicamente nos sorteios desta loteria.",
  },
  cold: {
    desc: 'Foca em números que saem menos — teoria de que números "devem" aparecer para equilibrar.',
  },
  random: {
    desc: "Completamente aleatório. Cada número tem exatamente a mesma probabilidade.",
  },
  mixed: {
    desc: "Metade quentes, metade de outros intervalos — balanceia os extremos da distribuição.",
  },
};

let currentLottery = LOTTERIES[0];
let currentMode = "smart";
let savedHistory = [];

function range(min, max) {
  const r = [];
  for (let i = min; i <= max; i++) r.push(i);
  return r;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function classify(n, l) {
  if (l.hot.includes(n)) return "hot";
  if (l.warm.includes(n)) return "warm";
  const all = range(l.min, l.max);
  const cold = all.filter((x) => !l.hot.includes(x) && !l.warm.includes(x));
  if (cold.slice(0, Math.ceil(cold.length * 0.25)).includes(n)) return "cold";
  return "normal";
}

function pickNums(l, mode) {
  const all = range(l.min, l.max);
  const cold = all.filter((x) => !l.hot.includes(x) && !l.warm.includes(x));
  let pool = [];
  if (mode === "hot")
    pool = [...shuffle(l.hot), ...shuffle(l.warm), ...shuffle(cold)];
  else if (mode === "cold")
    pool = [...shuffle(cold), ...shuffle(l.warm), ...shuffle(l.hot)];
  else if (mode === "random") pool = shuffle(all);
  else if (mode === "mixed") {
    const h = shuffle(l.hot).slice(0, Math.ceil(l.pick / 2));
    const rest = shuffle(all.filter((x) => !h.includes(x)));
    pool = [...h, ...rest];
  } else {
    const h = shuffle(l.hot).slice(0, Math.ceil(l.pick * 0.5));
    const w = shuffle(l.warm).slice(0, Math.ceil(l.pick * 0.25));
    const rest = shuffle(
      [...l.warm, ...cold].filter((x) => !h.includes(x) && !w.includes(x)),
    );
    pool = [...h, ...w, ...rest];
  }
  const nums = [];
  for (let x of pool) {
    if (!nums.includes(x)) nums.push(x);
    if (nums.length === l.pick) break;
  }
  return nums.sort((a, b) => a - b);
}

function pickSpecial(sp) {
  return shuffle(range(sp.min, sp.max))
    .slice(0, sp.count)
    .sort((a, b) => a - b);
}

function renderBall(n, cls, title = "") {
  return `<div class="ball ${cls}" title="${title || cls}">${n}</div>`;
}

function buildGrid() {
  const g = document.getElementById("lotteryGrid");
  g.innerHTML = LOTTERIES.map(
    (l) => `
      <button class="lottery-btn${l.id === currentLottery.id ? " active" : ""}" data-id="${l.id}">
        <span class="flag">${l.flag}</span>
        <div class="lname">${l.name}</div>
        <div class="lcountry">${l.country}</div>
        <div class="lrange">${l.pick} de ${l.max}${l.special ? ` +${l.special.label.split(" ")[0]}` : ""}</div>
      </button>`,
  ).join("");
  g.querySelectorAll(".lottery-btn").forEach((b) =>
    b.addEventListener("click", () => {
      currentLottery = LOTTERIES.find((l) => l.id === b.dataset.id);
      buildGrid();
      updateInfo();
    }),
  );
}

function updateInfo() {
  const l = currentLottery;
  const s = l.special;
  document.getElementById("infoBox").innerHTML =
    `<strong>${l.flag} ${l.name} · ${l.country}</strong> — Escolha ${l.pick} números de ${l.min} a ${l.max}${s ? ` + ${s.count} ${s.label} (${s.min}–${s.max})` : ""}<br>${l.desc}`;
  document.getElementById("modeDesc").textContent = MODES[currentMode].desc;
}

function generate() {
  const l = currentLottery;
  const n = parseInt(document.getElementById("numCartelas").value);
  const btn = document.getElementById("genBtn");
  document.getElementById("genLabel").textContent = "Sorteando...";
  btn.classList.add("loading");

  setTimeout(() => {
    const cartelas = [];
    for (let i = 0; i < n; i++) {
      const nums = pickNums(l, currentMode);
      const special = l.special ? pickSpecial(l.special) : null;
      cartelas.push({ nums, special });
    }

    const unique = new Set(cartelas.map((c) => c.nums.join(","))).size;
    document.getElementById("s1").textContent = n;
    document.getElementById("s2").textContent = l.pick;
    document.getElementById("s3").textContent = unique;
    document.getElementById("statsBar").style.display = "grid";

    const ra = document.getElementById("resultsArea");
    ra.innerHTML = cartelas
      .map((c, i) => {
        const balls = c.nums
          .map((n) => {
            const cls = classify(n, l);
            const title =
              cls === "hot"
                ? "Número quente (frequente)"
                : cls === "warm"
                  ? "Número morno"
                  : cls === "cold"
                    ? "Número frio (raro)"
                    : "Número normal";
            return renderBall(n, cls, title);
          })
          .join("");
        const sp = c.special
          ? `<div class="ball-divider"></div>${c.special.map((n) => renderBall(n, "special", l.special.label)).join("")}`
          : "";
        const hasSpecial = c.special && c.special.length > 0;
        return `<div class="cartela">
          <div class="cartela-header">
            <span class="cartela-num">CARTELA ${String(i + 1).padStart(2, "0")}</span>
            <span class="cartela-badge">${l.name}</span>
          </div>
          <div class="balls">${balls}${sp}</div>
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:var(--hot)"></div>Quente</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--warm)"></div>Morno</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--cold)"></div>Frio</div>
            <div class="legend-item"><div class="legend-dot" style="background:var(--text-dim);border-radius:50%"></div>Normal</div>
            ${hasSpecial ? `<div class="legend-item"><div class="legend-dot" style="background:var(--special)"></div>${l.special.label}</div>` : ""}
          </div>
        </div>`;
      })
      .join("");

    document.getElementById("genLabel").textContent = "Gerar novamente";
    document.getElementById("genIcon").textContent = "🔄";
    btn.classList.remove("loading");
  }, 300);
}
