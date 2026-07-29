import type { Language } from "./index";

const dynamicTranslations: Record<string, Record<Language, string>> = {
  // Animal Classes & Categories & Stages
  "Lactating Cow": {
    en: "Lactating Cow",
    am: "የምትታለብ ላም",
    om: "Sa'a Aannanii",
  },
  "Dry Cow": {
    en: "Dry Cow",
    am: "ያረፈች/የማትታለብ ላም",
    om: "Sa'a Aannan Dhaabde",
  },
  Cow: {
    en: "Cow",
    am: "ላም",
    om: "Sa'a",
  },
  "Pregnant Cow": {
    en: "Pregnant Cow",
    am: "እርጉዝ ላም",
    om: "Sa'a Ulfa",
  },
  "Pregnant cow": {
    en: "Pregnant Cow",
    am: "እርጉዝ ላም",
    om: "Sa'a Ulfa",
  },
  Heifer: {
    en: "Heifer",
    am: "ጊደር",
    om: "Goromsa",
  },
  "Growing Heifer": {
    en: "Growing Heifer",
    am: "ታዳጊ ጊደር",
    om: "Goromsa Guddataa Jiru",
  },
  "Breeding Female": {
    en: "Breeding Female",
    am: "ለመራቦ የደረሰች ላም/ጊደር",
    om: "Dhala Horataaf Ga'e",
  },
  Calf: {
    en: "Calf",
    am: "ጥጃ",
    om: "Jabbii",
  },
  Bull: {
    en: "Bull",
    am: "ኮርማ",
    om: "Korma",
  },

  // Lactation Stages
  LATE: {
    en: "LATE",
    am: "የመጨረሻ ማለብ (LATE)",
    om: "Aannan Dhumaa (LATE)",
  },
  EARLY: {
    en: "EARLY",
    am: "የመጀመሪያ ማለብ (EARLY)",
    om: "Aannan Jalqabaa (EARLY)",
  },
  MID: {
    en: "MID",
    am: "የመካከለኛ ማለብ (MID)",
    om: "Aannan Giddu-galeessaa (MID)",
  },
  DRY: {
    en: "DRY",
    am: "ያረፈች/የማይታለብ (DRY)",
    om: "Aannan Dhaabde (DRY)",
  },
  NOT_LACTATING: {
    en: "NOT LACTATING",
    am: "የማትታለብ",
    om: "Aannan Kan Hin Kennine",
  },

  // Husbandry Window Titles & Events
  "Voluntary Waiting Period (VWP)": {
    en: "Voluntary Waiting Period (VWP)",
    am: "የእረፍት ጊዜ (VWP)",
    om: "Yeroo Boqonnaa (VWP)",
  },
  "Voluntary Waiting Period": {
    en: "Voluntary Waiting Period",
    am: "የእረፍት ጊዜ",
    om: "Yeroo Boqonnaa",
  },
  "First AI / Insemination Window": {
    en: "First AI / Insemination Window",
    am: "የመጀመሪያው የማዳቀል/ሰው ሰራሽ ማዳቀል ጊዜ",
    om: "Yeroo Ulfeessaa Isa Jalqabaa (AI)",
  },
  "First Insemination Window": {
    en: "First Insemination Window",
    am: "የመጀመሪያው የማዳቀል ጊዜ",
    om: "Yeroo Ulfeessaa Isa Jalqabaa",
  },
  "Pregnancy Check Window": {
    en: "Pregnancy Check Window",
    am: "የእርግዝና ምርመራ ጊዜ",
    om: "Yeroo Qorannoo Ulfaa",
  },
  "Pregnancy Check": {
    en: "Pregnancy Check",
    am: "የእርግዝና ምርመራ",
    om: "Qorannoo Ulfaa",
  },
  "Fresh-cow checkup window": {
    en: "Fresh-cow checkup window",
    am: "የወለደች አዲስ ላም ምርመራ ጊዜ",
    om: "Yeroo Qorannoo Sa'a Haaraa Dhaala",
  },
  "Suggested dry-off window": {
    en: "Suggested dry-off window",
    am: "የተጠቆመ ማለብ ማቆሚያ ጊዜ",
    om: "Yeroo Aannan Dhaabuu Eegamu",
  },
  "Estimated Dry-off Window": {
    en: "Estimated Dry-off Window",
    am: "የተገመተ ማለብ ማቆሚያ ጊዜ",
    om: "Yeroo Aannan Dhaabuu Eegamu",
  },
  "Dry-off Window": {
    en: "Dry-off Window",
    am: "ማለብ ማቆሚያ ጊዜ",
    om: "Yeroo Aannan Dhaabuu",
  },
  "Dry-off Due": {
    en: "Dry-off Due",
    am: "ማለብ የሚቆምበት ጊዜ",
    om: "Aannan Dhaabuu Dhiyaate",
  },
  "Calving preparation window": {
    en: "Calving preparation window",
    am: "የወሊድ ዝግጅት ጊዜ",
    om: "Yeroo Qophii Dhaloota",
  },
  "Calving preparation": {
    en: "Calving preparation",
    am: "የወሊድ ዝግጅት",
    om: "Qophii Dhaloota",
  },
  "Expected Calving Window": {
    en: "Expected Calving Window",
    am: "የሚጠበቅበት የወሊድ ጊዜ",
    om: "Yeroo Dhaloota Eegamu",
  },
  "Expected Calving": {
    en: "Expected Calving",
    am: "የሚጠበቅ ወሊድ",
    om: "Dhaloota Eegamu",
  },
  "Dry-off before calving": {
    en: "Dry-off before calving",
    am: "ከወሊድ በፊት ማለብ ማቆም",
    om: "Dhaloota Dura Aannan Dhaabuu",
  },
  "Dry-off": {
    en: "Dry-off",
    am: "ማለብ ማቆሚያ",
    om: "Aannan Dhaabuu",
  },
  "Weaning Window": {
    en: "Weaning Window",
    am: "ጥጃ የማስጣል ጊዜ",
    om: "Yeroo Jabbii Guursisuu",
  },
  "Vaccination Due": {
    en: "Vaccination Due",
    am: "የክትባት ጊዜ",
    om: "Talaallii Dhiyaate",
  },
  "Deworming Due": {
    en: "Deworming Due",
    am: "የሆድ ላት መድሃኒት መስጫ ጊዜ",
    om: "Qoricha Raammoo Dhiyaate",
  },
  "AI Window": {
    en: "AI Window",
    am: "የሰው ሰራሽ ማዳቀል ጊዜ",
    om: "Yeroo AI",
  },

  // Warning Titles & Messages
  "Overdue: Fresh-cow checkup window": {
    en: "Overdue: Fresh-cow checkup window",
    am: "ያለፈበት: የወለደች አዲስ ላም ምርመራ ጊዜ",
    om: "Dabreera: Yeroo Qorannoo Sa'a Haaraa Dhaala",
  },
  "Overdue: First insemination window": {
    en: "Overdue: First insemination window",
    am: "ያለፈበት: የመጀመሪያ የማዳቀል ጊዜ",
    om: "Dabreera: Yeroo Ulfeessaa Isa Jalqabaa",
  },
  "Lactation without calving date": {
    en: "Lactation without calving date",
    am: "የወሊድ ቀን ሳይመዘገብ መታለብ",
    om: "Guyyaa dhaloota malee aannan mul'ate",
  },
  "Overdue pregnancy check": {
    en: "Overdue pregnancy check",
    am: "ያለፈ የእርግዝና ምርመራ",
    om: "Qorannoo ulfaa yeroon dabre",
  },
  "Overdue dry-off": {
    en: "Overdue dry-off",
    am: "ያለፈ ማለብ ማቆሚያ",
    om: "Aannan dhaabuu yeroon dabre",
  },
  "Overdue calving": {
    en: "Overdue calving",
    am: "ያለፈ የወሊድ ጊዜ",
    om: "Dhaloota yeroon dabre",
  },
  "Unconfirmed pregnancy": {
    en: "Unconfirmed pregnancy",
    am: "ያልተረጋገጠ እርግዝና",
    om: "Ulfa hin mirkanaa'in",
  },
  "Voluntary waiting period active": {
    en: "Voluntary waiting period active",
    am: "የእረፍት ጊዜ በሂደት ላይ ነው",
    om: "Yeroon boqonnaa hojiirra jira",
  },
  "Heifer past first-breeding age": {
    en: "Heifer past first-breeding age",
    am: "ጊደር የመጀመሪያ የማዳቀል እድሜ አልፏል",
    om: "Goromsi yeroo ulfeessaa jalqabaa dabarseera",
  },

  // Descriptions & Messages
  "Daily monitoring for 21 days post-calving.": {
    en: "Daily monitoring for 21 days post-calving.",
    am: "ከወለደች በኋላ ለ 21 ቀናት ዕለታዊ ክትትል ማድረግ።",
    om: "Dhaloota booda guyyoota 21'iif hordoffii guyyaa.",
  },
  "Move to calving pen and monitor closely.": {
    en: "Move to calving pen and monitor closely.",
    am: "ወደ መውለጃ ቦታ ያዛውሩ እና በቅርበት ይከታተሉ።",
    om: "Gara iddoo dhalootaatti jijjiiruun dhiyoon hordofaa.",
  },
  "Move to calving area, check supplies, monitor closely.": {
    en: "Move to calving area, check supplies, monitor closely.",
    am: "ወደ መውለጃ ቦታ ያዛውሩ፣ አስፈላጊ ቁሳቁሶችን ያዘጋጁ፣ በቅርበት ይከታተሉ።",
    om: "Gara iddoo dhalootaatti jijjiiraa, meeshaalee qopheessaa, dhiyoon hordofaa.",
  },
  "Dry off ~60 days before expected calving. Dry-cow therapy / teat sealant as per protocol.": {
    en: "Dry off ~60 days before expected calving. Dry-cow therapy / teat sealant as per protocol.",
    am: "ከሚጠበቀው ወሊድ ~60 ቀናት በፊት ማለብ ያቁሙ። እንደ መመሪያው የደረቅ ላም ሕክምና ወይም ግብት መጠበቂያ ይስጡ።",
    om: "Dhaloota eegamu dura guyyaa ~60 aannan dhaabaa.",
  },
  "Target dry-off before expected calving.": {
    en: "Target dry-off before expected calving.",
    am: "ከወሊድ በፊት ማለብ ማቆም ግብ።",
    om: "Dhaloota eegamu dura aannan dhaabuu.",
  },
  "Expected calving date. Assist only if needed.": {
    en: "Expected calving date. Assist only if needed.",
    am: "የሚጠበቅበት የወሊድ ቀን። አስፈላጊ ከሆነ ብቻ ይረዱ።",
    om: "Guyyaa dhaloota eegamu. Barbaachisaa qofa gargaaraa.",
  },
  "Rest period post calving. Do not breed until complete.": {
    en: "Rest period post calving. Do not breed until complete.",
    am: "ከወሊድ በኋላ ያለ የእረፍት ጊዜ። እስከሚጠናቀቅ አያዳቅሉ።",
    om: "Yeroo boqonnaa dhaloota boodaa. Hangasitti hin ulfeessinaa.",
  },
  "Optimal timing for first artificial insemination or natural service.": {
    en: "Optimal timing for first artificial insemination or natural service.",
    am: "ለመጀመሪያው ሰው ሰራሽ ወይም ተፈጥሯዊ ማዳቀል ተመራጭ ጊዜ።",
    om: "Yeroo gaggaarii ulfeessaa jalqabaa ykn kormaa.",
  },
  "Confirm pregnancy via vet check (palpation or ultrasound).": {
    en: "Confirm pregnancy via vet check (palpation or ultrasound).",
    am: "በእንስሳት ሐኪም ምርመራ እርግዝናውን ያረጋግጡ።",
    om: "Ulfa qorannoo ogeessa beeyladaatiin mirkaneessaa.",
  },
  "Stop milking to allow udder involution prior to calving.": {
    en: "Stop milking to allow udder involution prior to calving.",
    am: "ከወሊድ በፊት ግብቷ እንዲያረፍ ማለብ ያቁሙ።",
    om: "Dhaloota dura aannan dhaabuun qoppheessaa.",
  },
  "Target window for calving based on gestation period.": {
    en: "Target window for calving based on gestation period.",
    am: "በእርግዝና ጊዜ ላይ የተመሰረተ የታቀደ የወሊድ ጊዜ።",
    om: "Gestation period irratti hundaa'uun yeroo dhaloota eegamu.",
  },
  "Calculated from birth date and reproduction records.": {
    en: "Calculated from birth date and reproduction records.",
    am: "ከትውልድ ቀን እና ከስነ-ተዋልዶ መዝገቦች የተሰላ።",
    om: "Guyyaa dhaloota fi galmee horataarraa kan shallagame.",
  },
  "Calculated from birth date and lactation history.": {
    en: "Calculated from birth date and lactation history.",
    am: "ከትውልድ ቀን እና ከወተት ታሪክ የተሰላ።",
    om: "Guyyaa dhaloota fi seenaa aannaniirraa kan shallagame.",
  },

  // Breeding Event Badges
  PREGNANT: {
    en: "PREGNANT",
    am: "እርጉዝ",
    om: "ULFA",
  },
  CALVED: {
    en: "CALVED",
    am: "ወልዳለች",
    om: "DHALCHEERA",
  },
  BRED: {
    en: "BRED",
    am: "ተዳቅላለች",
    om: "ULFAAGGEE",
  },

  // Relative Time Phrases
  Today: {
    en: "Today",
    am: "ዛሬ",
    om: "Har'a",
  },
};

