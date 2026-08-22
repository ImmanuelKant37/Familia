import { Person, DuplicateMatch } from '../types';

function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1].toLowerCase() === str2[j - 1].toLowerCase() ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  return track[str2.length][str1.length];
}

function stringSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

function extractYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const match = dateStr.match(/\b(17|18|19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
}

export function detectDuplicates(people: Person[]): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (let i = 0; i < people.length; i++) {
    for (let j = i + 1; j < people.length; j++) {
      const a = people[i];
      const b = people[j];

      const nameSim = stringSimilarity(`${a.firstName} ${a.lastName}`, `${b.firstName} ${b.lastName}`);
      const firstNameSim = stringSimilarity(a.firstName, b.firstName);
      const lastNameSim = stringSimilarity(a.lastName, b.lastName);

      let score = 0;
      const reasons: string[] = [];

      // Name evaluation
      if (nameSim >= 0.85) {
        score += 45;
        reasons.push(`Nombres y apellidos muy similares ("${a.firstName} ${a.lastName}" vs "${b.firstName} ${b.lastName}")`);
      } else if (lastNameSim >= 0.9 && firstNameSim >= 0.7) {
        score += 35;
        reasons.push(`Mismo apellido ("${a.lastName}") y nombre coincidente ("${a.firstName}" vs "${b.firstName}")`);
      } else if (a.aliases && a.aliases.some(alias => b.firstName.toLowerCase().includes(alias.toLowerCase()))) {
        score += 20;
        reasons.push(`Alias coincidente con nombre`);
      }

      // Birth year evaluation
      const yearA = extractYear(a.birthDate || a.birthDateApprox);
      const yearB = extractYear(b.birthDate || b.birthDateApprox);
      if (yearA && yearB) {
        const diff = Math.abs(yearA - yearB);
        if (diff === 0) {
          score += 30;
          reasons.push(`Mismo año de nacimiento (${yearA})`);
        } else if (diff <= 2) {
          score += 20;
          reasons.push(`Años de nacimiento cercanos (${yearA} vs ${yearB})`);
        }
      }

      // Birth place evaluation
      if (a.birthPlace && b.birthPlace) {
        const placeSim = stringSimilarity(a.birthPlace, b.birthPlace);
        if (placeSim > 0.7) {
          score += 15;
          reasons.push(`Lugar de nacimiento coincidente ("${a.birthPlace}")`);
        }
      }

      // Death year/place
      const deathYearA = extractYear(a.deathDate || a.deathDateApprox);
      const deathYearB = extractYear(b.deathDate || b.deathDateApprox);
      if (deathYearA && deathYearB && Math.abs(deathYearA - deathYearB) <= 2) {
        score += 15;
        reasons.push(`Año de defunción coincidente o cercano (${deathYearA} vs ${deathYearB})`);
      }

      if (score >= 50) {
        matches.push({
          personA: a,
          personB: b,
          similarityScore: Math.min(100, score),
          reasons
        });
      }
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
