const fs = require('fs');

const files = ['en.ts', 'am.ts', 'om.ts'];

const additions = {
  calvingPage: {
    calvingDate: "Calving Date",
    damPregnancy: "Dam Pregnancy",
    newCalfHint: "New Calf Details",
    noCalvingsYet: "No calvings recorded yet.",
    noPregnanciesReadyHint: "No pregnancies ready for calving."
  },
  cattle: {
    form: {
      motherExternalId: "Mother External ID"
    }
  },
  common: {
    complete: "Complete",
    skip: "Skip"
  },
  feedPage: {
    cattleOptional: "Cattle (Optional)",
    costOptional: "Cost (Optional)",
    noFeedLogsHint: "No feed logs available.",
    wholeHerd: "Whole Herd"
  },
  health: {
    noTreatments: "No treatments recorded.",
    noVaccinations: "No vaccinations recorded.",
    records: "Health Records",
    treatments: "Treatments",
    vaccine: "Vaccine"
  },
  milk: {
    milkLogs: "Milk Logs"
  }
};

const amAdditions = {
  calvingPage: {
    calvingDate: "የመውለጃ ቀን",
    damPregnancy: "የእናት እርግዝና",
    newCalfHint: "የአዲሱ ጥጃ ዝርዝር",
    noCalvingsYet: "ምንም የተመዘገበ ውልደት የለም።",
    noPregnanciesReadyHint: "ለመውለድ የተዘጋጀ እርግዝና የለም።"
  },
  cattle: {
    form: {
      motherExternalId: "የእናት ውጫዊ መለያ"
    }
  },
  common: {
    complete: "አጠናቅ",
    skip: "ዝለል"
  },
  feedPage: {
    cattleOptional: "ከብት (አማራጭ)",
    costOptional: "ዋጋ (አማራጭ)",
    noFeedLogsHint: "ምንም የመኖ መዝገብ የለም።",
    wholeHerd: "ሙሉ መንጋ"
  },
  health: {
    noTreatments: "ምንም ሕክምና አልተመዘገበም።",
    noVaccinations: "ምንም ክትባት አልተመዘገበም።",
    records: "የጤና መዝገቦች",
    treatments: "ሕክምናዎች",
    vaccine: "ክትባት"
  },
  milk: {
    milkLogs: "የወተት መዝገቦች"
  }
};

const omAdditions = {
  calvingPage: {
    calvingDate: "Guyyaa Dhalootaa",
    damPregnancy: "Ulfa Haadhaa",
    newCalfHint: "Odeeffannoo Jabbii Haaraa",
    noCalvingsYet: "Dhalootni galmaa'e hin jiru.",
    noPregnanciesReadyHint: "Ulfni dhaluuf qophaa'e hin jiru."
  },
  cattle: {
    form: {
      motherExternalId: "ID Haadhaa Alaa"
    }
  },
  common: {
    complete: "Xumuri",
    skip: "Darbi"
  },
  feedPage: {
    cattleOptional: "Beeylada (Dirqama Miti)",
    costOptional: "Gatii (Dirqama Miti)",
    noFeedLogsHint: "Galmeen nyaataa hin jiru.",
    wholeHerd: "Hoolaa Guutuu"
  },
  health: {
    noTreatments: "Yaalii galmaa'e hin jiru.",
    noVaccinations: "Talaallii galmaa'e hin jiru.",
    records: "Galmee Fayyaa",
    treatments: "Yaaliiwwan",
    vaccine: "Talaallii"
  },
  milk: {
    milkLogs: "Galmee Aanaanii"
  }
};

function insertKeys(content, additionsObj) {
  let newContent = content;
  for (const [section, keys] of Object.entries(additionsObj)) {
    if (section === 'cattle') {
      const formKeys = Object.entries(keys.form).map(([k, v]) => `      ${k}: "${v}",`).join('\n');
      newContent = newContent.replace(/(\s+form:\s*\{)/, `$1\n${formKeys}`);
    } else {
      const kv = Object.entries(keys).map(([k, v]) => `    ${k}: "${v}",`).join('\n');
      // find section: {
      const regex = new RegExp(`(\\s+${section}:\\s*\\{)`);
      newContent = newContent.replace(regex, `$1\n${kv}`);
    }
  }
  return newContent;
}

const enPath = 'src/lib/i18n/locales/en.ts';
fs.writeFileSync(enPath, insertKeys(fs.readFileSync(enPath, 'utf8'), additions));

const amPath = 'src/lib/i18n/locales/am.ts';
fs.writeFileSync(amPath, insertKeys(fs.readFileSync(amPath, 'utf8'), amAdditions));

const omPath = 'src/lib/i18n/locales/om.ts';
fs.writeFileSync(omPath, insertKeys(fs.readFileSync(omPath, 'utf8'), omAdditions));

console.log("Done");
