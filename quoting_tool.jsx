import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, Save, FileText, Copy, Check, AlertTriangle, ChevronDown, ChevronRight, X, Calendar, Folder } from "lucide-react";

// ============================================================
// PRICING DATA
// ============================================================

const DESIGN_TIERS = [
  { price: 100, common: ["Table numbers", "Reserved seating signs", "Napkins"] },
  { price: 150, common: ["Matchbooks", "Welcome signs", "Place cards"] },
  { price: 200, common: ["Menu", "Program", "Bar menu"] },
  { price: 250, common: ["Seating chart", "Escort cards", "Large illustration"] },
];

// Printswell flat cards qty brackets
const PW_QTY_BRACKETS = [10,15,20,25,30,35,40,45,50,55,60,65,70,80,95,105,115,125,135,175];

const PW_FLAT_CARDS = {
  "118 Cotton": {
    "a7/a6":   { "4/0":[0.98,0.93,0.91,0.90,0.89,0.88,0.88,0.87,0.87,0.87,0.87,0.86,0.86,0.86,0.85,0.85,0.85,0.85,0.85,0.85], "4/4":[1.01,0.97,0.95,0.93,0.93,0.92,0.91,0.91,0.91,0.90,0.90,0.90,0.90,0.90,0.89,0.89,0.89,0.89,0.89,0.89] },
    "a2":      { "4/0":[0.70,0.65,0.63,0.62,0.61,0.60,0.60,0.59,0.59,0.59,0.58,0.58,0.58,0.58,0.58,0.57,0.57,0.57,0.57,0.57], "4/4":[0.72,0.68,0.65,0.64,0.63,0.63,0.62,0.62,0.61,0.61,0.61,0.61,0.61,0.60,0.60,0.60,0.60,0.60,0.60,0.59] },
    "a1/4bar": { "4/0":[0.51,0.46,0.44,0.43,0.42,0.41,0.41,0.40,0.40,0.40,0.40,0.40,0.39,0.39,0.39,0.39,0.39,0.39,0.38,0.38], "4/4":[0.53,0.48,0.46,0.45,0.44,0.43,0.43,0.42,0.42,0.42,0.41,0.41,0.41,0.41,0.41,0.40,0.40,0.40,0.40,0.40] },
    "a9":      { "4/0":[0.98,0.93,0.91,0.90,0.89,0.88,0.88,0.87,0.87,0.87,0.87,0.86,0.86,0.86,0.85,0.85,0.85,0.85,0.85,0.85], "4/4":[1.31,1.26,1.24,1.23,1.22,1.21,1.21,1.20,1.20,1.20,1.20,1.19,1.19,1.19,1.19,1.19,1.19,1.18,1.18,1.18] },
  },
  "120 Eggshell": {
    "a7/a6":   { "4/0":[0.59,0.55,0.53,0.51,0.51,0.50,0.49,0.49,0.49,0.48,0.48,0.48,0.48,0.48,0.47,0.47,0.47,0.47,0.47,0.47], "4/4":[0.63,0.59,0.57,0.55,0.54,0.54,0.53,0.53,0.52,0.52,0.52,0.52,0.52,0.51,0.51,0.51,0.51,0.51,0.51,0.51] },
    "a2":      { "4/0":[0.44,0.40,0.37,0.36,0.35,0.35,0.34,0.34,0.33,0.33,0.33,0.33,0.33,0.32,0.32,0.32,0.32,0.32,0.32,0.31], "4/4":[0.47,0.42,0.40,0.39,0.38,0.37,0.37,0.36,0.36,0.36,0.35,0.35,0.35,0.35,0.35,0.34,0.34,0.34,0.34,0.34] },
    "a1/4bar": { "4/0":[0.34,0.29,0.27,0.26,0.25,0.24,0.24,0.23,0.23,0.23,0.23,0.23,0.22,0.22,0.22,0.22,0.22,0.22,0.21,0.21], "4/4":[0.36,0.31,0.29,0.28,0.27,0.26,0.26,0.25,0.25,0.25,0.24,0.24,0.24,0.24,0.24,0.23,0.23,0.23,0.23,0.23] },
    "a9":      { "4/0":[0.59,0.55,0.53,0.51,0.51,0.50,0.49,0.49,0.49,0.48,0.48,0.48,0.48,0.48,0.47,0.47,0.47,0.47,0.47,0.47], "4/4":[0.63,0.59,0.57,0.55,0.54,0.54,0.53,0.53,0.52,0.52,0.52,0.52,0.52,0.51,0.51,0.51,0.51,0.51,0.51,0.51] },
  },
};

const PW_HANDLING = 2.43;       // once per order
const PW_SHIPPING_BASE = 10;    // first PW item
const PW_SHIPPING_ADDL = 3;     // each additional PW item

// LS labor brackets: 10..300 step 10
const LS_QTY_BRACKETS = Array.from({length:30}, (_,i) => (i+1)*10);

// Letterpress labor (also used by embossing per the PDF)
const LS_LP_FIRST = [95,110,125,140,150,160,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285];
const LS_LP_ADDL  = [85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230];

// Foil labor
const LS_FOIL_FIRST = [150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295];
const LS_FOIL_ADDL  = [115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260];

// Die cutting labor
const LS_DIE_FIRST = [85,90,95,100,105,110,115,120,125,130,132.5,135,137.5,140,142.5,145,147.5,150,152.5,155,157.5,160,162.5,165,167.5,170,172.5,175,177.5,180];
const LS_DIE_ADDL  = [67.5,70,72.5,75,77.5,80,82.5,85,87.5,90,92.5,95,97.5,100,102.5,105,107.5,110,112.5,115,117.5,120,122.5,125,127.5,130,132.5,135,137.5,140];

const LS_PLATES = [
  { name:"A9",  cost:50 },
  { name:"A7",  cost:40 },
  { name:"A6",  cost:35 },
  { name:"A2",  cost:30 },
  { name:"A1",  cost:20 },
  { name:"Return Address", cost:10 },
];

const LS_HOUSE_FOILS = ["Gold Matte","Silver Matte","Rose Gold Matte","Copper Matte","White Gloss","Gold Holographic","Silver Holographic","Clear"];

const LS_STOCK_OPTIONS = [
  { id:"savoy_118", label:"Reich Savoy 118# (1-ply)", per_sheet:1.75 },
  { id:"savoy_236", label:"Reich Savoy 236# (2-ply)", per_sheet:3.50 },
];

// Cards per 12.5x19" sheet
const LS_CARDS_PER_SHEET = { "A1":10, "A2":8, "A6":4, "A7":4, "A9":4 };

// ============================================================
// UTILITIES
// ============================================================

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "$0.00";
  return n.toLocaleString("en-US", { style:"currency", currency:"USD" });
};

const uid = () => Math.random().toString(36).slice(2,10);

function bracketIndex(qty, brackets) {
  for (let i=0; i<brackets.length; i++) if (brackets[i] >= qty) return i;
  return brackets.length - 1;
}
function roundUpToBracket(qty, brackets) {
  return brackets[bracketIndex(qty, brackets)];
}

