"use client";
import React, { useEffect, useState } from "react";

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
    if (rates[from] && rates[to]) {
      const usdAmount = amount / rates[from];
      setResult(usdAmount * rates[to]);
    }
  }, [amount, from, to, rates]);

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Mapping สำหรับสกุลเงินหลัก (ตัวอย่าง 20 รายการ)
  const currencyCountryMap: { [currency: string]: { country: string; flag: string } } = {
    USD: { country: "United States", flag: "🇺🇸" },
    EUR: { country: "European Union", flag: "🇪🇺" },
    THB: { country: "Thailand", flag: "🇹🇭" },
    JPY: { country: "Japan", flag: "🇯🇵" },
    GBP: { country: "United Kingdom", flag: "🇬🇧" },
    AUD: { country: "Australia", flag: "🇦🇺" },
    CAD: { country: "Canada", flag: "🇨🇦" },
    CHF: { country: "Switzerland", flag: "🇨🇭" },
    CNY: { country: "China", flag: "🇨🇳" },
    HKD: { country: "Hong Kong", flag: "🇭🇰" },
    SGD: { country: "Singapore", flag: "🇸🇬" },
    NZD: { country: "New Zealand", flag: "🇳🇿" },
    SEK: { country: "Sweden", flag: "🇸🇪" },
    KRW: { country: "South Korea", flag: "🇰🇷" },
    INR: { country: "India", flag: "🇮🇳" },
    RUB: { country: "Russia", flag: "🇷🇺" },
    ZAR: { country: "South Africa", flag: "🇿🇦" },
    TRY: { country: "Turkey", flag: "🇹🇷" },
    BRL: { country: "Brazil", flag: "🇧🇷" },
    MXN: { country: "Mexico", flag: "🇲🇽" },
  };

  return (
    <div className="w-full bg-white min-h-screen flex flex-col">
      <div className="flex flex-col items-center flex-1">
        <div className="w-full my-6 flex flex-col md:flex-row items-center justify-between px-8 gap-2">
          <h1 className="text-2xl font-bold text-blue-700">อัตราแลกเปลี่ยนเงินตราทั่วโลก</h1>
          <input
            type="text"
            placeholder="ค้นหาสกุลเงิน..."
            className="border rounded px-3 py-1 bg-blue-50 text-black font-semibold shadow-sm mt-2 md:mt-0 mr-2 md:mr-0"
            style={{ minWidth: 180 }}
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
          />
        </div>
        <div className="w-full max-w-2xl bg-white rounded-2xl p-4 flex flex-col items-center h-full min-h-[400px] flex-1">
          <div className="w-full overflow-y-auto overflow-hidden h-full" style={{ maxHeight: 400 }}>
            <table className="w-full text-sm rounded-2xl">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 rounded-tl-2xl" style={{ width: 40 }}>#</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300" style={{ width: 100 }}>สกุลเงิน</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300" style={{ width: 160 }}>ประเทศ</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300" style={{ width: 60 }}>ธง</th>
                  <th className="px-2 py-1 text-white sticky top-0 z-10 bg-gradient-to-r from-blue-400 to-yellow-300 rounded-tr-2xl" style={{ width: 120 }}>เทียบกับ USD</th>
                </tr>
              </thead>
              <tbody>
                {currencies
                  .filter(cur => cur.includes(search))
                  .map((cur, idx) => {
                    const info = currencyCountryMap[cur] || { country: "-", flag: "🌐" };
                    return (
                      <tr
                        key={cur}
                        className={
                          (idx % 2 === 0
                            ? "bg-blue-100 hover:bg-blue-200"
                            : "bg-yellow-100 hover:bg-yellow-200") + " border-b border-white"
                        }
                      >
                        <td className="px-2 py-1 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-2 py-1 font-mono text-blue-900 font-semibold">{cur}</td>
                        <td className="px-2 py-1 text-gray-800">{info.country}</td>
                        <td className="px-2 py-1 text-2xl text-center">{info.flag}</td>
                        <td className="px-2 py-1 text-yellow-700 font-bold">{rates[cur]}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">* แสดงทั้งหมด {currencies.filter(cur => cur.includes(search)).length} สกุลเงิน</div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-8">
        <h2 className="text-xl font-semibold mb-2 text-yellow-600">แปลงค่าเงิน</h2>
        <div className="flex flex-col md:flex-row gap-2 items-center mb-2">
          <input
            type="number"
            className="border rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-400 bg-blue-50 text-blue-900 font-bold"
            value={amount}
            min={0}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select
            className="border rounded px-2 py-1 bg-yellow-50 text-yellow-800 font-semibold focus:ring-2 focus:ring-yellow-400"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {currencies.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
          <span className="mx-2 text-blue-600 font-bold text-xl">→</span>
          <select
            className="border rounded px-2 py-1 bg-blue-50 text-blue-900 font-semibold focus:ring-2 focus:ring-blue-400"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            {currencies.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-lg font-bold text-yellow-700 ">
          {amount} {from} = {result ? result.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "-"} {to}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-4">ข้อมูลจาก <a href="https://www.exchangerate-api.com/" className="underline text-blue-500" target="_blank" rel="noopener noreferrer">ExchangeRate-API</a></div>
    </div>
  );
}
