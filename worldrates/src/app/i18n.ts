// src/app/i18n.ts
export const LANGS = {
  en: {
    language: "Language",
    title: "World Currency Exchange Rates",
    search: "Search currency or country...",
    converter: "Currency Converter",
    swap: "Swap",
    historical: "Historical Exchange Rate",
    current: "Current Exchange Rates (USD Base)",
    days7: "7 days",
    days30: "30 days",
    year1: "1 year",
    from: "From",
    to: "To",
    clear: "Clear",
    result: "Result",
    table: {
      currency: "Currency",
      country: "Country",
      flag: "Flag",
      rate: "1 USD",
      noData: "No data found"
    },
    source: "Data from ExchangeRate-API"
  },
  th: {
    language: "ภาษา",
    title: "อัตราแลกเปลี่ยนเงินตราทั่วโลก",
    search: "ค้นหาสกุลเงิน หรือประเทศ...",
    converter: "ตัวแปลงเงินตรา",
    swap: "สลับ",
    historical: "กราฟอัตราแลกเปลี่ยนย้อนหลัง",
    current: "อัตราแลกเปลี่ยนปัจจุบัน (USD Base)",
    days7: "7 วัน",
    days30: "30 วัน",
    year1: "1 ปี",
    from: "จาก",
    to: "เป็น",
    clear: "ล้าง",
    result: "ผลลัพธ์",
    table: {
      currency: "สกุลเงิน",
      country: "ประเทศ",
      flag: "ธง",
      rate: "1 USD",
      noData: "ไม่พบข้อมูล"
    },
    source: "ข้อมูลจาก ExchangeRate-API"
  },
  jp: {
    language: "言語",
    title: "世界の為替レート",
    search: "通貨または国を検索...",
    converter: "通貨コンバーター",
    swap: "入れ替え",
    historical: "為替レート履歴グラフ",
    current: "現在の為替レート (USD 基準)",
    days7: "7日間",
    days30: "30日間",
    year1: "1年",
    from: "から",
    to: "へ",
    clear: "クリア",
    result: "結果",
    table: {
      currency: "通貨",
      country: "国",
      flag: "国旗",
      rate: "1 USD",
      noData: "データが見つかりません"
    },
    source: "データ元: ExchangeRate-API"
  }
} as const; 