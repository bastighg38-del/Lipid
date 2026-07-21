// Seite einblenden
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// =========================
// SWEETALERT2 POPUP
// =========================

function showPopup(title, text, icon = "info") {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    confirmButtonColor: "#2563eb",
    background: "#fff",
    color: "#1f2937",
    allowOutsideClick: true,
    allowEscapeKey: true,
  });
}

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

button.addEventListener("click", (event) => {
  event.stopPropagation();
  menu.classList.toggle("active");
  arrow.classList.toggle("rotate");
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent.trim();
    selectedGender = Number(option.dataset.value);
    menu.classList.remove("active");
    arrow.classList.remove("rotate");
  });
});

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
    kappa = 0.9;
    alpha = -0.302;
  } else {
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

  // Fehlende Eingaben
  if (!age || creatinine <= 0 || acr <= 0 || selectedGender === null) {
    showPopup(
      "Fehlende Eingaben",
      "Bitte alle Werte eingeben und ein Geschlecht auswählen.",
      "warning",
    );
    return;
  }

  // Alter unter 18 Jahren
  if (age < 18) {
    showPopup(
      "Berechnung nicht möglich",
      "Die Risikoabschätzung ist nur für Personen ab 18 Jahren validiert.",
      "error",
    );

    document.getElementById("egfr-result").value = "-";
    document.getElementById("risk2").textContent = "-";
    document.getElementById("risk5").textContent = "-";
    return;
  }

  const egfr = calculateCKDEPI2021(age, selectedGender, creatinine);

  document.getElementById("egfr-result").value = egfr.toFixed(1);

  // Alter > 99 Jahre
  if (age > 99) {
    showPopup(
      "Berechnung nicht möglich",
      "Eine Risikoabschätzung ist bei Menschen über 99 Jahre nicht möglich.",
      "error",
    );

    document.getElementById("risk2").textContent = "-";
    document.getElementById("risk5").textContent = "-";
    return;
  }

  // eGFR < 10 ml/min
  if (egfr < 10) {
    showPopup(
      "Berechnung nicht möglich",
      "Bei einer eGFR unter 10 ml/min liegt im Regelfall bereits nierenersatztherapiepflichtiges Nierenversagen vor. Eine Risikoabschätzung ist daher nicht sinnvoll.",
      "error",
    );

    document.getElementById("risk2").textContent = "-";
    document.getElementById("risk5").textContent = "-";
    return;
  }

  // eGFR ≥ 61 ml/min
  if (egfr >= 61) {
    showPopup(
      "Berechnung nicht möglich",
      "Der Risikokalkulator ist nur für eine eGFR unter 61 ml/min validiert. Eine Schätzung ist daher nicht möglich.",
      "error",
    );

    document.getElementById("risk2").textContent = "-";
    document.getElementById("risk5").textContent = "-";
    return;
  }

  const result = kfre(age, selectedGender, egfr, acr);

  document.getElementById("risk2").textContent = result.risk2.toFixed(2) + "%";
  document.getElementById("risk5").textContent = result.risk5.toFixed(2) + "%";
});
