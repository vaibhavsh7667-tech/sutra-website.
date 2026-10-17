'use client';

import React, { useState } from 'react';
import { cleanNumber } from '@/lib/math-engine';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Info,
} from 'lucide-react';

interface UnitDef {
  name: string;
  symbol: string;
  factor: number; // Ratio to base unit
  offset?: number; // For affine conversions like temperature
}

interface CategoryDef {
  name: string;
  baseUnit: string;
  units: Record<string, UnitDef>;
}

const CONVERSION_CATEGORIES: Record<string, CategoryDef> = {
  speed: {
    name: 'Speed',
    baseUnit: 'm/s',
    units: {
      'm/s': { name: 'Meters per second', symbol: 'm/s', factor: 1 },
      'km/h': { name: 'Kilometers per hour', symbol: 'km/h', factor: 1 / 3.6 },
      mph: { name: 'Miles per hour', symbol: 'mph', factor: 0.44704 },
      knot: { name: 'Knots (nautical mi/h)', symbol: 'kn', factor: 0.514444 },
    },
  },
  length: {
    name: 'Length',
    baseUnit: 'm',
    units: {
      m: { name: 'Meters', symbol: 'm', factor: 1 },
      km: { name: 'Kilometers', symbol: 'km', factor: 1000 },
      cm: { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
      mm: { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
      mi: { name: 'Miles', symbol: 'mi', factor: 1609.344 },
      ft: { name: 'Feet', symbol: 'ft', factor: 0.3048 },
      in: { name: 'Inches', symbol: 'in', factor: 0.0254 },
      yd: { name: 'Yards', symbol: 'yd', factor: 0.9144 },
    },
  },
  temperature: {
    name: 'Temperature',
    baseUnit: 'C',
    units: {
      C: { name: 'Celsius', symbol: '°C', factor: 1, offset: 0 },
      F: { name: 'Fahrenheit', symbol: '°F', factor: 5 / 9, offset: 32 },
      K: { name: 'Kelvin', symbol: 'K', factor: 1, offset: 273.15 },
    },
  },
  mass: {
    name: 'Mass & Weight',
    baseUnit: 'kg',
    units: {
      kg: { name: 'Kilograms', symbol: 'kg', factor: 1 },
      g: { name: 'Grams', symbol: 'g', factor: 0.001 },
      mg: { name: 'Milligrams', symbol: 'mg', factor: 0.000001 },
      lb: { name: 'Pounds', symbol: 'lb', factor: 0.45359237 },
      oz: { name: 'Ounces', symbol: 'oz', factor: 0.02834952 },
      t: { name: 'Metric Tons', symbol: 't', factor: 1000 },
    },
  },
  energy: {
    name: 'Energy',
    baseUnit: 'J',
    units: {
      J: { name: 'Joules', symbol: 'J', factor: 1 },
      kJ: { name: 'Kilojoules', symbol: 'kJ', factor: 1000 },
      cal: { name: 'Calories', symbol: 'cal', factor: 4.184 },
      kcal: { name: 'Kilocalories', symbol: 'kcal', factor: 4184 },
      kWh: { name: 'Kilowatt-hours', symbol: 'kWh', factor: 3600000 },
      eV: { name: 'Electron-volts', symbol: 'eV', factor: 1.602176634e-19 },
    },
  },
  pressure: {
    name: 'Pressure',
    baseUnit: 'Pa',
    units: {
      Pa: { name: 'Pascal', symbol: 'Pa', factor: 1 },
      kPa: { name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
      bar: { name: 'Bar', symbol: 'bar', factor: 100000 },
      psi: { name: 'Pounds per sq inch', symbol: 'psi', factor: 6894.757 },
      atm: { name: 'Standard Atmospheres', symbol: 'atm', factor: 101325 },
    },
  },
  power: {
    name: 'Power',
    baseUnit: 'W',
    units: {
      W: { name: 'Watts', symbol: 'W', factor: 1 },
      kW: { name: 'Kilowatts', symbol: 'kW', factor: 1000 },
      hp: { name: 'Mechanical Horsepower', symbol: 'hp', factor: 745.69987 },
    },
  },
  area: {
    name: 'Area',
    baseUnit: 'm2',
    units: {
      m2: { name: 'Square Meters', symbol: 'm²', factor: 1 },
      km2: { name: 'Square Kilometers', symbol: 'km²', factor: 1000000 },
      ha: { name: 'Hectares', symbol: 'ha', factor: 10000 },
      ac: { name: 'Acres', symbol: 'ac', factor: 4046.856 },
      ft2: { name: 'Square Feet', symbol: 'ft²', factor: 0.092903 },
    },
  },
  volume: {
    name: 'Volume',
    baseUnit: 'L',
    units: {
      L: { name: 'Liters', symbol: 'L', factor: 1 },
      mL: { name: 'Milliliters', symbol: 'mL', factor: 0.001 },
      m3: { name: 'Cubic Meters', symbol: 'm³', factor: 1000 },
      gal: { name: 'US Gallons', symbol: 'gal', factor: 3.78541 },
      cup: { name: 'Cups', symbol: 'cup', factor: 0.236588 },
    },
  },
  time: {
    name: 'Time',
    baseUnit: 's',
    units: {
      s: { name: 'Seconds', symbol: 's', factor: 1 },
      min: { name: 'Minutes', symbol: 'min', factor: 60 },
      h: { name: 'Hours', symbol: 'h', factor: 3600 },
      d: { name: 'Days', symbol: 'd', factor: 86400 },
      yr: { name: 'Years (365 days)', symbol: 'yr', factor: 31536000 },
    },
  },
  force: {
    name: 'Force',
    baseUnit: 'N',
    units: {
      N: { name: 'Newtons', symbol: 'N', factor: 1 },
      kN: { name: 'Kilonewtons', symbol: 'kN', factor: 1000 },
      lbf: { name: 'Pound-force', symbol: 'lbf', factor: 4.44822 },
      dyn: { name: 'Dynes', symbol: 'dyn', factor: 0.00001 },
    },
  },
  frequency: {
    name: 'Frequency',
    baseUnit: 'Hz',
    units: {
      Hz: { name: 'Hertz', symbol: 'Hz', factor: 1 },
      kHz: { name: 'Kilohertz', symbol: 'kHz', factor: 1000 },
      MHz: { name: 'Megahertz', symbol: 'MHz', factor: 1000000 },
      GHz: { name: 'Gigahertz', symbol: 'GHz', factor: 1000000000 },
    },
  },
  data: {
    name: 'Digital Data / Storage',
    baseUnit: 'B',
    units: {
      B: { name: 'Bytes', symbol: 'B', factor: 1 },
      KB: { name: 'Kilobytes', symbol: 'KB', factor: 1024 },
      MB: { name: 'Megabytes', symbol: 'MB', factor: 1048576 },
      GB: { name: 'Gigabytes', symbol: 'GB', factor: 1073741824 },
      TB: { name: 'Terabytes', symbol: 'TB', factor: 1099511627776 },
    },
  },
};

export const UnitConverterView: React.FC = () => {
  const [selectedCatKey, setSelectedCatKey] = useState<string>('speed');
  const [inputValue, setInputValue] = useState<string>('100');
  const [fromUnit, setFromUnit] = useState<string>('km/h');
  const [toUnit, setToUnit] = useState<string>('m/s');
  const [copied, setCopied] = useState<boolean>(false);

  const currentCategory = CONVERSION_CATEGORIES[selectedCatKey];

  // Perform unit conversion calculation
  const calculateConversion = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return { result: '0', formula: '', steps: '' };

    const fromDef = currentCategory.units[fromUnit];
    const toDef = currentCategory.units[toUnit];
    if (!fromDef || !toDef) return { result: '0', formula: '', steps: '' };

    if (selectedCatKey === 'temperature') {
      // Temperature conversions
      let inCelsius = val;
      if (fromUnit === 'F') inCelsius = (val - 32) * (5 / 9);
      else if (fromUnit === 'K') inCelsius = val - 273.15;

      let finalVal = inCelsius;
      let formulaStr = '';
      if (toUnit === 'F') {
        finalVal = inCelsius * (9 / 5) + 32;
        formulaStr = `(°C × 9/5) + 32`;
      } else if (toUnit === 'K') {
        finalVal = inCelsius + 273.15;
        formulaStr = `°C + 273.15`;
      } else {
        formulaStr = `T_base = ${inCelsius.toFixed(2)} °C`;
      }

      return {
        result: cleanNumber(finalVal, 6),
        formula: formulaStr,
        steps: `${val} ${fromDef.symbol} converted to standard base then to ${toDef.symbol}`,
      };
    }

    // Standard linear scaling
    const inBase = val * fromDef.factor;
    const finalVal = inBase / toDef.factor;
    const conversionRatio = fromDef.factor / toDef.factor;

    return {
      result: cleanNumber(finalVal, 6),
      formula: `Value × (${cleanNumber(conversionRatio, 6)})`,
      steps: `${val} ${fromDef.symbol} × (${cleanNumber(fromDef.factor)} / ${cleanNumber(toDef.factor)}) = ${cleanNumber(finalVal, 6)} ${toDef.symbol}`,
    };
  };

  const { result, formula, steps } = calculateConversion();

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200/60">
            <ArrowRightLeft className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Precision Scientific Unit Converter</h2>
            <p className="text-xs text-slate-500">13 Categories with step-by-step conversion formulas</p>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {Object.entries(CONVERSION_CATEGORIES).map(([catKey, cat]) => (
          <button
            key={catKey}
            onClick={() => {
              setSelectedCatKey(catKey);
              const units = Object.keys(cat.units);
              setFromUnit(units[1] || units[0]);
              setToUnit(units[0]);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCatKey === catKey
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Converter Main Interactive Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          {/* From Input Column */}
          <div className="md:col-span-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-500 font-medium">From</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-mono text-2xl font-bold focus:outline-none"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {Object.entries(currentCategory.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs transition hover:rotate-180 duration-300"
              title="Swap Units"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* To Result Column */}
          <div className="md:col-span-3 p-4 bg-cyan-50/50 rounded-2xl border border-cyan-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-cyan-800 font-medium">To (Result)</label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="w-full text-cyan-800 font-mono text-2xl font-bold overflow-x-auto whitespace-nowrap">
              {result}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {Object.entries(currentCategory.units).map(([key, u]) => (
                <option key={key} value={key}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step-by-Step Conversion Derivation & Formula Box */}
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Info className="w-4 h-4 text-cyan-600" />
            <span>Conversion Formula & Arithmetic</span>
          </div>

          <div className="text-xs md:text-sm font-mono text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {steps}
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span>Formula: <span className="text-cyan-800 font-mono">{formula}</span></span>
            <span className="text-[11px] text-slate-400">Base Unit: {currentCategory.baseUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterView;
