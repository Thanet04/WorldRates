"use client";
import React, { useEffect, useState } from "react";
import { Line, Bar } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { LANGS } from "../i18n";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const API_URL = "https://v6.exchangerate-api.com/v6/33862286d07c61122c27feb1/latest/USD";

export default function RatePage() {
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [from, setFrom] = useState<string>("USD");
  const [to, setTo] = useState<string>("THB");
  const [amount, setAmount] = useState<number>(1);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [countryInfo, setCountryInfo] = useState<{ [currency: string]: { country: string; flag: string }[] }>({});
  const [historyRange, setHistoryRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [historyData, setHistoryData] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en'|'th'|'jp'>('en');

  // สำหรับ export กราฟเป็นรูป
  const historyChartRef = useRef<any>(null);
  const currentChartRef = useRef<any>(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setRates(data.conversion_rates);
        setCurrencies(Object.keys(data.conversion_rates));
        setLoading(false);
      })
      .catch(() => {
        setError("ไม่สามารถโหลดข้อมูลอัตราแลกเปลี่ยนได้");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    async function fetchCountryInfo() {
      const info: { [currency: string]: { country: string; flag: string }[] } = {};
      await Promise.all(
        currencies.map(async (cur) => {
          try {
            const res = await fetch(`https://restcountries.com/v3.1/currency/${cur}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const filtered = data.filter((country: any) => {
                if (!country.currencies) return false;
                const keys = Object.keys(country.currencies);
                return keys.length === 1 && keys[0] === cur;
              });
              info[cur] = (filtered.length > 0 ? filtered : []).map((country: any) => ({
                country: country.translations?.tha?.common || country.name.common,
                flag: country.flags?.png || country.flags?.svg || "",
              }));
              if (filtered.length === 0) {
                info[cur] = [];
              }
            } else {
              info[cur] = [{ country: "-", flag: "" }];
            }
          } catch {
            info[cur] = [{ country: "-", flag: "" }];
          }
        })
      );
      setCountryInfo(info);
    }
    if (currencies.length > 0) fetchCountryInfo();
  }, [currencies]);

  useEffect(() => {
    if (rates[from] && rates[to]) {
      const usdAmount = amount / rates[from];
      setResult(usdAmount * rates[to]);
    }
  }, [amount, from, to, rates]);

  useEffect(() => {
    let startDate = new Date();
    if (historyRange === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (historyRange === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (historyRange === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    const start = startDate.toISOString().slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);
    setHistoryLoading(true);
    fetch(`https://api.exchangerate.host/timeseries?start_date=${start}&end_date=${end}&base=${from}&symbols=${to}`)
      .then(res => res.json())
      .then(data => {
        const labels: string[] = [];
        const values: number[] = [];
        if (data.rates) {
          Object.keys(data.rates).sort().forEach(date => {
            labels.push(date);
            values.push(data.rates[date][to]);
          });
        }
        setHistoryData({ labels, data: values });
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  }, [from, to, historyRange]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const t = LANGS[currentLang];

  // Currency symbol mapping (ISO 4217)
  const currencySymbolMap: { [code: string]: string } = {
    USD: '$', EUR: '€', THB: '฿', JPY: '¥', GBP: '£', AUD: 'A$', CAD: 'C$', CHF: 'Fr.', CNY: '¥', HKD: 'HK$', SGD: 'S$', NZD: 'NZ$', SEK: 'kr', KRW: '₩', INR: '₹', RUB: '₽', ZAR: 'R', TRY: '₺', BRL: 'R$', MXN: '$',
    AED: 'د.إ', AFN: '؋', ALL: 'L', AMD: '֏', ANG: 'ƒ', AOA: 'Kz', ARS: '$', AWG: 'ƒ', AZN: '₼', BAM: 'KM', BBD: '$', BDT: '৳', BGN: 'лв', BHD: '.د.ب', BIF: 'FBu', BMD: '$', BND: '$', BOB: 'Bs.', BSD: '$', BTN: 'Nu.', BWP: 'P', BYN: 'Br', BZD: '$', CDF: 'FC', CLP: '$', COP: '$', CRC: '₡', CUP: '$', CVE: '$', CZK: 'Kč', DJF: 'Fdj', DKK: 'kr', DOP: 'RD$', DZD: 'دج', EGP: '£', ERN: 'Nfk', ETB: 'Br', FJD: '$', FKP: '£', GEL: '₾', GHS: '₵', GIP: '£', GMD: 'D', GNF: 'FG', GTQ: 'Q', GYD: '$', HNL: 'L', HRK: 'kn', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪', IMP: '£', IQD: 'ع.د', IRR: '﷼', ISK: 'kr', JEP: '£', JMD: 'J$', JOD: 'د.ا', KES: 'KSh', KGS: 'лв', KHR: '៛', KMF: 'CF', KPW: '₩', KWD: 'د.ك', KYD: '$', KZT: '₸', LAK: '₭', LBP: 'ل.ل', LKR: '₨', LRD: '$', LSL: 'L', LYD: 'ل.د', MAD: 'د.م.', MDL: 'L', MGA: 'Ar', MKD: 'ден', MMK: 'K', MNT: '₮', MOP: 'P', MRU: 'UM', MUR: '₨', MVR: 'Rf', MWK: 'MK', MYR: 'RM', MZN: 'MT', NAD: '$', NGN: '₦', NIO: 'C$', NOK: 'kr', NPR: '₨', OMR: 'ر.ع.', PAB: 'B/.', PEN: 'S/', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: '₲', QAR: 'ر.ق', RON: 'lei', RSD: 'дин', RWF: 'FRw', SAR: 'ر.س', SBD: '$', SCR: '₨', SDG: 'ج.س.', SHP: '£', SLL: 'Le', SOS: 'S', SRD: '$', SSP: '£', STN: 'Db', SYP: '£', SZL: 'E', TJS: 'ЅМ', TMT: 'm', TND: 'د.ت', TOP: 'T$', TTD: 'TT$', TWD: 'NT$', TZS: 'Sh', UAH: '₴', UGX: 'USh', UYU: '$U', UZS: 'лв', VES: 'Bs.S', VND: '₫', VUV: 'VT', WST: 'T', XAF: 'FCFA', XCD: '$', XOF: 'CFA', XPF: '₣', YER: '﷼', ZMW: 'ZK', ZWL: '$'
  };

  // Export ตารางเป็น CSV
  function exportTableCSV() {
    const rows: any[][] = [];
    rows.push(['#', t.table.currency, 'Symbol', t.table.country, t.table.flag, t.table.rate]);
    currencies.forEach((cur, idx) => {
      const infoArr = countryInfo[cur] || [{ country: '-', flag: '' }];
      infoArr.forEach((info) => {
        rows.push([
          idx + 1,
          cur,
          currencySymbolMap[cur] || '-',
          info.country,
          info.flag,
          (1 / rates[cur]).toLocaleString(undefined, { maximumFractionDigits: 6 })
        ]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rates');
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, 'exchange-rates.csv');
  }

  // Export ตารางเป็น Excel
  function exportTableExcel() {
    const rows: any[][] = [];
    rows.push(['#', t.table.currency, 'Symbol', t.table.country, t.table.flag, t.table.rate]);
    currencies.forEach((cur, idx) => {
      const infoArr = countryInfo[cur] || [{ country: '-', flag: '' }];
      infoArr.forEach((info) => {
        rows.push([
          idx + 1,
          cur,
          currencySymbolMap[cur] || '-',
          info.country,
          info.flag,
          (1 / rates[cur]).toLocaleString(undefined, { maximumFractionDigits: 6 })
        ]);
      });
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rates');
    XLSX.writeFile(wb, 'exchange-rates.xlsx');
  }

  // Export ตารางเป็น PDF
  function exportTablePDF() {
    const doc = new jsPDF();
    const rows: any[][] = [];
    currencies.forEach((cur, idx) => {
      const infoArr = countryInfo[cur] || [{ country: '-', flag: '' }];
      infoArr.forEach((info) => {
        rows.push([
          idx + 1,
          cur,
          currencySymbolMap[cur] || '-',
          info.country,
          info.flag,
          (1 / rates[cur]).toLocaleString(undefined, { maximumFractionDigits: 6 })
        ]);
      });
    });
    autoTable(doc, {
      head: [["#", t.table.currency, "Symbol", t.table.country, t.table.flag, t.table.rate]],
      body: rows,
    });
    doc.save('exchange-rates.pdf');
  }

  // Export กราฟเป็น PNG
  function exportChartImage(ref: any, filename: string) {
    if (ref.current) {
      const url = ref.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent px-4">
      <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
        <select value={currentLang} onChange={e => setCurrentLang(e.target.value as any)} className="border rounded px-2 py-1 shadow-sm bg-white border-black">
          <option value="en">{LANGS.en.flag} EN</option>
          <option value="th">{LANGS.th.flag} TH</option>
          <option value="jp">{LANGS.jp.flag} JP</option>
        </select>
        <button
          className="border rounded-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white shadow-sm hover:scale-110 transition"
          onClick={() => setDark(d => !d)}
          title="Toggle dark mode"
        >
          {dark ? '🌙' : '☀️'}
        </button>
      </div>
      <div className="w-full flex flex-col gap-8 items-center justify-center py-8 px-4 md:px-0">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 text-center drop-shadow mb-2">{t.title}</h1>
        {/* Export/Download buttons (top of page) */}
        <div className="w-full flex flex-wrap gap-2 justify-end mb-6">
          <button onClick={exportTableCSV} className="px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold border border-blue-300">Export CSV</button>
          <button onClick={exportTableExcel} className="px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-800 font-semibold border border-green-300">Export Excel</button>
          <button onClick={exportTablePDF} className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 font-semibold border border-red-300">Export PDF</button>
          <button onClick={() => exportChartImage(historyChartRef, 'historical-chart.png')} className="px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold border border-yellow-300">Download Historical Chart</button>
          <button onClick={() => exportChartImage(currentChartRef, 'current-chart.png')} className="px-3 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold border border-purple-300">Download Current Chart</button>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 px-0 md:px-4">
          <div className="w-full md:w-1/2 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col gap-2 px-0 md:px-4">
            <div className="flex flex-row flex-wrap items-center gap-4 mb-2">
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg whitespace-nowrap">{t.historical}</span>
              <button className={historyRange === '7d' ? 'bg-blue-500 text-white px-2 py-1 rounded shadow' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded shadow'} onClick={() => setHistoryRange('7d')}>{t.days7}</button>
              <button className={historyRange === '30d' ? 'bg-blue-500 text-white px-2 py-1 rounded shadow' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded shadow'} onClick={() => setHistoryRange('30d')}>{t.days30}</button>
              <button className={historyRange === '1y' ? 'bg-blue-500 text-white px-2 py-1 rounded shadow' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded shadow'} onClick={() => setHistoryRange('1y')}>{t.year1}</button>
            </div>
            {historyLoading ? (
              <div className="text-center text-gray-400">Loading chart...</div>
            ) : historyData.data.length === 0 ? (
              <div className="text-center text-gray-400 py-8">{t.table.noData}</div>
            ) : (
              <Line
                ref={historyChartRef}
                data={{
                  labels: historyData.labels,
                  datasets: [
                    {
                      label: `${from} → ${to}`,
                      data: historyData.data,
                      borderColor: '#facc15',
                      backgroundColor: 'rgba(59,130,246,0.1)',
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: false },
                  },
                  scales: {
                    x: { display: true, title: { display: false } },
                    y: { display: true, title: { display: false } },
                  },
                }}
                height={80}
              />
            )}
          </div>
          <div className="w-full md:w-1/2 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col gap-2 px-0 md:px-4">
            <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg mb-2">Current Exchange Rates (USD Base)</span>
            <Bar
              ref={currentChartRef}
              data={{
                labels: currencies,
                datasets: [
                  {
                    label: '1 USD = ...',
                    data: currencies.map(cur => rates[cur]),
                    backgroundColor: 'rgba(59,130,246,0.5)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                },
                scales: {
                  x: { display: true, title: { display: false }, ticks: { maxTicksLimit: 10, autoSkip: true } },
                  y: { display: true, title: { display: false } },
                },
              }}
              height={80}
            />
          </div>
        </div>
        <div className="w-full bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center px-0 md:px-4">
          <div className="w-full overflow-y-auto overflow-hidden hide-scroll-indicator rounded-2xl" style={{ maxHeight: 400 }}>
            <table className="w-full text-sm rounded-2xl">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 border-r border-black" style={{ width: 40 }}>#</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 border-r border-black" style={{ width: 100 }}>{t.table.currency}</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 border-r border-black" style={{ width: 60 }}>Symbol</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 border-r border-black" style={{ width: 160 }}>{t.table.country}</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 border-r border-black" style={{ width: 60 }}>{t.table.flag}</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300" style={{ width: 120 }}>{t.table.rate}</th>
                </tr>
              </thead>
              <tbody>
                {currencies
                  .map((cur, idx) => {
                    const infoArr = countryInfo[cur] || [{ country: "-", flag: "" }];
                    const filteredInfoArr = infoArr.filter(
                      info =>
                        (!search || cur.includes(search)) ||
                        (info.country && info.country.toUpperCase().includes(search))
                    );
                    if (filteredInfoArr.length === 0) return null;
                    return filteredInfoArr.map((info, i) => (
                      <tr
                        key={cur + i}
                        className={
                          ((idx % 2 === 0)
                            ? "bg-blue-100 hover:bg-blue-200"
                            : "bg-yellow-100 hover:bg-yellow-200") + " border-b border-white"
                        }
                      >
                        <td className="px-2 py-1 text-center text-gray-500 border-r border-black">{idx + 1}</td>
                        <td className="px-2 py-1 font-mono text-blue-900 font-semibold border-r border-black">{cur}</td>
                        <td className="px-2 py-1 text-center border-r border-black">{currencySymbolMap[cur] || '-'}</td>
                        <td className="px-2 py-1 text-center border-r border-black">{info.country}</td>
                        <td className="px-2 py-1 text-center border-r border-black">
                          {info.flag ? <img src={info.flag} alt={info.country} width={24} height={18} style={{ display: "inline-block" }} /> : "-"}
                        </td>
                        <td className="px-2 py-1 text-yellow-700 font-bold">{(1 / rates[cur]).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">* {t.table.noData}</div>
          <div className="w-full bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4 mt-6 px-0 md:px-4">
            <span className="font-semibold text-blue-700 dark:text-blue-300 text-lg md:text-xl whitespace-nowrap">{t.converter}</span>
            <input
              type="number"
              className="border rounded px-3 py-2 w-32 text-lg font-bold text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-400"
              value={amount}
              min={0}
              onChange={e => setAmount(Number(e.target.value))}
            />
            <select
              className="border rounded px-2 py-2 bg-yellow-50 dark:bg-gray-800 text-yellow-800 dark:text-yellow-200 font-semibold focus:ring-2 focus:ring-yellow-400 hide-scroll-indicator"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              {currencies.map(cur => <option key={cur} value={cur}>{currencySymbolMap[cur] ? `${currencySymbolMap[cur]} ` : ''}{cur}</option>)}
            </select>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-full shadow transition text-xl"
              onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
              title={t.swap}
            >
              ⇄
            </button>
            <select
              className="border rounded px-2 py-2 bg-blue-50 dark:bg-gray-800 text-blue-900 dark:text-blue-200 font-semibold focus:ring-2 focus:ring-blue-400 hide-scroll-indicator"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              {currencies.map(cur => <option key={cur} value={cur}>{currencySymbolMap[cur] ? `${currencySymbolMap[cur]} ` : ''}{cur}</option>)}
            </select>
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300 min-w-[120px] text-center">
              {amount} {from} = {result ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-"} {to}
            </div>
          </div>
        </div>
        <div className="text-md text-gray-400 mt-4 mb-8">{t.source} <a href="https://www.exchangerate-api.com/" className="underline text-blue-500" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a></div>
      </div>
    </div>
  );
}