function pwLookup(stock, size, sided, qty) {
  const matrix = PW_FLAT_CARDS[stock]?.[size]?.[sided];
  if (!matrix || !qty || qty <= 0) return null;
  const idx = bracketIndex(qty, PW_QTY_BRACKETS);
  const orderQty = PW_QTY_BRACKETS[idx];
  const unit = matrix[idx];
  return { unit, orderQty, total: unit * orderQty, overflow: qty > 175 };
}

function lsLabor(qty, firstArr, addlArr) {
  if (!qty || qty <= 0) return null;
  const overflow = qty > 300;
  const cap = Math.min(qty, 300);
  const idx = bracketIndex(cap, LS_QTY_BRACKETS);
  return { first: firstArr[idx], addl: addlArr[idx], orderQty: LS_QTY_BRACKETS[idx], overflow };
}

// ============================================================
// SHARED UI BITS
// ============================================================

const Field = ({ label, children, hint, className="" }) => (
  <label className={`block ${className}`}>
    <span className="block text-[10px] uppercase tracking-[0.14em] text-stone-500 mb-1 font-medium">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-stone-500 mt-1 caption-italic">{hint}</span>}
  </label>
);

const Input = ({ className="", ...p }) => (
  <input
    {...p}
    className={`w-full bg-transparent border-b border-stone-300 focus:border-stone-900 focus:outline-none px-0 py-1.5 text-stone-900 placeholder-stone-400 transition-colors ${className}`}
  />
);

const Select = ({ className="", children, ...p }) => (
  <select
    {...p}
    className={`w-full bg-transparent border-b border-stone-300 focus:border-stone-900 focus:outline-none px-0 py-1.5 text-stone-900 transition-colors appearance-none cursor-pointer ${className}`}
  >
    {children}
  </select>
);

