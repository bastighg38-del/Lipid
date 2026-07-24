// =========================
// SEITE EINBLENDEN
// =========================

function berechneCKDStadium(eGFR, acr) {
  let G;
  let A;
  let risiko;
  let beschreibung;

  // G-Stadium anhand der eGFR
  if (eGFR >= 90) {
    G = "G1";
    beschreibung = "normal bis erhöht (Hyperfiltration)";
  } else if (eGFR >= 60) {
    G = "G2";
    beschreibung = "mild eingeschränkt bis normal";
  } else if (eGFR >= 45) {
    G = "G3a";
    beschreibung = "mild bis mittelschwer eingeschränkt";
  } else if (eGFR >= 30) {
    G = "G3b";
    beschreibung = "schwer bis mittelschwer eingeschränkt";
  } else if (eGFR >= 15) {
    G = "G4";
    beschreibung = "schwer eingeschränkt";
  } else {
    G = "G5";
    beschreibung = "Nierenversagen";
  }

  // A-Stadium anhand des ACR
  if (acr < 30) {
    A = "A1";
  } else if (acr < 300) {
    A = "A2";
  } else {
    A = "A3";
  }

  // Risiko aus G- und A-Stadium
  const risikoTabelle = {
    G1: { A1: 1, A2: 1, A3: 2 },
    G2: { A1: 1, A2: 1, A3: 2 },
    G3a: { A1: 1, A2: 2, A3: 3 },
    G3b: { A1: 2, A2: 3, A3: 3 },
    G4: { A1: 3, A2: 3, A3: "4+" },
    G5: { A1: "4+", A2: "4+", A3: "4+" },
  };

  risiko = risikoTabelle[G][A];

  return {
    G,
    A,
    risiko,
    beschreibung,
  };
}

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
// LOCAL STORAGE
// =========================

const STORAGE_KEY = "ckdCalculatorData";

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

// =========================
// DATEN SPEICHERN
// =========================

function saveData() {
  const data = {
    age: document.getElementById("age").value,
    creatinine: document.getElementById("creatinine").value,
    acr: document.getElementById("acr").value,

    selectedGender: selectedGender,
    genderText: selectedOption.textContent,

    egfr: document.getElementById("egfr-result").value,
    risk2: document.getElementById("risk2").textContent,
    risk5: document.getElementById("risk5").textContent,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =========================
// DATEN LADEN
// =========================

function loadData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) return;

  const data = JSON.parse(savedData);

  document.getElementById("age").value = data.age || "";

  document.getElementById("creatinine").value = data.creatinine || "";

  document.getElementById("acr").value = data.acr || "";

  if (data.selectedGender !== null && data.selectedGender !== undefined) {
    selectedGender = Number(data.selectedGender);

    selectedOption.textContent = data.genderText || "Option auswählen";
  }

  document.getElementById("egfr-result").value = data.egfr || "";

  document.getElementById("risk2").textContent = data.risk2 || "—";

  document.getElementById("risk5").textContent = data.risk5 || "—";
}

// =========================
// DROPDOWN ÖFFNEN
// =========================

button.addEventListener("click", (event) => {
  event.stopPropagation();

  menu.classList.toggle("active");
  arrow.classList.toggle("rotate");
});

// =========================
// GESCHLECHT AUSWÄHLEN
// =========================

options.forEach((option) => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent.trim();

    selectedGender = Number(option.dataset.value);

    menu.classList.remove("active");
    arrow.classList.remove("rotate");

    saveData();
  });
});