// Dynamic regex patterns for complex strings containing numbers/dates
const dynamicPatterns: Array<{
  pattern: RegExp;
  translate: Record<Language, (match: string, ...groups: string[]) => string>;
}> = [
  // "Last calved 2025-07-23; last AI/service 2026-07-23."
  {
    pattern: /^Last calved (.*?);\s*last AI\/service (.*?)\.?$/i,
    translate: {
      en: (_m, cDate, aiDate) => `Last calved ${cDate}; last AI/service ${aiDate}.`,
      am: (_m, cDate, aiDate) => `መጨረሻ የወለደችበት ${cDate}፤ መጨረሻ የተጠቃችበት/የተዳቀለችበት ${aiDate}።`,
      om: (_m, cDate, aiDate) => `Dhaloota dhumaa ${cDate}; ulfeessaa dhumaa ${aiDate}.`,
    },
  },
  // "Last calved 2025-07-23."
  {
    pattern: /^Last calved (.*?)\.?$/i,
    translate: {
      en: (_m, cDate) => `Last calved ${cDate}.`,
      am: (_m, cDate) => `መጨረሻ የወለደችበት ${cDate}።`,
      om: (_m, cDate) => `Dhaloota dhumaa ${cDate}.`,
    },
  },
  // "5876 is 1486 days old and has no breeding/AI record (target ~450 days)."
  {
    pattern: /^(\S+)\s*is\s*(\d+)\s*days old and has no breeding\/AI record\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, tag, days, target) => `${tag} is ${days} days old and has no breeding/AI record (${target}).`,
      am: (_m, tag, days, target) =>
        `ከብት ${tag} እድሜዋ ${days} ቀን ሲሆን ምንም የማዳቀል/AI መዝገብ የላትም (${target.replace("target", "ታለመው")})።`,
      om: (_m, tag, days, target) => `${tag} umrii guyyaa ${days} kan qabduu fi galmee ulfeessaa hin qabdu (${target}).`,
    },
  },
  // "~60 days before expected calving (2027-04-29)."
  {
    pattern: /^~?(\d+)\s*days before expected calving\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, days, date) => `~${days} days before expected calving (${date}).`,
      am: (_m, days, date) => `ከሚጠበቀው ወሊድ (${date}) ~${days} ቀናት በፊት።`,
      om: (_m, days, date) => `Dhaloota eegamu (${date}) dura guyyaa ~${days}.`,
    },
  },
  // "Gestation ~280 days from breeding/AI."
  {
    pattern: /^Gestation ~?(\d+)\s*days from breeding\/AI\.?$/i,
    translate: {
      en: (_m, days) => `Gestation ~${days} days from breeding/AI.`,
      am: (_m, days) => `ከማዳቀል/AI በኋላ ~${days} ቀናት የእርግዝና ጊዜ።`,
      om: (_m, days) => `Ulfeessaa/AI irraa guyyoota ~${days}.`,
    },
  },
  // "Heifers typically eligible ~450 days of age (~15 months)."
  {
    pattern: /^Heifers typically eligible ~?(\d+)\s*days of age\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, days, months) => `Heifers typically eligible ~${days} days of age (${months}).`,
      am: (_m, days, months) =>
        `ጊደሮች በተለምዶ በ ~${days} ቀናት እድሜ (${months.replace("months", "ወራት").replace("month", "ወር")}) ለመራቦ ይደርሳሉ።`,
      om: (_m, days, months) => `Goromsi yeroo baay'ee umrii guyyaa ~${days} (${months}) ulfaaf ga'u.`,
    },
  },
  // "Window ended 350 day(s) ago (2025-08-13)."
  {
    pattern: /^(?:Window ended|Closed)\s*(\d+)\s*day\(s\)\s*ago\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, days, range) => `Window ended ${days} day(s) ago (${range}).`,
      am: (_m, days, range) => `ጊዜው ከ ${days} ቀን(ናት) በፊት ተጠናቋል (${range})።`,
      om: (_m, days, range) => `Yeroon guyyaa ${days} dura xumurameera (${range}).`,
    },
  },
  // "Opens in 300 day(s) (2027-05-25 → 2027-07-06)."
  {
    pattern: /^Opens in (\d+)\s*day\(s\)\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, days, range) => `Opens in ${days} day(s) (${range}).`,
      am: (_m, days, range) => `በ ${days} ቀን(ናት) ውስጥ ይጀምራል (${range})።`,
      om: (_m, days, range) => `Guyyaa ${days} keessatti banama (${range}).`,
    },
  },
  // "Active now (2027-05-25 → 2027-07-06)."
  {
    pattern: /^Active now\s*\((.*?)\)\.?$/i,
    translate: {
      en: (_m, range) => `Active now (${range}).`,
      am: (_m, range) => `አሁን በሂደት ላይ ነው (${range})።`,
      om: (_m, range) => `Amma hojiirra jira (${range}).`,
    },
  },
  // "Overdue by 5 day(s)."
  {
    pattern: /^Overdue by (\d+)\s*day\(s\)\.?$/i,
    translate: {
      en: (_m, days) => `Overdue by ${days} day(s).`,
      am: (_m, days) => `በ ${days} ቀን(ናት) ዘግይቷል።`,
      om: (_m, days) => `Guyyaa ${days}n tureera.`,
    },
  },
  // "Due in 30 day(s)."
  {
    pattern: /^Due in (\d+)\s*day\(s\)\.?$/i,
    translate: {
      en: (_m, days) => `Due in ${days} day(s).`,
      am: (_m, days) => `በ ${days} ቀን(ናት) ውስጥ ይደርሳል።`,
      om: (_m, days) => `Guyyaa ${days} keessatti dhiyaata.`,
    },
  },
  // "5 day(s) ago"
  {
    pattern: /^(\d+)\s*day\(s\) ago$/i,
    translate: {
      en: (_m, days) => `${days} day(s) ago`,
      am: (_m, days) => `ከ ${days} ቀን(ናት) በፊት`,
      om: (_m, days) => `Guyyaa ${days} dura`,
    },
  },
];