const Btn = ({ children, variant="ghost", className="", ...p }) => {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-all";
  const variants = {
    primary: "bg-stone-900 text-amber-50 hover:bg-stone-800",
    ghost: "border border-stone-400 text-stone-700 hover:border-stone-900 hover:text-stone-900",
    minimal: "text-stone-500 hover:text-stone-900",
    danger: "text-stone-400 hover:text-rose-700"
  };
  return <button {...p} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

// ============================================================
// VENDOR SUB-COMPONENTS
// ============================================================

const VENDOR_TYPES = [
  { id:"PW",     label:"Printswell" },
  { id:"LS",     label:"Lickety Split" },
  { id:"AE",     label:"Ar-en" },
  { id:"AC",     label:"Announcement Converters" },
  { id:"CUSTOM", label:"Custom / Other" },
];

// ---------- Printswell Vendor ----------
function PWVendor({ v, defaultQty, onChange }) {
  const c = v.config;
  const set = (k, val) => onChange({ ...v, config: { ...c, [k]: val } });
  const qty = c.qty || defaultQty;
  const lookup = pwLookup(c.stock, c.size, c.sided, qty);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <Field label="Product Type">
          <Select value={c.product || "flat_card"} onChange={(e) => set("product", e.target.value)}>
            <option value="flat_card">Flat card</option>
            <option value="folded_card" disabled>Folded card (matrix coming)</option>
            <option value="envelope" disabled>Envelope (matrix coming)</option>
          </Select>
        </Field>
        <Field label="Stock">
          <Select value={c.stock || ""} onChange={(e) => set("stock", e.target.value)}>
            <option value="">Select…</option>
            {Object.keys(PW_FLAT_CARDS).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Size">
          <Select value={c.size || ""} onChange={(e) => set("size", e.target.value)}>
            <option value="">Select…</option>
            {["a7/a6","a2","a1/4bar","a9"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </Select>
        </Field>
        <Field label="Print">
          <Select value={c.sided || ""} onChange={(e) => set("sided", e.target.value)}>
            <option value="">Select…</option>
            <option value="4/0">4/0 (one side)</option>
            <option value="4/4">4/4 (both sides)</option>
          </Select>
        </Field>
        <Field label="Quantity" hint={`Default: client qty (${defaultQty})`}>
          <Input type="number" value={c.qty ?? ""} placeholder={String(defaultQty)} onChange={(e) => set("qty", e.target.value === "" ? null : Number(e.target.value))} />
        </Field>
        {lookup && (
          <div className="text-xs text-stone-600 self-end pb-1.5">
            <div>Unit: <span className="font-medium text-stone-900">{fmt(lookup.unit)}</span> × <span className="font-medium text-stone-900">{lookup.orderQty}</span></div>
            <div className="font-medium text-stone-900 mt-0.5">Subtotal: {fmt(lookup.total)}</div>
            {lookup.overflow && <div className="text-rose-700 caption-italic mt-1">⚠ Above 175 — confirm with PW</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function pwCost(v, defaultQty) {
  const c = v.config;
  const qty = c.qty || defaultQty;
  const lookup = pwLookup(c.stock, c.size, c.sided, qty);
  return lookup ? lookup.total : 0;
}

// ---------- Lickety Split Vendor ----------
function LSVendor({ v, defaultQty, onChange }) {
  const c = v.config || { lines: [] };
  const lines = c.lines || [];

  const setLines = (newLines) => onChange({ ...v, config: { ...c, lines: newLines } });
  const addLine = (type) => setLines([...lines, makeLSLine(type)]);
  const updateLine = (id, patch) => setLines(lines.map(l => l.id === id ? { ...l, ...patch } : l));
  const removeLine = (id) => setLines(lines.filter(l => l.id !== id));

  return (
    <div className="space-y-3">
      {lines.map(line => (
        <LSLine key={line.id} line={line} defaultQty={defaultQty}
          onChange={(p) => updateLine(line.id, p)}
          onRemove={() => removeLine(line.id)} />
      ))}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {[
          ["letterpress","+ Letterpress"],
          ["foil","+ Foil"],
          ["embossing","+ Embossing"],
          ["diecut","+ Die Cut"],
          ["scoring","+ Scoring"],
          ["stock","+ Stock"],
          ["digital_env","+ Digital envs"],
          ["digital_sheet","+ Digital sheet"],
          ["finishing","+ Finishing"],
          ["custom","+ Custom"],
        ].map(([t,l]) => (
          <button key={t} onClick={() => addLine(t)} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 hover:border-stone-700 px-2 py-1 transition-colors">
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function makeLSLine(type) {
  const base = { id: uid(), type };
  switch (type) {
    case "letterpress": return { ...base, plates:[{ size:"A7", count:1 }], qty:null };
    case "foil":        return { ...base, dies:[{ sqIn:1, count:1 }], foilType:"house", customFoilCost:0, qty:null };
    case "embossing":   return { ...base, sqIn:1, qty:null };
    case "diecut":      return { ...base, dieType:"house", customDieCost:0, qty:null };
    case "scoring":     return { ...base, qty:null };
    case "stock":       return { ...base, stockId:"savoy_118", cardSize:"A2", qty:null, isCustom:false, customDesc:"", customCost:0 };
    case "digital_env": return { ...base, qty:null };
    case "digital_sheet": return { ...base, sheets:null };
    case "finishing":   return { ...base, kind:"duplexing_small", qty:null, customLabel:"", customCost:0 };
    case "custom":      return { ...base, label:"", cost:0 };
    default: return base;
  }
}

function lsLineCost(line, defaultQty) {
  const qty = line.qty || defaultQty;
  switch (line.type) {
    case "letterpress": {
      const platesCost = (line.plates || []).reduce((s,p) => {
        const plate = LS_PLATES.find(x => x.name === p.size);
        return s + (plate ? plate.cost * p.count : 0);
      }, 0);
      const colorCount = (line.plates || []).reduce((s,p) => s + (p.count || 0), 0);
      const lab = lsLabor(qty, LS_LP_FIRST, LS_LP_ADDL);
      const labor = lab ? lab.first * colorCount : 0;
      return platesCost + labor;
    }
    case "foil": {
      const dieCost = (line.dies || []).reduce((s,d) => {
        const c = Math.max(d.sqIn * 3.75, 65);
        return s + c * (d.count || 1);
      }, 0);
      const colorCount = (line.dies || []).reduce((s,d) => s + (d.count || 0), 0);
      const foilCost = line.foilType === "custom" ? Number(line.customFoilCost || 0) : 0;
      const lab = lsLabor(qty, LS_FOIL_FIRST, LS_FOIL_ADDL);
      const labor = lab ? lab.first * colorCount : 0;
      return dieCost + foilCost + labor;
    }
    case "embossing": {
      const dieCost = Math.max(Number(line.sqIn || 0) * 5.25, 105);
      const lab = lsLabor(qty, LS_LP_FIRST, LS_LP_ADDL);
      const labor = lab ? lab.first : 0;
      return dieCost + labor;
    }
    case "diecut": {
      const dieCost = line.dieType === "house" ? 0 : Number(line.customDieCost || 0);
      const lab = lsLabor(qty, LS_DIE_FIRST, LS_DIE_ADDL);
      const labor = lab ? lab.first : 0;
      return dieCost + labor;
    }
    case "scoring": {
      const lab = lsLabor(qty, LS_DIE_FIRST, LS_DIE_ADDL);
      return lab ? lab.first : 0;
    }
    case "stock": {
      if (line.isCustom) return Number(line.customCost || 0);
      const stock = LS_STOCK_OPTIONS.find(s => s.id === line.stockId);
      const cardsPerSheet = LS_CARDS_PER_SHEET[line.cardSize] || 4;
      const sheetsNeeded = Math.ceil((qty + Math.max(20, qty * 0.1)) / cardsPerSheet);
      return stock ? stock.per_sheet * sheetsNeeded : 0;
    }
    case "digital_env": return qty * 2;
    case "digital_sheet": return Number(line.sheets || 0) * 3;
    case "finishing": {
      const k = line.kind;
      if (k === "duplexing_small") return qty * 0.75;
      if (k === "duplexing_large") return qty * 1.50;
      if (k === "edge_painting") {
        if (qty <= 200) return 150;
        return 150 + Math.ceil((qty - 200) / 100) * 50;
      }
      if (k === "corner_rounding") return qty * 0.50;
      if (k === "edge_deckling") return qty * 1.50;
      if (k === "liner_assembly") return qty * 0.75;
      if (k === "peel_adhesive") return qty * 0.25;
      if (k === "pocket_assembly") return qty * 2.00;
      if (k === "custom") return Number(line.customCost || 0);
      return 0;
    }
    case "custom": return Number(line.cost || 0);
    default: return 0;
  }
}

function lsCost(v, defaultQty) {
  const lines = v.config?.lines || [];
  return lines.reduce((s,l) => s + lsLineCost(l, defaultQty), 0);
}

// LS Line UI
function LSLine({ line, defaultQty, onChange, onRemove }) {
  const qty = line.qty || defaultQty;
  const cost = lsLineCost(line, defaultQty);

  const labelMap = {
    letterpress:"Letterpress", foil:"Foil Stamping", embossing:"Embossing",
    diecut:"Die Cutting", scoring:"Scoring", stock:"Stock",
    digital_env:"Digital Envelope Print", digital_sheet:"Digital Sheet Print",
    finishing:"Finishing", custom:"Custom Line"
  };

  return (
    <div className="border border-stone-200 bg-stone-50/50 px-3 py-2.5 rounded-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.14em] font-medium text-stone-700">{labelMap[line.type]}</div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-stone-900">{fmt(cost)}</span>
          <button onClick={onRemove} className="text-stone-400 hover:text-rose-700"><X size={13} /></button>
        </div>
      </div>

      {line.type === "letterpress" && (
        <div className="space-y-2">
          {line.plates.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <Select className="!w-32" value={p.size} onChange={(e) => {
                const np = [...line.plates]; np[i] = { ...p, size: e.target.value }; onChange({ plates: np });
              }}>
                {LS_PLATES.map(pl => <option key={pl.name} value={pl.name}>{pl.name} (${pl.cost})</option>)}
              </Select>
              <span className="text-[10px] uppercase tracking-[0.14em] text-stone-500">×</span>
              <Input className="!w-16" type="number" min="1" value={p.count} onChange={(e) => {
                const np = [...line.plates]; np[i] = { ...p, count: Number(e.target.value) }; onChange({ plates: np });
              }} />
              <span className="text-[10px] text-stone-500 uppercase tracking-[0.12em]">colors / plates</span>
              {line.plates.length > 1 && (
                <button onClick={() => onChange({ plates: line.plates.filter((_,j) => j !== i) })} className="text-stone-400 hover:text-rose-700"><X size={12}/></button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button onClick={() => onChange({ plates: [...line.plates, { size:"A7", count:1 }] })} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900">+ another plate size</button>
            <div className="ml-auto">
              <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
            </div>
          </div>
        </div>
      )}

      {line.type === "foil" && (
        <div className="space-y-2">
          {line.dies.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <Field label="Die size (sq in)" className="!w-28"><Input type="number" step="0.25" value={d.sqIn} onChange={(e) => {
                const nd = [...line.dies]; nd[i] = { ...d, sqIn: Number(e.target.value) }; onChange({ dies: nd });
              }} /></Field>
              <span className="text-[10px] uppercase tracking-[0.12em] text-stone-500 self-end pb-1.5">×</span>
              <Field label="Foils" className="!w-16"><Input type="number" min="1" value={d.count} onChange={(e) => {
                const nd = [...line.dies]; nd[i] = { ...d, count: Number(e.target.value) }; onChange({ dies: nd });
              }} /></Field>
              <div className="text-[10px] text-stone-500 self-end pb-1.5">
                = {fmt(Math.max(d.sqIn * 3.75, 65))} ea
              </div>
              {line.dies.length > 1 && (
                <button onClick={() => onChange({ dies: line.dies.filter((_,j) => j !== i) })} className="text-stone-400 hover:text-rose-700 self-end pb-1.5"><X size={12}/></button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-4 flex-wrap">
            <Field label="Foil type" className="!w-44">
              <Select value={line.foilType} onChange={(e) => onChange({ foilType: e.target.value })}>
                <option value="house">House (free)</option>
                <option value="custom">Custom (specify)</option>
              </Select>
            </Field>
            {line.foilType === "custom" && (
              <Field label="Custom foil $" className="!w-28">
                <Input type="number" step="1" value={line.customFoilCost} onChange={(e) => onChange({ customFoilCost: Number(e.target.value) })} />
              </Field>
            )}
            <button onClick={() => onChange({ dies: [...line.dies, { sqIn:1, count:1 }] })} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 self-end pb-1.5">+ another die</button>
            <div className="ml-auto self-end pb-1.5">
              <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
            </div>
          </div>
        </div>
      )}

      {line.type === "embossing" && (
        <div className="grid grid-cols-3 gap-x-6 items-end">
          <Field label="Die size (sq in)"><Input type="number" step="0.25" value={line.sqIn} onChange={(e) => onChange({ sqIn: Number(e.target.value) })} /></Field>
          <div className="text-[10px] text-stone-500 pb-1.5">Die: {fmt(Math.max(line.sqIn * 5.25, 105))}</div>
          <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
        </div>
      )}

      {line.type === "diecut" && (
        <div className="grid grid-cols-3 gap-x-6 items-end">
          <Field label="Die">
            <Select value={line.dieType} onChange={(e) => onChange({ dieType: e.target.value })}>
              <option value="house">House die (free)</option>
              <option value="custom">Custom die ($)</option>
            </Select>
          </Field>
          {line.dieType === "custom" && (
            <Field label="Die cost"><Input type="number" min="100" value={line.customDieCost} onChange={(e) => onChange({ customDieCost: Number(e.target.value) })} /></Field>
          )}
          <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
        </div>
      )}

      {line.type === "scoring" && (
        <div className="flex justify-end">
          <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
        </div>
      )}

      {line.type === "stock" && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <button onClick={() => onChange({ isCustom:false })} className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 border ${!line.isCustom ? "border-stone-900 bg-stone-900 text-amber-50" : "border-stone-300 text-stone-500"}`}>House stock</button>
            <button onClick={() => onChange({ isCustom:true })} className={`text-[10px] uppercase tracking-[0.12em] px-2 py-1 border ${line.isCustom ? "border-stone-900 bg-stone-900 text-amber-50" : "border-stone-300 text-stone-500"}`}>Non-house / supplied</button>
          </div>
          {!line.isCustom ? (
            <div className="grid grid-cols-3 gap-x-6 items-end">
              <Field label="Stock">
                <Select value={line.stockId} onChange={(e) => onChange({ stockId: e.target.value })}>
                  {LS_STOCK_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Card size">
                <Select value={line.cardSize} onChange={(e) => onChange({ cardSize: e.target.value })}>
                  {Object.keys(LS_CARDS_PER_SHEET).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 items-end">
              <Field label="Description" hint="e.g., AC stock + 20% markup"><Input value={line.customDesc} onChange={(e) => onChange({ customDesc: e.target.value })} /></Field>
              <Field label="Total stock cost"><Input type="number" step="0.01" value={line.customCost} onChange={(e) => onChange({ customCost: Number(e.target.value) })} /></Field>
            </div>
          )}
        </div>
      )}

      {line.type === "digital_env" && (
        <div className="flex justify-end">
          <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} label="Envelopes" />
        </div>
      )}

      {line.type === "digital_sheet" && (
        <div className="flex justify-end">
          <Field label="Sheets" className="!w-32"><Input type="number" value={line.sheets ?? ""} onChange={(e) => onChange({ sheets: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
        </div>
      )}

      {line.type === "finishing" && (
        <div className="grid grid-cols-3 gap-x-6 items-end">
          <Field label="Type" className="col-span-2">
            <Select value={line.kind} onChange={(e) => onChange({ kind: e.target.value })}>
              <option value="duplexing_small">Duplexing (≤8.5×11) — $0.75/sheet</option>
              <option value="duplexing_large">Duplexing (≤12.5×19) — $1.50/sheet</option>
              <option value="edge_painting">Edge painting — $150 first 200, +$50/100</option>
              <option value="corner_rounding">Corner rounding — $0.50/piece</option>
              <option value="edge_deckling">Edge deckling — $1.50/piece</option>
              <option value="liner_assembly">Liner assembly — $0.75/piece</option>
              <option value="peel_adhesive">Peel-away adhesive — $0.25/strip</option>
              <option value="pocket_assembly">Pocket assembly — $2.00/piece</option>
              <option value="custom">Custom finishing</option>
            </Select>
          </Field>
          {line.kind === "custom"
            ? <Field label="Cost"><Input type="number" step="0.01" value={line.customCost} onChange={(e) => onChange({ customCost: Number(e.target.value) })} /></Field>
            : <QtyOverride defaultQty={defaultQty} value={line.qty} onChange={(q) => onChange({ qty:q })} />
          }
        </div>
      )}

      {line.type === "custom" && (
        <div className="grid grid-cols-3 gap-x-6 items-end">
          <Field label="Description" className="col-span-2"><Input value={line.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="e.g., grommets, ribbon, beveling" /></Field>
          <Field label="Cost"><Input type="number" step="0.01" value={line.cost} onChange={(e) => onChange({ cost: Number(e.target.value) })} /></Field>
        </div>
      )}
    </div>
  );
}

const QtyOverride = ({ defaultQty, value, onChange, label="Qty" }) => (
  <Field label={label} className="!w-28" hint={`Default: ${defaultQty}`}>
    <Input type="number" value={value ?? ""} placeholder={String(defaultQty)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
  </Field>
);

// ---------- Manual Vendor (Ar-en, AC, Custom) ----------
function ManualVendor({ v, onChange }) {
  const c = v.config || { lines: [] };
  const lines = c.lines || [];
  const setLines = (newLines) => onChange({ ...v, config: { ...c, lines: newLines } });

  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <div key={l.id} className="grid grid-cols-3 gap-x-6 items-end">
          <Field label="Description" className="col-span-2">
            <Input value={l.label} onChange={(e) => {
              const nl = [...lines]; nl[i] = { ...l, label: e.target.value }; setLines(nl);
            }} />
          </Field>
          <div className="flex items-end gap-2">
            <Field label="Cost"><Input type="number" step="0.01" value={l.cost} onChange={(e) => {
              const nl = [...lines]; nl[i] = { ...l, cost: Number(e.target.value) }; setLines(nl);
            }} /></Field>
            <button onClick={() => setLines(lines.filter((_,j) => j !== i))} className="text-stone-400 hover:text-rose-700 pb-1.5"><X size={14} /></button>
          </div>
        </div>
      ))}
      <button onClick={() => setLines([...lines, { id:uid(), label:"", cost:0 }])} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 hover:border-stone-700 px-2 py-1 transition-colors">
        + Add line item
      </button>
    </div>
  );
}

function manualCost(v) {
  return (v.config?.lines || []).reduce((s,l) => s + Number(l.cost || 0), 0);
}

// ============================================================
// VENDOR DISPATCH
// ============================================================

function vendorCost(v, defaultQty) {
  switch (v.type) {
    case "PW": return pwCost(v, defaultQty);
    case "LS": return lsCost(v, defaultQty);
    case "AE":
    case "AC":
    case "CUSTOM":
      return manualCost(v);
    default: return 0;
  }
}

function VendorEditor({ v, defaultQty, onChange }) {
  switch (v.type) {
    case "PW":     return <PWVendor v={v} defaultQty={defaultQty} onChange={onChange} />;
    case "LS":     return <LSVendor v={v} defaultQty={defaultQty} onChange={onChange} />;
    case "AE":
    case "AC":
    case "CUSTOM": return <ManualVendor v={v} onChange={onChange} />;
    default: return null;
  }
}

function newVendor(type) {
  const base = { id: uid(), type };
  if (type === "PW") return { ...base, config: { product:"flat_card", stock:"118 Cotton", size:"a2", sided:"4/0", qty:null } };
  if (type === "LS") return { ...base, config: { lines: [] } };
  return { ...base, config: { lines: [{ id:uid(), label:"", cost:0 }] } };
}

// ============================================================
// MAIN
// ============================================================

const initialEvent = (name="Wedding Day") => ({
  id: uid(),
  name,
  tiers: DESIGN_TIERS.map(t => ({
    price: t.price,
    items: t.common.map(n => ({ id: uid(), name: n, included: false }))
  })),
  customItems: [],
});

const initialState = () => ({
  projectName: "",
  clientQty: 100,
  events: [initialEvent()],
  production: {}, // keyed by design item id => { vendors:[], assemblyPerPiece:0, assemblyQtyOverride:null }
});

export default function QuotingTool() {
  const [state, setState] = useState(initialState());
  const [draftName, setDraftName] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const saveTimer = useRef(null);

  // Load autosave + drafts on mount
  useEffect(() => {
    (async () => {
      try {
        const auto = await window.storage.get("quote:autosave");
        if (auto?.value) {
          try { setState(JSON.parse(auto.value)); } catch {}
        }
      } catch {}
      try {
        const list = await window.storage.list("quote:draft:");
        if (list?.keys) setDrafts(list.keys.map(k => k.replace("quote:draft:", "")));
      } catch {}
      setStorageReady(true);
    })();
  }, []);

  // Auto-save (debounced)
  useEffect(() => {
    if (!storageReady) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await window.storage.set("quote:autosave", JSON.stringify(state)); } catch {}
    }, 800);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [state, storageReady]);

  const saveDraft = async () => {
    const name = draftName.trim() || state.projectName.trim() || "Untitled";
    try {
      await window.storage.set(`quote:draft:${name}`, JSON.stringify(state));
      const list = await window.storage.list("quote:draft:");
      setDrafts(list?.keys?.map(k => k.replace("quote:draft:", "")) || []);
      setDraftName("");
    } catch (e) { alert("Save failed"); }
  };

  const loadDraft = async (name) => {
    try {
      const r = await window.storage.get(`quote:draft:${name}`);
      if (r?.value) setState(JSON.parse(r.value));
    } catch {}
  };

  const deleteDraft = async (name) => {
    try {
      await window.storage.delete(`quote:draft:${name}`);
      setDrafts(drafts.filter(d => d !== name));
    } catch {}
  };

  const newQuote = () => { if (confirm("Start a new quote? Current work will be cleared (autosave will overwrite).")) setState(initialState()); };

  // ----- DESIGN MUTATIONS -----
  const setEvent = (eid, patch) => setState(s => ({ ...s, events: s.events.map(e => e.id === eid ? { ...e, ...patch } : e) }));
  const addEvent = () => setState(s => ({ ...s, events: [...s.events, initialEvent(`Event ${s.events.length + 1}`)] }));
  const removeEvent = (eid) => setState(s => ({
    ...s,
    events: s.events.filter(e => e.id !== eid),
  }));

  const toggleItem = (eid, tierIdx, itemId) => setEvent(eid, (() => {
    const ev = state.events.find(e => e.id === eid);
    const newTiers = ev.tiers.map((t, i) => i !== tierIdx ? t : {
      ...t, items: t.items.map(it => it.id === itemId ? { ...it, included: !it.included } : it)
    });
    return { tiers: newTiers };
  })());

  const renameItem = (eid, tierIdx, itemId, name) => {
    setState(s => ({
      ...s,
      events: s.events.map(e => e.id !== eid ? e : ({
        ...e,
        tiers: e.tiers.map((t, i) => i !== tierIdx ? t : ({
          ...t, items: t.items.map(it => it.id === itemId ? { ...it, name } : it)
        }))
      }))
    }));
  };

  const removeItem = (eid, tierIdx, itemId) => setState(s => ({
    ...s,
    events: s.events.map(e => e.id !== eid ? e : ({
      ...e,
      tiers: e.tiers.map((t, i) => i !== tierIdx ? t : ({
        ...t, items: t.items.filter(it => it.id !== itemId)
      }))
    }))
  }));

  const addTierItem = (eid, tierIdx) => setState(s => ({
    ...s,
    events: s.events.map(e => e.id !== eid ? e : ({
      ...e,
      tiers: e.tiers.map((t, i) => i !== tierIdx ? t : ({
        ...t, items: [...t.items, { id: uid(), name:"", included: true }]
      }))
    }))
  }));

  const addCustomItem = (eid) => setState(s => ({
    ...s,
    events: s.events.map(e => e.id !== eid ? e : ({
      ...e,
      customItems: [...e.customItems, { id: uid(), name:"", price:0 }]
    }))
  }));

  const updateCustomItem = (eid, id, patch) => setState(s => ({
    ...s,
    events: s.events.map(e => e.id !== eid ? e : ({
      ...e,
      customItems: e.customItems.map(c => c.id === id ? { ...c, ...patch } : c)
    }))
  }));

  const removeCustomItem = (eid, id) => setState(s => ({
    ...s,
    events: s.events.map(e => e.id !== eid ? e : ({
      ...e,
      customItems: e.customItems.filter(c => c.id !== id)
    }))
  }));

  // ----- PRODUCTION MUTATIONS -----
  const getProd = (itemId) => state.production[itemId] || { vendors: [], assemblyPerPiece: 0, assemblyQtyOverride: null };
  const setProd = (itemId, patch) => setState(s => ({
    ...s,
    production: { ...s.production, [itemId]: { ...getProd(itemId), ...patch } }
  }));
  const addVendor = (itemId, type) => setProd(itemId, { vendors: [...getProd(itemId).vendors, newVendor(type)] });
  const updateVendor = (itemId, vid, newV) => setProd(itemId, { vendors: getProd(itemId).vendors.map(v => v.id === vid ? newV : v) });
  const removeVendor = (itemId, vid) => setProd(itemId, { vendors: getProd(itemId).vendors.filter(v => v.id !== vid) });

  // ----- DERIVED -----
  // Flat list of all design items (in order, across events)
  const allDesignItems = useMemo(() => {
    const out = [];
    state.events.forEach(ev => {
      ev.tiers.forEach((t, tierIdx) => {
        t.items.filter(i => i.included && i.name.trim()).forEach(item => {
          out.push({ id: item.id, name: item.name, price: t.price, eventName: ev.name, eventId: ev.id, kind: "tier", tierIdx });
        });
      });
      ev.customItems.filter(c => c.name.trim()).forEach(c => {
        out.push({ id: c.id, name: c.name, price: Number(c.price || 0), eventName: ev.name, eventId: ev.id, kind: "custom" });
      });
    });
    return out;
  }, [state.events]);

  const designTotal = useMemo(() => allDesignItems.reduce((s,i) => s + i.price, 0), [allDesignItems]);

  // Production calc: per-item production cost (vendors + assembly), with PW handling/shipping computed at top level
  const itemProdBreakdown = useMemo(() => {
    return allDesignItems.map(item => {
      const prod = getProd(item.id);
      const vendorBreakdowns = prod.vendors.map(v => {
        const raw = vendorCost(v, state.clientQty);
        return { vendor: v, raw, marked: raw * 2 };
      });
      const vendorTotal = vendorBreakdowns.reduce((s,b) => s + b.marked, 0);
      const assyQty = prod.assemblyQtyOverride ?? state.clientQty;
      const assyCost = Number(prod.assemblyPerPiece || 0) * assyQty;
      return {
        item,
        vendorBreakdowns,
        vendorTotal,
        assyQty,
        assyPer: Number(prod.assemblyPerPiece || 0),
        assyCost,
        itemTotal: vendorTotal + assyCost,
      };
    });
  }, [allDesignItems, state.production, state.clientQty]);

  // PW order-level handling/shipping (counted across ALL items)
  const pwItemCount = useMemo(() => {
    let count = 0;
    allDesignItems.forEach(item => {
      const prod = getProd(item.id);
      prod.vendors.forEach(v => { if (v.type === "PW" && pwCost(v, state.clientQty) > 0) count++; });
    });
    return count;
  }, [allDesignItems, state.production, state.clientQty]);

  const pwOrderFees = useMemo(() => {
    if (pwItemCount === 0) return { raw: 0, marked: 0 };
    const raw = PW_HANDLING + PW_SHIPPING_BASE + Math.max(0, pwItemCount - 1) * PW_SHIPPING_ADDL;
    return { raw, marked: raw * 2, count: pwItemCount };
  }, [pwItemCount]);

  const productionTotal = useMemo(() =>
    itemProdBreakdown.reduce((s,b) => s + b.itemTotal, 0) + pwOrderFees.marked
  , [itemProdBreakdown, pwOrderFees]);

  const grandTotal = designTotal + productionTotal;

  // ----- TEXT SUMMARY -----
  const textSummary = useMemo(() => {
    const lines = [];
    lines.push(state.projectName || "Untitled Project");
    lines.push(`Client quantity: ${state.clientQty}`);
    lines.push("");
    lines.push("DESIGN FEE");
    state.events.forEach(ev => {
      const evItems = [];
      ev.tiers.forEach(t => t.items.filter(i => i.included && i.name.trim()).forEach(i => evItems.push(`  ${i.name} — $${t.price}`)));
      ev.customItems.filter(c => c.name.trim()).forEach(c => evItems.push(`  ${c.name} — $${Number(c.price||0)}`));
      if (evItems.length) {
        lines.push(`  ${ev.name}`);
        evItems.forEach(l => lines.push(l));
      }
    });
    lines.push(`  Design subtotal: ${fmt(designTotal)}`);
    lines.push("");
    lines.push("PRODUCTION FEE");
    itemProdBreakdown.forEach(b => {
      if (b.itemTotal === 0) return;
      lines.push(`  ${b.item.name} (${b.item.eventName})`);
      b.vendorBreakdowns.forEach(vb => {
        if (vb.marked === 0) return;
        const vname = VENDOR_TYPES.find(t => t.id === vb.vendor.type)?.label || vb.vendor.type;
        lines.push(`    ${vname}: ${fmt(vb.marked)}`);
      });
      if (b.assyCost > 0) lines.push(`    Assembly (${b.assyQty} × ${fmt(b.assyPer)}): ${fmt(b.assyCost)}`);
      lines.push(`    Item total: ${fmt(b.itemTotal)}`);
    });
    if (pwOrderFees.marked > 0) {
      lines.push(`  Printswell handling & shipping (${pwOrderFees.count} item${pwOrderFees.count>1?"s":""}): ${fmt(pwOrderFees.marked)}`);
    }
    lines.push(`  Production subtotal: ${fmt(productionTotal)}`);
    lines.push("");
    lines.push(`GRAND TOTAL: ${fmt(grandTotal)}`);
    return lines.join("\n");
  }, [state, designTotal, itemProdBreakdown, pwOrderFees, productionTotal, grandTotal]);

  const copySummary = async () => {
    try { await navigator.clipboard.writeText(textSummary); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen text-stone-900" style={{ background:"#F5F0E8", fontFamily:"'franklin-gothic-urw', sans-serif", fontWeight: 400 }}>
      <style>{`
        @import url("https://use.typekit.net/mog0ylg.css");
        body { margin:0; font-family: 'franklin-gothic-urw', sans-serif; }
        input, select, textarea, button { font-family: inherit; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .display { font-family: 'garamond-premier-pro-display', 'garamond-premier-pro', Georgia, serif; font-weight: 400; letter-spacing: 0.005em; }
        .display-italic { font-family: 'garamond-premier-pro-display', 'garamond-premier-pro', Georgia, serif; font-style: italic; font-weight: 400; }
        .subhead-italic { font-family: 'garamond-premier-pro-subhead', 'garamond-premier-pro', Georgia, serif; font-style: italic; font-weight: 400; }
        .caption-italic { font-family: 'garamond-premier-pro-caption', 'garamond-premier-pro', Georgia, serif; font-style: italic; font-weight: 400; }
        .body-serif { font-family: 'garamond-premier-pro', Georgia, serif; }
        select { background-image: none; }
        select:focus { outline: none; }
      `}</style>

      {/* HEADER */}
      <header className="border-b border-stone-300 sticky top-0 z-20 backdrop-blur" style={{ background:"rgba(245,240,232,0.92)" }}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-end justify-between gap-6 flex-wrap">
          <div className="flex items-end gap-6">
            <h1 className="display-italic text-4xl text-stone-900 leading-none">
              Day-of <span className="display">Quote</span>
            </h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 pb-1">Calculator</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {drafts.length > 0 && (
              <details className="relative">
                <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] border border-stone-400 text-stone-700 hover:border-stone-900 hover:text-stone-900">
                  <Folder size={13}/> Drafts ({drafts.length})
                </summary>
                <div className="absolute right-0 mt-1 bg-white border border-stone-300 shadow-lg z-30 min-w-[240px] max-h-64 overflow-auto">
                  {drafts.map(d => (
                    <div key={d} className="flex items-center justify-between px-3 py-2 hover:bg-stone-50 border-b border-stone-100 last:border-0">
                      <button onClick={() => loadDraft(d)} className="text-sm text-stone-700 hover:text-stone-900 text-left flex-1 truncate">{d}</button>
                      <button onClick={() => deleteDraft(d)} className="text-stone-400 hover:text-rose-700 ml-2"><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              </details>
            )}
            <div className="flex items-center border border-stone-400 hover:border-stone-900 transition-colors">
              <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Draft name…" className="bg-transparent px-3 py-1.5 text-xs w-32 focus:outline-none placeholder-stone-400" />
              <button onClick={saveDraft} className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] bg-stone-900 text-amber-50 hover:bg-stone-800 inline-flex items-center gap-1.5">
                <Save size={12}/> Save
              </button>
            </div>
            <Btn onClick={newQuote} variant="minimal">+ New</Btn>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10 space-y-12 pb-40">

        {/* PROJECT META */}
        <section className="grid grid-cols-12 gap-6 items-end pb-8 border-b border-stone-300">
          <div className="col-span-12 md:col-span-7">
            <Field label="Project Name">
              <Input value={state.projectName} onChange={(e) => setState(s => ({ ...s, projectName: e.target.value }))} placeholder="The Henderson Wedding" className="text-2xl display py-2" />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-3">
            <Field label="Client Quantity" hint="Default qty for items & assembly">
              <Input type="number" min="1" value={state.clientQty} onChange={(e) => setState(s => ({ ...s, clientQty: Math.max(1, Number(e.target.value)) }))} className="text-2xl display py-2" />
            </Field>
          </div>
          <div className="col-span-12 md:col-span-2 text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Running Total</div>
            <div className="display text-3xl text-stone-900 mt-1">{fmt(grandTotal)}</div>
          </div>
        </section>

        {/* DESIGN FEE */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Section I</div>
              <h2 className="display-italic text-3xl">Design Fee</h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Subtotal</div>
              <div className="display text-2xl">{fmt(designTotal)}</div>
            </div>
          </div>

          <div className="space-y-10">
            {state.events.map((ev, evIdx) => (
              <div key={ev.id} className="border-l-2 border-stone-300 pl-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-stone-500" />
                    <input value={ev.name} onChange={(e) => setEvent(ev.id, { name: e.target.value })} className="subhead-italic text-2xl bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-900 focus:outline-none px-0" />
                  </div>
                  {state.events.length > 1 && (
                    <button onClick={() => { if (confirm(`Remove event "${ev.name}"?`)) removeEvent(ev.id); }} className="text-stone-400 hover:text-rose-700 text-xs uppercase tracking-[0.12em]">Remove event</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  {ev.tiers.map((tier, tierIdx) => (
                    <div key={tier.price}>
                      <div className="flex items-baseline justify-between mb-2 pb-1 border-b border-stone-300">
                        <span className="subhead-italic text-xl">${tier.price}</span>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-stone-500">tier</span>
                      </div>
                      <div className="space-y-1.5">
                        {tier.items.map(it => (
                          <div key={it.id} className="flex items-center gap-2 group">
                            <button onClick={() => toggleItem(ev.id, tierIdx, it.id)} className={`w-3.5 h-3.5 border ${it.included ? "bg-stone-900 border-stone-900" : "border-stone-400 hover:border-stone-900"} flex items-center justify-center flex-shrink-0`}>
                              {it.included && <Check size={9} className="text-amber-50" strokeWidth={3} />}
                            </button>
                            <input value={it.name} onChange={(e) => renameItem(ev.id, tierIdx, it.id, e.target.value)} placeholder="Item name…" className={`flex-1 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-700 focus:outline-none px-0 py-0.5 text-sm ${it.included ? "text-stone-900" : "text-stone-500"}`} />
                            <button onClick={() => removeItem(ev.id, tierIdx, it.id)} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-700 transition-opacity"><X size={11}/></button>
                          </div>
                        ))}
                        <button onClick={() => addTierItem(ev.id, tierIdx)} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 mt-1.5">+ Add item</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom-priced items */}
                <div className="mt-6 pt-5 border-t border-stone-200">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="subhead-italic text-lg">Custom-priced items</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Off-tier</span>
                  </div>
                  <div className="space-y-1.5">
                    {ev.customItems.map(c => (
                      <div key={c.id} className="flex items-center gap-3 group">
                        <input value={c.name} onChange={(e) => updateCustomItem(ev.id, c.id, { name: e.target.value })} placeholder="Item name…" className="flex-1 bg-transparent border-b border-stone-200 focus:border-stone-700 focus:outline-none px-0 py-0.5 text-sm" />
                        <span className="text-stone-400 text-sm">$</span>
                        <input type="number" value={c.price} onChange={(e) => updateCustomItem(ev.id, c.id, { price: Number(e.target.value) })} className="w-20 bg-transparent border-b border-stone-200 focus:border-stone-700 focus:outline-none px-0 py-0.5 text-sm text-right" />
                        <button onClick={() => removeCustomItem(ev.id, c.id)} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-700 transition-opacity"><X size={11}/></button>
                      </div>
                    ))}
                    <button onClick={() => addCustomItem(ev.id)} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 mt-1.5">+ Add custom-priced item</button>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addEvent} className="ml-6 inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-stone-400 text-stone-600 hover:border-stone-900 hover:text-stone-900 text-[11px] uppercase tracking-[0.14em] transition-colors">
              <Plus size={13}/> Add another event
            </button>
          </div>
        </section>

        {/* PRODUCTION FEE */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Section II</div>
              <h2 className="display-italic text-3xl">Production Fee</h2>
              <div className="text-xs text-stone-500 caption-italic mt-1">Vendor expenses × 2 + assembly (pass-through)</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Subtotal</div>
              <div className="display text-2xl">{fmt(productionTotal)}</div>
            </div>
          </div>

          {allDesignItems.length === 0 && (
            <div className="border border-dashed border-stone-300 px-6 py-12 text-center text-stone-500 text-sm">
              Include items in the Design Fee section above to configure production.
            </div>
          )}

          <div className="space-y-6">
            {allDesignItems.map(item => {
              const prod = getProd(item.id);
              const breakdown = itemProdBreakdown.find(b => b.item.id === item.id);
              return (
                <div key={item.id} className="border border-stone-300 bg-white/60 px-6 py-5">
                  <div className="flex items-baseline justify-between pb-3 mb-4 border-b border-stone-200">
                    <div>
                      <div className="subhead-italic text-xl">{item.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500 mt-0.5">{item.eventName} · ${item.price} design</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Item production</div>
                      <div className="display text-lg">{fmt(breakdown?.itemTotal || 0)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {prod.vendors.map(v => {
                      const vlabel = VENDOR_TYPES.find(t => t.id === v.type)?.label;
                      const raw = vendorCost(v, state.clientQty);
                      return (
                        <div key={v.id} className="border-l-2 border-stone-300 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-stone-700 font-medium">{vlabel}</div>
                            <div className="flex items-center gap-3">
                              <div className="text-xs text-stone-500">cost {fmt(raw)} · ×2 = <span className="text-stone-900 font-medium">{fmt(raw*2)}</span></div>
                              <button onClick={() => removeVendor(item.id, v.id)} className="text-stone-400 hover:text-rose-700"><X size={13}/></button>
                            </div>
                          </div>
                          <VendorEditor v={v} defaultQty={state.clientQty} onChange={(nv) => updateVendor(item.id, v.id, nv)} />
                        </div>
                      );
                    })}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {VENDOR_TYPES.map(vt => (
                        <button key={vt.id} onClick={() => addVendor(item.id, vt.id)} className="text-[10px] uppercase tracking-[0.12em] text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 hover:border-stone-700 px-2 py-1 transition-colors">
                          + {vt.label}
                        </button>
                      ))}
                    </div>

                    {/* Assembly */}
                    <div className="border-t border-stone-200 pt-4 mt-4">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-stone-700 font-medium mb-2">Assembly <span className="text-stone-400 normal-case tracking-normal caption-italic">(pass-through, not doubled)</span></div>
                      <div className="grid grid-cols-3 gap-x-6 items-end">
                        <Field label="Per piece"><Input type="number" step="0.01" value={prod.assemblyPerPiece} onChange={(e) => setProd(item.id, { assemblyPerPiece: Number(e.target.value) })} /></Field>
                        <Field label="Quantity" hint={`Default: ${state.clientQty}`}>
                          <Input type="number" value={prod.assemblyQtyOverride ?? ""} placeholder={String(state.clientQty)} onChange={(e) => setProd(item.id, { assemblyQtyOverride: e.target.value === "" ? null : Number(e.target.value) })} />
                        </Field>
                        <div className="text-right pb-1.5">
                          <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500">Subtotal</div>
                          <div className="display text-lg">{fmt(breakdown?.assyCost || 0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PW order fees */}
          {pwOrderFees.marked > 0 && (
            <div className="mt-6 border border-stone-300 bg-stone-100/60 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-stone-700 font-medium">Printswell Order Fees</div>
                <div className="text-xs text-stone-600 caption-italic mt-0.5">
                  ${PW_HANDLING.toFixed(2)} handling + ${PW_SHIPPING_BASE} base shipping + ${PW_SHIPPING_ADDL} × {pwOrderFees.count - 1} add'l ({pwOrderFees.count} PW items)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-stone-500">{fmt(pwOrderFees.raw)} × 2</div>
                <div className="display text-lg">{fmt(pwOrderFees.marked)}</div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* QUOTE SUMMARY DRAWER */}
      <button onClick={() => setShowSummary(true)} className="fixed bottom-6 right-6 z-30 bg-stone-900 text-amber-50 px-6 py-4 shadow-lg hover:bg-stone-800 transition-colors flex items-center gap-3">
        <FileText size={16}/>
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.16em] opacity-70">Quote Summary</div>
          <div className="display text-lg leading-none mt-0.5">{fmt(grandTotal)}</div>
        </div>
      </button>

      {showSummary && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-end" onClick={() => setShowSummary(false)}>
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-xl h-full overflow-auto shadow-2xl" style={{ background:"#F5F0E8" }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 backdrop-blur border-b border-stone-300 px-8 py-5 flex items-center justify-between" style={{ background:"rgba(245,240,232,0.92)" }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Quote</div>
                <h3 className="display-italic text-2xl">Summary</h3>
              </div>
              <div className="flex items-center gap-2">
                <Btn onClick={copySummary} variant="ghost">{copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy text</>}</Btn>
                <button onClick={() => setShowSummary(false)} className="text-stone-500 hover:text-stone-900"><X size={20}/></button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <div className="subhead-italic text-xl">{state.projectName || "Untitled Project"}</div>
                <div className="text-xs text-stone-500 mt-0.5">Client quantity: {state.clientQty}</div>
              </div>

              {/* Design Fee */}
              <div>
                <div className="flex items-baseline justify-between border-b border-stone-300 pb-1 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-stone-700">Design Fee</span>
                  <span className="display text-base">{fmt(designTotal)}</span>
                </div>
                {state.events.map(ev => {
                  const items = [
                    ...ev.tiers.flatMap(t => t.items.filter(i => i.included && i.name.trim()).map(i => ({ name:i.name, price:t.price }))),
                    ...ev.customItems.filter(c => c.name.trim()).map(c => ({ name:c.name, price:Number(c.price||0) })),
                  ];
                  if (!items.length) return null;
                  return (
                    <div key={ev.id} className="mb-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-stone-500 mb-1">{ev.name}</div>
                      {items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-0.5">
                          <span className="text-stone-700">{i.name}</span>
                          <span className="text-stone-900 tabular-nums">${i.price}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Production Fee */}
              <div>
                <div className="flex items-baseline justify-between border-b border-stone-300 pb-1 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-stone-700">Production Fee</span>
                  <span className="display text-base">{fmt(productionTotal)}</span>
                </div>
                {itemProdBreakdown.filter(b => b.itemTotal > 0).map(b => (
                  <div key={b.item.id} className="mb-3 pb-3 border-b border-stone-200 last:border-0">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{b.item.name} <span className="text-stone-400 font-normal text-xs">· {b.item.eventName}</span></span>
                      <span className="tabular-nums">{fmt(b.itemTotal)}</span>
                    </div>
                    {b.vendorBreakdowns.filter(vb => vb.marked > 0).map((vb, i) => (
                      <div key={i} className="flex justify-between text-xs text-stone-600 pl-3 mt-0.5">
                        <span>{VENDOR_TYPES.find(t => t.id === vb.vendor.type)?.label}</span>
                        <span className="tabular-nums">{fmt(vb.marked)}</span>
                      </div>
                    ))}
                    {b.assyCost > 0 && (
                      <div className="flex justify-between text-xs text-stone-600 pl-3 mt-0.5">
                        <span>Assembly ({b.assyQty} × {fmt(b.assyPer)})</span>
                        <span className="tabular-nums">{fmt(b.assyCost)}</span>
                      </div>
                    )}
                  </div>
                ))}
                {pwOrderFees.marked > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-700">Printswell handling & shipping</span>
                    <span className="text-stone-900 tabular-nums">{fmt(pwOrderFees.marked)}</span>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="border-t-2 border-stone-900 pt-4 flex items-baseline justify-between">
                <span className="display-italic text-2xl">Grand Total</span>
                <span className="display text-3xl">{fmt(grandTotal)}</span>
              </div>

              {/* Plain text */}
              <details className="border border-stone-300 bg-white/60">
                <summary className="cursor-pointer px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-stone-700 hover:bg-stone-50">Plain text version</summary>
                <pre className="px-4 py-3 text-xs whitespace-pre-wrap text-stone-700 border-t border-stone-200">{textSummary}</pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