// =========================
// DROPDOWN SCHLIESSEN
// =========================

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

  // Alter unter 18
  if (age < 18) {
    showPopup(
      "Berechnung nicht möglich",
      "Die Risikoabschätzung ist nur für Personen ab 18 Jahren validiert.",
      "error",
    );

    document.getElementById("egfr-result").value = "-";

    document.getElementById("risk2").textContent = "—";

    document.getElementById("risk5").textContent = "—";

    saveData();

    return;
  }

  const egfr = calculateCKDEPI2021(age, selectedGender, creatinine);

  document.getElementById("egfr-result").value = egfr.toFixed(1);

  // Alter über 99
  if (age > 99) {
    showPopup(
      "Berechnung nicht möglich",
      "Eine Risikoabschätzung ist bei Menschen über 99 Jahre nicht möglich.",
      "error",
    );

    document.getElementById("risk2").textContent = "—";

    document.getElementById("risk5").textContent = "—";

    saveData();

    return;
  }

  // eGFR unter 10
  if (egfr < 10) {
    showPopup(
      "Berechnung nicht möglich",
      "Bei einer eGFR unter 10 ml/min liegt im Regelfall bereits nierenersatztherapiepflichtiges Nierenversagen vor. Eine Risikoabschätzung ist daher nicht sinnvoll.",
      "error",
    );

    document.getElementById("risk2").textContent = "—";

    document.getElementById("risk5").textContent = "—";

    saveData();

    return;
  }

  // eGFR ab 61
  if (egfr >= 61) {
    showPopup(
      "Berechnung nicht möglich",
      "Der Risikokalkulator ist nur für eine eGFR unter 61 ml/min validiert. Eine Schätzung ist daher nicht möglich.",
      "error",
    );

    document.getElementById("risk2").textContent = "—";

    document.getElementById("risk5").textContent = "—";

    saveData();

    return;
  }

  const result = kfre(age, selectedGender, egfr, acr);

  document.getElementById("risk2").textContent = result.risk2.toFixed(0) + "%";

  document.getElementById("risk5").textContent = result.risk5.toFixed(0) + "%";

  saveData();

  let output = document.getElementById("Resulttext");

  let outputText = "";

  // CKD-Stadium berechnen
  const ckdErgebnis = berechneCKDStadium(egfr, acr);

  const G = ckdErgebnis.G;
  const A = ckdErgebnis.A;
  const risiko = ckdErgebnis.risiko;
  const beschreibung = ckdErgebnis.beschreibung;

  // Geschlecht
  if (selectedGender === 1) {
    outputText +=
      "Der Patient stellte sich zur Beurteilung der Nierenfunktion vor.<br>";
  } else {
    outputText +=
      "Die Patientin stellte sich zur Beurteilung der Nierenfunktion vor.<br>";
  }

  // Laborwerte
  outputText += `

<p>Folgende Laborwerte wurden zur Verfügung gestellt:</p>

<ul>
    <li>Kreatinin: ${creatinine} mg/dl</li>
    <li>eGFR (CKD-EPI): ${egfr.toFixed(1)} ml/min/1,73 m²</li>
    <li>UACR: ${acr} mg/g Kreatinin</li>
</ul>

`;

  // CKD-Stadium
  outputText += `
<p>
Es liegt eine <strong>${beschreibung}</strong> Nierenfunktion im Stadium
<strong>${G}${A}</strong> nach KDIGO vor.
</p>
`;

  output.innerHTML = outputText;
});

// =========================
// INPUTS AUTOMATISCH SPEICHERN
// =========================

document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", saveData);
});

// =========================
// RESET BUTTON
// =========================

const resetButton = document.getElementById("resetBtn");

if (resetButton) {
  resetButton.addEventListener("click", () => {
    // Local Storage löschen
    localStorage.removeItem(STORAGE_KEY);

    // Eingabefelder leeren
    document.getElementById("age").value = "";

    document.getElementById("creatinine").value = "";

    document.getElementById("acr").value = "";

    // Geschlecht zurücksetzen
    selectedGender = null;

    selectedOption.textContent = "Option auswählen";

    // Ergebnisse zurücksetzen
    document.getElementById("egfr-result").value = "";

    document.getElementById("risk2").textContent = "—";

    document.getElementById("risk5").textContent = "—";
  });
}

// =========================
// GESPEICHERTE DATEN LADEN
// =========================

loadData();
