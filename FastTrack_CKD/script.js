// Seite einblenden

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// =========================
// DROPDOWN
// =========================

const dropdown = document.querySelector(".custom-dropdown");

const button = dropdown.querySelector(".dropdown-button");

const menu = dropdown.querySelector(".dropdown-menu");

const options = dropdown.querySelectorAll(".dropdown-option");

const selectedOption = dropdown.querySelector(".selected-option");

const arrow = dropdown.querySelector(".arrow");

let selectedGender = null;

// Dropdown öffnen / schließen

button.addEventListener("click", (event) => {
  event.stopPropagation();

  menu.classList.toggle("active");

  arrow.classList.toggle("rotate");
});

// Option auswählen

options.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent.trim();

    selectedGender = Number(option.dataset.value);

    menu.classList.remove("active");

    arrow.classList.remove("rotate");
  });
});

// Dropdown schließen

document.addEventListener("click", () => {
  menu.classList.remove("active");

  arrow.classList.remove("rotate");
});

// =========================
// CKD-EPI 2021
// =========================

function calculateCKDEPI2021(age, male, creatinine) {
  let kappa;
  let alpha;

  if (male === 1) {
    // Männer

    kappa = 0.9;
    alpha = -0.302;
  } else {
    // Frauen

    kappa = 0.7;
    alpha = -0.241;
  }

  const creatinineRatio = creatinine / kappa;

  const minValue = Math.min(creatinineRatio, 1);

  const maxValue = Math.max(creatinineRatio, 1);

  let egfr =
    142 *
    Math.pow(minValue, alpha) *
    Math.pow(maxValue, -1.2) *
    Math.pow(0.9938, age);

  // Faktor nur bei Frauen

  if (male === 0) {
    egfr *= 1.012;
  }

  return egfr;
}

// =========================
// KFRE
// =========================

function kfre(age, male, egfr, acr) {
  const lp =
    -0.2201 * (age / 10 - 7.036) +
    0.2467 * (male - 0.5642) -
    0.5567 * (egfr / 5 - 7.222) +
    0.451 * (Math.log(acr) - 5.137);

  const risk2 = 1 - Math.pow(0.9832, Math.exp(lp));

  const risk5 = 1 - Math.pow(0.9365, Math.exp(lp));

  return {
    risk2: risk2 * 100,

    risk5: risk5 * 100,
  };
}

// =========================
// BERECHNUNG
// =========================

document.getElementById("calculate-button").addEventListener("click", () => {
  const age = Number(document.getElementById("age").value);

  const creatinine = Number(document.getElementById("creatinine").value);

  const acr = Number(document.getElementById("acr").value);

  // Eingaben überprüfen

  if (age < 18 || creatinine <= 0 || acr <= 0 || selectedGender === null) {
    alert("Bitte alle Werte eingeben und ein Geschlecht auswählen.");

    return;
  }

  // =========================
  // eGFR berechnen
  // =========================

  // eGFR berechnen
  const egfr = calculateCKDEPI2021(age, selectedGender, creatinine);

  // eGFR anzeigen
  document.getElementById("egfr-result").value = egfr.toFixed(1);

  // Prüfen, ob der Risikokalkulator gültig ist
  if (egfr >= 61) {
    alert(
      "Der Risikokalkulator ist nur für eine eGFR unter 61 ml/min validiert, eine Schätzung ist nicht möglich.",
    );

    document.getElementById("risk2").textContent = "-";
    document.getElementById("risk5").textContent = "-";

    return;
  }

  // =========================
  // KFRE berechnen
  // =========================

  const result = kfre(age, selectedGender, egfr, acr);

  // Ergebnisse anzeigen

  document.getElementById("risk2").textContent = result.risk2.toFixed(2) + "%";

  document.getElementById("risk5").textContent = result.risk5.toFixed(2) + "%";
});