/**
 * Helper to translate dynamic backend labels, statuses, warning titles, window titles, or text.
 * Falls back to the original text if no exact or pattern translation is available.
 */
export function translateDynamicText(text: string | null | undefined, language: Language): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Direct exact dictionary match (case insensitive check)
  for (const [key, map] of Object.entries(dynamicTranslations)) {
    if (key.toLowerCase() === trimmed.toLowerCase()) {
      return map[language] || trimmed;
    }
  }

  // 2. Regex pattern match for dynamic strings with dates/numbers
  for (const entry of dynamicPatterns) {
    const match = trimmed.match(entry.pattern);
    if (match) {
      const fn = entry.translate[language];
      if (fn) {
        return fn(match[0], ...match.slice(1));
      }
    }
  }

  return text;
}

/**
 * Format relative day strings into translated text.
 * E.g., days_until === 0 -> "Today" / "ዛሬ" / "Har'a"
 * days_until > 0 -> "In 5 days" / "በ 5 ቀን ውስጥ" / "Guyyaa 5 keessatti"
 * days_until < 0 -> "5 days overdue" / "በ 5 ቀን ዘግይቷል" / "Guyyaa 5n tureera"
 */
export function formatRelativeDays(daysUntil: number, language: Language): string {
  if (daysUntil === 0) {
    if (language === "am") return "ዛሬ";
    if (language === "om") return "Har'a";
    return "Today";
  }
  if (daysUntil > 0) {
    if (language === "am") return `በ ${daysUntil} ቀን ውስጥ`;
    if (language === "om") return `Guyyaa ${daysUntil} keessatti`;
    return `In ${daysUntil} days`;
  }
  const absDays = Math.abs(daysUntil);
  if (language === "am") return `በ ${absDays} ቀን ዘግይቷል`;
  if (language === "om") return `Guyyaa ${absDays}n tureera`;
  return `${absDays} days overdue`;
}
