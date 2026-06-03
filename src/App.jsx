import { useState, useEffect, useCallback } from "react";

// ─── Spark Config ──────────────────────────────────────────────────────────────
const SPARK_BASE = "https://excel.uat.jp.coherent.global";
const TENANT = "actuarial";
const FOLDER = "Motor Model Demo";
const SERVICE = "Motor Rating Model";
const API_KEY = "cdd4ed03-0071-4c22-878a-8f103788c881";

const EXECUTE_URL = `${SPARK_BASE}/${TENANT}/api/v3/folders/${encodeURIComponent(FOLDER)}/services/${encodeURIComponent(SERVICE)}/execute`;
const VALIDATION_URL = `${SPARK_BASE}/${TENANT}/api/v3/folders/${encodeURIComponent(FOLDER)}/services/${encodeURIComponent(SERVICE)}/validation`;

const HEADERS = {
  "Content-Type": "application/json",
  "x-synthetic-key": API_KEY,
  "x-tenant-name": TENANT,
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    min-height: 100vh;
    background: #0c0f0e;
    font-family: 'DM Sans', sans-serif;
    color: #e8ebe9;
    padding: 0 0 80px;
  }

  .app-header {
    background: #0c0f0e;
    border-bottom: 1px solid #1e2420;
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .app-header-left { display: flex; align-items: center; gap: 16px; }

  .spark-badge {
    background: #1a2e24;
    border: 1px solid #2a4a35;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #4ade80;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .spark-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .app-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: #f0f4f1;
    font-weight: 400;
  }

  .app-title span { color: #4ade80; }

  .validation-status {
    font-size: 12px;
    color: #6b7a70;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .app-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 40px 0;
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
  }

  .form-col { display: flex; flex-direction: column; gap: 16px; }

  .section-card {
    background: #111614;
    border: 1px solid #1e2420;
    border-radius: 12px;
    overflow: hidden;
  }

  .section-header {
    padding: 14px 20px;
    border-bottom: 1px solid #1a1f1d;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .icon-vehicle { background: #1a2535; color: #60a5fa; }
  .icon-person  { background: #1e1a35; color: #a78bfa; }
  .icon-cover   { background: #1a2520; color: #34d399; }
  .icon-addons  { background: #2a1a20; color: #f87171; }
  .icon-other   { background: #252015; color: #fbbf24; }

  .section-title {
    font-size: 13px;
    font-weight: 500;
    color: #c8d4cc;
    letter-spacing: 0.03em;
  }

  .section-body {
    padding: 18px 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .section-body.single { grid-template-columns: 1fr; }

  .field { display: flex; flex-direction: column; gap: 5px; }
  .field.full { grid-column: 1 / -1; }

  .field-label {
    font-size: 11px;
    font-weight: 500;
    color: #5a6b60;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .field-label .dynamic-tag {
    display: inline-block;
    margin-left: 5px;
    padding: 1px 5px;
    background: #1e1a35;
    border: 1px solid #3a2f6a;
    border-radius: 3px;
    font-size: 9px;
    color: #a78bfa;
    letter-spacing: 0.04em;
    text-transform: none;
    font-weight: 400;
  }

  .field-label .dep-tag {
    display: inline-block;
    margin-left: 5px;
    padding: 1px 5px;
    background: #1a2520;
    border: 1px solid #2a4a35;
    border-radius: 3px;
    font-size: 9px;
    color: #4ade80;
    letter-spacing: 0.04em;
    text-transform: none;
    font-weight: 400;
  }

  .field select,
  .field input[type="text"],
  .field input[type="date"],
  .field input[type="number"] {
    background: #0c0f0e;
    border: 1px solid #1e2420;
    border-radius: 7px;
    padding: 8px 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #e8ebe9;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
  }

  .field select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6b60' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 28px;
  }

  .field select:focus,
  .field input:focus {
    border-color: #2a4a35;
    box-shadow: 0 0 0 3px rgba(74,222,128,0.06);
  }

  .field input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.4) sepia(1) saturate(0.5) hue-rotate(80deg);
    cursor: pointer;
    opacity: 0.6;
  }

  .field-hint {
    font-size: 10px;
    color: #3a4a3f;
    margin-top: 2px;
  }

  .field-hint.dynamic { color: #5a4a8a; }

  .addons-grid {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .addon-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #0c0f0e;
    border: 1px solid #1a1f1d;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    user-select: none;
  }

  .addon-row:hover { border-color: #2a3a30; }

  .addon-row.checked {
    border-color: #2a4a35;
    background: #0e1710;
  }

  .addon-checkbox {
    width: 16px;
    height: 16px;
    border: 1.5px solid #2a3a30;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.1s;
  }

  .addon-row.checked .addon-checkbox {
    background: #16a34a;
    border-color: #16a34a;
  }

  .addon-checkmark { color: white; font-size: 10px; font-weight: 700; }

  .addon-info { flex: 1; }
  .addon-name { font-size: 12px; color: #c8d4cc; font-weight: 400; }
  .addon-price { font-size: 11px; color: #4a5a50; margin-top: 1px; }

  .addon-badge {
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 500;
  }
  .addon-badge.enabled { background: #1a2e24; color: #4ade80; }
  .addon-badge.disabled { background: #1e1a1a; color: #6a4040; }

  .result-col { position: sticky; top: 88px; }

  .result-card {
    background: #111614;
    border: 1px solid #1e2420;
    border-radius: 12px;
    overflow: hidden;
  }

  .result-header {
    padding: 16px 20px;
    border-bottom: 1px solid #1a1f1d;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .result-header-title {
    font-size: 13px;
    font-weight: 500;
    color: #c8d4cc;
  }

  .result-body { padding: 20px; }

  .quote-btn {
    width: 100%;
    background: #16a34a;
    border: none;
    border-radius: 8px;
    padding: 13px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .quote-btn:hover { background: #15803d; }
  .quote-btn:active { transform: scale(0.99); }
  .quote-btn:disabled { background: #1a2420; color: #3a4a3f; cursor: not-allowed; transform: none; }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .premium-display {
    text-align: center;
    padding: 24px 0 20px;
    border-bottom: 1px solid #1a1f1d;
    margin-bottom: 16px;
  }

  .premium-label { font-size: 11px; color: #4a5a50; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }

  .premium-amount {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    color: #4ade80;
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  .premium-currency { font-size: 20px; color: #2a8a50; margin-right: 2px; }

  .uw-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    margin-top: 8px;
  }

  .uw-quote { background: #1a2e24; color: #4ade80; border: 1px solid #2a4a35; }
  .uw-decline { background: #2a1a1a; color: #f87171; border: 1px solid #4a2a2a; }
  .uw-refer { background: #2a2010; color: #fbbf24; border: 1px solid #4a3a15; }

  .breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 12px;
    border-bottom: 1px solid #151a17;
  }

  .breakdown-row:last-child { border-bottom: none; }
  .breakdown-label { color: #5a6b60; }
  .breakdown-value { color: #c8d4cc; font-weight: 500; font-variant-numeric: tabular-nums; }
  .breakdown-value.accent { color: #4ade80; }

  .discount-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: #1a2535;
    border: 1px solid #2a3a55;
    border-radius: 5px;
    font-size: 11px;
    color: #60a5fa;
    margin-top: 10px;
  }

  .error-box {
    background: #1e0f0f;
    border: 1px solid #4a2020;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 12px;
    color: #f87171;
    line-height: 1.5;
  }

  .placeholder-state {
    text-align: center;
    padding: 32px 20px;
  }

  .placeholder-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
  .placeholder-text { font-size: 13px; color: #3a4a3f; line-height: 1.5; }

  .validation-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    font-size: 12px;
    color: #4a5a50;
    border-bottom: 1px solid #1a1f1d;
  }

  .spinner-sm {
    width: 10px;
    height: 10px;
    border: 1.5px solid #2a3a30;
    border-top-color: #4ade80;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .meta-section {
    margin-top: 16px;
    border-top: 1px solid #1a1f1d;
    padding-top: 14px;
  }

  .meta-title { font-size: 10px; color: #3a4a3f; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }

  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #3a4a3f;
    padding: 2px 0;
  }

  .meta-val { color: #5a6b60; font-variant-numeric: tabular-nums; }

  .final-btn {
    width: 100%;
    background: transparent;
    border: 1px solid #2a4a35;
    border-radius: 8px;
    padding: 11px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #4ade80;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, border-color 0.15s;
    margin-top: 10px;
    letter-spacing: 0.01em;
  }

  .final-btn:hover { background: #0e1a12; border-color: #3a6a45; }
  .final-btn:active { transform: scale(0.99); }
  .final-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: #111614;
    border: 1px solid #1e2420;
    border-radius: 14px;
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #1a1f1d;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-shrink: 0;
  }

  .modal-header-text {}
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: #f0f4f1; font-weight: 400; margin-bottom: 3px; }
  .modal-subtitle { font-size: 12px; color: #4a5a50; line-height: 1.4; }

  .modal-close {
    background: #1a1f1d;
    border: 1px solid #222a25;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: #5a6b60;
    flex-shrink: 0;
    transition: background 0.1s;
  }
  .modal-close:hover { background: #222a25; color: #c8d4cc; }

  .modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; flex: 1; }

  .modal-field { display: flex; flex-direction: column; gap: 5px; }
  .modal-label { font-size: 11px; font-weight: 500; color: #5a6b60; letter-spacing: 0.06em; text-transform: uppercase; }

  .modal-field input[type="email"],
  .modal-field input[type="text"],
  .modal-field textarea {
    background: #0c0f0e;
    border: 1px solid #1e2420;
    border-radius: 7px;
    padding: 9px 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #e8ebe9;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    resize: none;
  }

  .modal-field input:focus, .modal-field textarea:focus {
    border-color: #2a4a35;
    box-shadow: 0 0 0 3px rgba(74,222,128,0.06);
  }

  .modal-preview {
    background: #0c0f0e;
    border: 1px solid #1a1f1d;
    border-radius: 8px;
    padding: 14px;
    font-size: 12px;
    color: #8a9e90;
    line-height: 1.7;
    white-space: pre-wrap;
    max-height: 220px;
    overflow-y: auto;
  }

  .modal-preview-label {
    font-size: 10px;
    color: #3a4a3f;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #1a1f1d;
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }

  .modal-send-btn {
    flex: 1;
    background: #16a34a;
    border: none;
    border-radius: 8px;
    padding: 11px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s;
  }
  .modal-send-btn:hover { background: #15803d; }
  .modal-send-btn:disabled { background: #1a2420; color: #3a4a3f; cursor: not-allowed; }

  .modal-cancel-btn {
    background: transparent;
    border: 1px solid #1e2420;
    border-radius: 8px;
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #5a6b60;
    cursor: pointer;
    transition: border-color 0.1s, color 0.1s;
  }
  .modal-cancel-btn:hover { border-color: #2a3a30; color: #c8d4cc; }

  .modal-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px 24px;
    gap: 10px;
  }
  .modal-success-icon { font-size: 36px; }
  .modal-success-title { font-family: 'DM Serif Display', serif; font-size: 18px; color: #4ade80; }
  .modal-success-text { font-size: 12px; color: #4a5a50; line-height: 1.5; }

  .final-loading-note {
    font-size: 11px;
    color: #3a4a3f;
    text-align: center;
    margin-top: 6px;
  }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(n) {
  if (n == null || n === "") return "-";
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Field Component ───────────────────────────────────────────────────────────
function Field({ id, label, validation, value, onChange, disabled }) {
  if (!validation) return null;

  const { validation_allow, validation_type, dependent_inputs, options, min, max, ignore_blank } = validation;
  const isDynamic = validation_type === "dynamic";
  const hasDeps = dependent_inputs && dependent_inputs.length > 0;

  const renderInput = () => {
    if (validation_allow === "List" && options && options.length > 0) {
      return (
        <select id={id} value={value ?? ""} onChange={e => onChange(id, e.target.value)} disabled={disabled}>
          {ignore_blank && <option value="">-- select --</option>}
          {options.filter(o => o !== "#SPARKBLANKOPTION#").map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (validation_allow === "Date") {
      return (
        <input
          type="date"
          id={id}
          value={value ?? ""}
          min={min ? min.substring(0, 10) : undefined}
          max={max ? max.substring(0, 10) : undefined}
          onChange={e => onChange(id, e.target.value)}
          disabled={disabled}
        />
      );
    }
    if (validation_allow === "WholeNumber" || validation_allow === "Decimal") {
      return (
        <input
          type="number"
          id={id}
          value={value ?? ""}
          min={min ?? undefined}
          max={max ?? undefined}
          onChange={e => onChange(id, e.target.value === "" ? null : Number(e.target.value))}
          disabled={disabled}
        />
      );
    }
    return (
      <input
        type="text"
        id={id}
        value={value ?? ""}
        onChange={e => onChange(id, e.target.value === "" ? null : e.target.value)}
        disabled={disabled}
      />
    );
  };

  const labelText = id.replace(/_/g, " ").replace(/^[A-Z0-9]+ /, "");

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {labelText}
        {isDynamic && <span className="dynamic-tag">dynamic</span>}
        {hasDeps && <span className="dep-tag">triggers update</span>}
      </label>
      {renderInput()}
    </div>
  );
}

// ─── Addon Row ─────────────────────────────────────────────────────────────────
const ADDON_LABELS = {
  D01_Addon_1: { name: "Personal Accident per Person", price: "$3,000" },
  D02_Addon_2: { name: "Hospital Benefit", price: "$2,000" },
  D03_Addon_3: { name: "Natural Perils (Flood, Quake, Hail)", price: "$1,000" },
  D04_Addon_4: { name: "Roadside Assistance", price: "Included" },
  D05_Addon_5: { name: "Motor Warranty Cover", price: "$2,500" },
};

function AddonRow({ id, value, onChange, enabled }) {
  const info = ADDON_LABELS[id] || { name: id, price: "" };
  const checked = value === "Y";
  return (
    <div className={`addon-row ${checked ? "checked" : ""}`} onClick={() => onChange(id, checked ? "N" : "Y")}>
      <div className="addon-checkbox">
        {checked && <span className="addon-checkmark">✓</span>}
      </div>
      <div className="addon-info">
        <div className="addon-name">{info.name}</div>
        <div className="addon-price">{info.price}</div>
      </div>
      {enabled !== undefined && (
        <span className={`addon-badge ${enabled === "Y" ? "enabled" : "disabled"}`}>
          {enabled === "Y" ? "Available" : "Unavailable"}
        </span>
      )}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function MotorRatingApp() {
  const [validations, setValidations] = useState(null);
  const [validationLoading, setValidationLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [inputs, setInputs] = useState({});
  const [quoting, setQuoting] = useState(false);
  const [result, setResult] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [dynamicUpdating, setDynamicUpdating] = useState(false);
  const [finalQuoting, setFinalQuoting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // ── Load initial validations on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(VALIDATION_URL, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ request_data: {}, request_meta: {} }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        const vFields = data?.response_data?.outputs ?? data?.outputs ?? {};
        setValidations(vFields);

        // Seed inputs from default_value
        const seeded = {};
        for (const [k, v] of Object.entries(vFields)) {
          if (v.default_value !== undefined && v.default_value !== null) {
            seeded[k] = v.default_value;
          } else {
            seeded[k] = null;
          }
        }
        setInputs(seeded);
      } catch (e) {
        setValidationError(e.message);
      } finally {
        setValidationLoading(false);
      }
    })();
  }, []);

  // ── Dynamic validation refresh ──
  const refreshDynamic = useCallback(async (changedId, currentInputs) => {
    setDynamicUpdating(true);
    try {
      const cleanInputs = Object.fromEntries(
        Object.entries(currentInputs).filter(([, v]) => v !== null && v !== "")
      );
      const res = await fetch(VALIDATION_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          request_data: { inputs: cleanInputs },
          request_meta: { validation_type: "dynamic" },
        }),
      });
      const data = await res.json();
      if (!res.ok) return;
      const updated = data?.response_data?.outputs ?? data?.outputs ?? {};
      if (Object.keys(updated).length > 0) {
        setValidations(prev => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(updated)) {
            next[k] = { ...next[k], ...v };
          }
          return next;
        });
        // Clear any inputs whose options no longer include current value
        setInputs(prev => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(updated)) {
            if (v.options && !v.options.includes(next[k])) {
              next[k] = v.options[0] ?? null;
            }
          }
          return next;
        });
      }
    } catch (_) {}
    setDynamicUpdating(false);
  }, []);

  // ── Handle input change ──
  const handleChange = useCallback((id, val) => {
    setInputs(prev => {
      const next = { ...prev, [id]: val };
      // Check if this field has dependent_inputs
      const fieldValidation = validations?.[id];
      if (fieldValidation?.dependent_inputs?.length > 0) {
        refreshDynamic(id, next);
      }
      return next;
    });
  }, [validations, refreshDynamic]);

  // ── Execute quote ──
  const handleQuote = async () => {
    setQuoting(true);
    setQuoteError(null);
    setResult(null);
    try {
      const cleanInputs = Object.fromEntries(
        Object.entries(inputs).map(([k, v]) => [k, v === "" ? null : v])
      );
      const res = await fetch(EXECUTE_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          request_data: { inputs: cleanInputs },
          request_meta: {
            version_id: null,
            transaction_date: null,
            call_purpose: "Get Quote",
            source_system: "spark-integration-demo",
            correlation_id: null,
            service_category: "All",
            requested_output: null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const outputs = data?.response_data?.outputs ?? data?.outputs;
      if (!outputs) throw new Error("No outputs returned.");
      setResult({ outputs, meta: data?.response_meta });
    } catch (e) {
      setQuoteError(e.message);
    } finally {
      setQuoting(false);
    }
  };

  // ── Final Quotation: re-call with call_purpose = Final Quotations, then open modal ──
  const handleFinalQuotation = async () => {
    setFinalQuoting(true);
    try {
      const cleanInputs = Object.fromEntries(
        Object.entries(inputs).map(([k, v]) => [k, v === "" ? null : v])
      );
      const res = await fetch(EXECUTE_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          request_data: { inputs: cleanInputs },
          request_meta: {
            version_id: null,
            transaction_date: null,
            call_purpose: "Final Quotations",
            source_system: "spark-integration-demo",
            correlation_id: null,
            service_category: "All",
            requested_output: null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const outputs = data?.response_data?.outputs ?? data?.outputs;
      if (!outputs) throw new Error("No outputs returned.");
      const finalData = { outputs, meta: data?.response_meta };
      setFinalResult(finalData);

      const firstName = inputs.E02_FirstName || "";
      const sureName  = inputs.E03_SureName || "";
      const name = [firstName, sureName].filter(Boolean).join(" ") || "Customer";
      setEmailSubject(`Motor Insurance — Final Quotation for ${name} | Ref: ${(data?.response_meta?.call_id || "").substring(0,8).toUpperCase()}`);
      setEmailSent(false);
      setShowModal(true);
    } catch (e) {
      setQuoteError("Final Quotation error: " + e.message);
    } finally {
      setFinalQuoting(false);
    }
  };

  // ── Build email body from inputs + outputs ──
  const buildEmailBody = (fr) => {
    if (!fr) return "";
    const o = fr.outputs;
    const addonsSelected = [
      inputs.D01_Addon_1 === "Y" ? "Personal Accident per Person ($3,000)" : null,
      inputs.D02_Addon_2 === "Y" ? "Hospital Benefit ($2,000)" : null,
      inputs.D03_Addon_3 === "Y" ? "Natural Perils – Flood, Quake, Hail ($1,000)" : null,
      inputs.D04_Addon_4 === "Y" ? "Roadside Assistance (Included)" : null,
      inputs.D05_Addon_5 === "Y" ? "Motor Warranty Cover ($2,500)" : null,
    ].filter(Boolean);

    const firstName = inputs.E02_FirstName || "";
    const sureName  = inputs.E03_SureName || "";
    const name = [firstName, sureName].filter(Boolean).join(" ") || "Customer";

    return `Dear ${name},

Thank you for your interest in motor insurance coverage. Please find below your final quotation, prepared using our Coherent Spark rating engine.

──────────────────────────────
POLICYHOLDER DETAILS
──────────────────────────────
Name:                  ${name}
Date of Birth (PH):    ${inputs.B01_PH_DOB || "-"}
Gender (PH):           ${inputs.B03_PH_Gender === "M" ? "Male" : inputs.B03_PH_Gender === "F" ? "Female" : "-"}
Additional Driver DOB: ${inputs.B02_Additional_Driver_DOB || "-"}
Additional Driver:     ${inputs.B04_Additional_Driver_Gender === "M" ? "Male" : inputs.B04_Additional_Driver_Gender === "F" ? "Female" : "-"}
Home Address:          ${inputs.B05_Home_Address || "-"}

──────────────────────────────
VEHICLE DETAILS
──────────────────────────────
Vehicle Group:         ${inputs.A01_Vehicle_Group ?? "-"}
Manufacture Year:      ${inputs.A02_Vehicle_Manufacture_Year ?? "-"}

──────────────────────────────
COVER DETAILS
──────────────────────────────
Cover Type:            ${inputs.C02_CoverType || "-"}
Policy Start Date:     ${inputs.C01_Policy_Start_Date || "-"}
Business Use:          ${inputs.C03_Business_Use === "Y" ? "Yes" : "No"}
Voluntary Excess:      ${inputs.C05_Voluntary_Excess || "-"}
NCD Discount:          ${inputs.B06_NCD_Discount != null ? inputs.B06_NCD_Discount + "%" : "-"}
TP Limit:              ${inputs.C06_Limit1 || "-"}
${inputs.C04_Discount_Code ? `Discount Code:         ${inputs.C04_Discount_Code}` : ""}

──────────────────────────────
ADD-ONS SELECTED
──────────────────────────────
${addonsSelected.length > 0 ? addonsSelected.map(a => `• ${a}`).join("\n") : "None selected"}

──────────────────────────────
PREMIUM BREAKDOWN
──────────────────────────────
Gross Premium (pre-discount): $${fmtCurrency(o.B01_Gross_Prem_before_discount)}
Gross Premium:                $${fmtCurrency(o.B02_Gross_Prem)}
Tax:                          $${fmtCurrency(o.B03_Tax)}
Commission:                   $${fmtCurrency(o.B04_Commission)}
────────────────────────────
TOTAL PREMIUM:                $${fmtCurrency(o.B05_Total_Premium)}

Underwriting Status:   ${o.A01_Quote || "-"}${o.A02_Quote_Reason && o.A02_Quote_Reason !== "Nil" ? ` (${o.A02_Quote_Reason})` : ""}
${o.C01_Discount_Code_Chk && o.C01_Discount_Code_Chk !== "NoCode" ? `Discount Applied:      ${o.C01_Discount_Code_Chk}` : ""}

──────────────────────────────
This quotation is valid for 30 days from the date of issue and is subject to final underwriting review. For queries, please contact your account manager.

Reference ID: ${fr.meta?.call_id || "-"}
Generated via Coherent Spark Motor Rating Model v${fr.meta?.version || "-"}`;
  };

  // ── Send email (mailto fallback — real send requires backend) ──
  const handleSendEmail = async () => {
    if (!emailTo) return;
    setEmailSending(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate send delay
    const body = buildEmailBody(finalResult);
    const mailtoLink = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    setEmailSending(false);
    setEmailSent(true);
  };


  const vehicleFields   = ["A01_Vehicle_Group", "A02_Vehicle_Manufacture_Year"];
  const policyFields    = ["B01_PH_DOB", "B02_Additional_Driver_DOB", "B03_PH_Gender", "B04_Additional_Driver_Gender", "B05_Home_Address", "B06_NCD_Discount", "B07_Historical_Claims"];
  const coverFields     = ["C01_Policy_Start_Date", "C02_CoverType", "C03_Business_Use", "C04_Discount_Code", "C05_Voluntary_Excess", "C06_Limit1", "C07_Limit2", "C08_Limit3"];
  const addonFields     = ["D01_Addon_1", "D02_Addon_2", "D03_Addon_3", "D04_Addon_4", "D05_Addon_5"];
  const otherFields     = ["E01_Channel", "E02_FirstName", "E03_SureName"];

  const addonControl = result?.outputs?.["option.addon_control"] ?? [];
  const addonEnabledMap = {};
  addonControl.forEach(a => { addonEnabledMap[a.Addon] = a.Enable; });

  const uwStatus = result?.outputs?.A01_Quote;
  const uwReason = result?.outputs?.A02_Quote_Reason;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="app-header">
          <div className="app-header-left">
            <h1 className="app-title">Motor Rating <span>Model</span></h1>
            <span className="spark-badge">Coherent Spark · UAT JP</span>
          </div>
          <div className="validation-status">
            {validationLoading && <><div className="spinner-sm" /> Loading validations...</>}
            {!validationLoading && !validationError && <>
              {dynamicUpdating
                ? <><div className="spinner-sm" /> Updating dynamic fields...</>
                : <><span style={{color:"#2a4a35"}}>✓</span> Validation loaded</>}
            </>}
            {validationError && <span style={{color:"#f87171"}}>⚠ Validation error</span>}
          </div>
        </header>

        <div className="app-body">
          <div className="form-col">

            {/* Vehicle */}
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon icon-vehicle">🚗</span>
                <span className="section-title">Vehicle</span>
              </div>
              {validationLoading ? (
                <div className="validation-loading"><div className="spinner-sm" /> Loading fields...</div>
              ) : (
                <div className="section-body">
                  {vehicleFields.map(id => (
                    <Field key={id} id={id} label={id} validation={validations?.[id]} value={inputs[id]} onChange={handleChange} disabled={quoting} />
                  ))}
                </div>
              )}
            </div>

            {/* Policyholder */}
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon icon-person">👤</span>
                <span className="section-title">Policyholder & Drivers</span>
              </div>
              {validationLoading ? (
                <div className="validation-loading"><div className="spinner-sm" /> Loading fields...</div>
              ) : (
                <div className="section-body">
                  {policyFields.map(id => (
                    <Field key={id} id={id} label={id} validation={validations?.[id]} value={inputs[id]} onChange={handleChange} disabled={quoting} />
                  ))}
                </div>
              )}
            </div>

            {/* Cover */}
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon icon-cover">🛡</span>
                <span className="section-title">Cover Details</span>
              </div>
              {validationLoading ? (
                <div className="validation-loading"><div className="spinner-sm" /> Loading fields...</div>
              ) : (
                <div className="section-body">
                  {coverFields.map(id => (
                    <Field key={id} id={id} label={id} validation={validations?.[id]} value={inputs[id]} onChange={handleChange} disabled={quoting} />
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon icon-addons">➕</span>
                <span className="section-title">Add-ons</span>
              </div>
              {validationLoading ? (
                <div className="validation-loading"><div className="spinner-sm" /> Loading fields...</div>
              ) : (
                <div className="addons-grid">
                  {addonFields.map((id, i) => (
                    <AddonRow
                      key={id}
                      id={id}
                      value={inputs[id] ?? "N"}
                      onChange={handleChange}
                      enabled={addonEnabledMap[i + 1]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Other */}
            <div className="section-card">
              <div className="section-header">
                <span className="section-icon icon-other">📋</span>
                <span className="section-title">Channel & Customer</span>
              </div>
              {validationLoading ? (
                <div className="validation-loading"><div className="spinner-sm" /> Loading fields...</div>
              ) : (
                <div className="section-body">
                  {otherFields.map(id => (
                    <Field key={id} id={id} label={id} validation={validations?.[id]} value={inputs[id]} onChange={handleChange} disabled={quoting} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result panel */}
          <div className="result-col">
            <div className="result-card">
              <div className="result-header">
                <span className="result-header-title">Premium Quote</span>
                {result && <span style={{fontSize:"11px",color:"#3a4a3f"}}>v{result.meta?.version}</span>}
              </div>
              <div className="result-body">
                <button
                  className="quote-btn"
                  onClick={handleQuote}
                  disabled={quoting || validationLoading}
                >
                  {quoting ? <><div className="spinner" /> Getting quote...</> : "Get Quote"}
                </button>

                {quoteError && (
                  <div className="error-box" style={{marginTop:"14px"}}>
                    <strong>Error:</strong> {quoteError}
                  </div>
                )}

                {!result && !quoteError && (
                  <div className="placeholder-state">
                    <div className="placeholder-icon">📊</div>
                    <div className="placeholder-text">Fill in the form and click Get Quote to receive a live premium from Spark.</div>
                  </div>
                )}

                {result && (
                  <>
                    <div className="premium-display">
                      <div className="premium-label">Total Premium</div>
                      <div className="premium-amount">
                        <span className="premium-currency">$</span>
                        {fmtCurrency(result.outputs.B05_Total_Premium)}
                      </div>
                      {uwStatus && (
                        <div>
                          <span className={`uw-badge ${uwStatus === "Quote" ? "uw-quote" : uwStatus === "Refer" ? "uw-refer" : "uw-decline"}`}>
                            {uwStatus === "Quote" ? "✓" : "⚠"} {uwStatus}
                            {uwReason && uwReason !== "Nil" && ` — ${uwReason}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="breakdown-row">
                      <span className="breakdown-label">Gross premium (pre-discount)</span>
                      <span className="breakdown-value">{fmtCurrency(result.outputs.B01_Gross_Prem_before_discount)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Gross premium</span>
                      <span className="breakdown-value">{fmtCurrency(result.outputs.B02_Gross_Prem)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Tax</span>
                      <span className="breakdown-value">{fmtCurrency(result.outputs.B03_Tax)}</span>
                    </div>
                    <div className="breakdown-row">
                      <span className="breakdown-label">Commission</span>
                      <span className="breakdown-value">{fmtCurrency(result.outputs.B04_Commission)}</span>
                    </div>
                    <div className="breakdown-row" style={{paddingTop:"10px",marginTop:"4px",borderTop:"1px solid #2a3a2f",borderBottom:"none"}}>
                      <span className="breakdown-label" style={{fontWeight:500,color:"#c8d4cc"}}>Total premium</span>
                      <span className="breakdown-value accent">${fmtCurrency(result.outputs.B05_Total_Premium)}</span>
                    </div>

                    {result.outputs.C01_Discount_Code_Chk && result.outputs.C01_Discount_Code_Chk !== "NoCode" && (
                      <div className="discount-chip">
                        <span>🏷</span> Discount: {result.outputs.C01_Discount_Code_Chk}
                      </div>
                    )}

                    <div className="meta-section">
                      <div className="meta-title">Response metadata</div>
                      <div className="meta-row">
                        <span>Process time</span>
                        <span className="meta-val">{result.meta?.process_time}ms</span>
                      </div>
                      <div className="meta-row">
                        <span>Compiler</span>
                        <span className="meta-val">{result.meta?.compiler_type} {result.meta?.compiler_version}</span>
                      </div>
                      <div className="meta-row">
                        <span>Call ID</span>
                        <span className="meta-val" style={{maxWidth:"140px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{result.meta?.call_id}</span>
                      </div>
                      <div className="meta-row">
                        <span>Version</span>
                        <span className="meta-val">{result.meta?.version_id?.substring(0,8)}...</span>
                      </div>
                    </div>

                    <button
                      className="final-btn"
                      onClick={handleFinalQuotation}
                      disabled={finalQuoting || quoting}
                    >
                      {finalQuoting
                        ? <><div className="spinner" style={{borderTopColor:"#4ade80"}} /> Preparing...</>
                        : <>📄 Final Quotation</>}
                    </button>
                    {finalQuoting && <p className="final-loading-note">Re-calling Spark with call_purpose = Final Quotations...</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Quotation Email Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); } }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-header-text">
                <div className="modal-title">Final Quotation</div>
                <div className="modal-subtitle">
                  {emailSent
                    ? "Your email client has been opened with the quotation."
                    : "Enter recipient details to send this quotation by email."}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>
            </div>

            {emailSent ? (
              <div className="modal-success">
                <div className="modal-success-icon">✉️</div>
                <div className="modal-success-title">Email ready to send</div>
                <div className="modal-success-text">
                  Your default email client has been opened with the quotation pre-filled.<br />
                  Ref: {finalResult?.meta?.call_id?.substring(0, 8).toUpperCase()}
                </div>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  <div className="modal-field">
                    <label className="modal-label">Recipient email address</label>
                    <input
                      type="email"
                      placeholder="e.g. client@example.com"
                      value={emailTo}
                      onChange={e => setEmailTo(e.target.value)}
                    />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="modal-preview-label">Email body preview</div>
                    <div className="modal-preview">{buildEmailBody(finalResult)}</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>Close</button>
                  <button
                    className="modal-send-btn"
                    onClick={handleSendEmail}
                    disabled={!emailTo || emailSending}
                  >
                    {emailSending ? <><div className="spinner" /> Preparing...</> : <>✉ Send Quotation</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}