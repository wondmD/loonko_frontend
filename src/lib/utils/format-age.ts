/**
 * Formats cattle age in a human-friendly format (e.g. "1 year and 2 months old", "3 years old", "8 months old", "15 days old").
 */

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
}

export function calculateAgeBreakdown(
  dateOfBirth?: string | Date | null,
  ageDays?: number | null,
): AgeBreakdown | null {
  if (dateOfBirth) {
    const birth = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
    if (!isNaN(birth.getTime())) {
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months -= 1;
        // Previous month's day count
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years >= 0) {
        return { years, months, days };
      }
    }
  }

  if (ageDays != null && ageDays >= 0) {
    return calculateAgeBreakdownFromDays(ageDays);
  }

  return null;
}

export function calculateAgeBreakdownFromDays(ageDays: number): AgeBreakdown {
  const years = Math.floor(ageDays / 365.25);
  const remainingAfterYears = ageDays - Math.floor(years * 365.25);
  const months = Math.floor(remainingAfterYears / 30.4375);
  const days = Math.floor(remainingAfterYears - Math.floor(months * 30.4375));
  return { years, months, days };
}

export function formatAge(
  dateOfBirth?: string | Date | null,
  ageDays?: number | null,
  language: string = "en",
): string {
  const breakdown = calculateAgeBreakdown(dateOfBirth, ageDays);
  if (!breakdown) return "—";

  const { years, months, days } = breakdown;

  if (language === "am") {
    if (years >= 1) {
      if (months > 0) {
        return `${years} ዓመት ከ ${months} ወር`;
      }
      return `${years} ዓመት`;
    }
    if (months >= 1) {
      return `${months} ወር`;
    }
    if (days > 0) {
      return `${days} ቀን`;
    }
    return "ዛሬ የተወለደ";
  }

  if (language === "om") {
    if (years >= 1) {
      if (months > 0) {
        return `Waggaa ${years} fi ji'a ${months}`;
      }
      return `Waggaa ${years}`;
    }
    if (months >= 1) {
      return `Ji'a ${months}`;
    }
    if (days > 0) {
      return `Guyyaa ${days}`;
    }
    return "Har'a kan dhalate";
  }

  // English default
  if (years >= 1) {
    const yrStr = years === 1 ? "1 year" : `${years} years`;
    if (months > 0) {
      const moStr = months === 1 ? "1 month" : `${months} months`;
      return `${yrStr} and ${moStr} old`;
    }
    return `${yrStr} old`;
  }

  if (months >= 1) {
    const moStr = months === 1 ? "1 month" : `${months} months`;
    return `${moStr} old`;
  }

  if (days > 0) {
    return days === 1 ? "1 day old" : `${days} days old`;
  }

  return "Born today";
}

export function formatAgeShort(
  dateOfBirth?: string | Date | null,
  ageDays?: number | null,
): string {
  const breakdown = calculateAgeBreakdown(dateOfBirth, ageDays);
  if (!breakdown) return "—";
  const { years, months, days } = breakdown;
  if (years >= 1) {
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  }
  if (months >= 1) {
    return `${months}m`;
  }
  return `${days}d`;
}
