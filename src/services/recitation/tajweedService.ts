/**
 * Tajweed Service
 *
 * Provides tajweed rules, color-coding, and analysis for Quranic text.
 */

export type TajweedRule =
  | 'idgham'
  | 'ikhfa'
  | 'iqlab'
  | 'izhar'
  | 'ghunnah'
  | 'madd'
  | 'qalqalah'
  | 'waqf'
  | 'ibtida'
  | 'makharij'
  | 'sifat';

export interface TajweedRuleInfo {
  id: TajweedRule;
  name: string;
  arabicName: string;
  description: string;
  color: string;
  examples: string[];
  explanation: string;
}

/**
 * Tajweed rules with color coding
 */
export const TAJWEED_RULES: Record<TajweedRule, TajweedRuleInfo> = {
  idgham: {
    id: 'idgham',
    name: 'Idgham (Merging)',
    arabicName: 'إدغام',
    description: 'Merging of noon saakinah or tanween into the following letter',
    color: '#FF6B9D', // Rose
    examples: ['من رب', 'أن لا'],
    explanation:
      'When noon saakinah or tanween is followed by certain letters (ر، ل، م، ن، و، ي), the noon sound merges into the following letter.',
  },
  ikhfa: {
    id: 'ikhfa',
    name: 'Ikhfa (Hiding)',
    arabicName: 'إخفاء',
    description: 'Hiding the noon saakinah or tanween sound',
    color: '#A78BFA', // Purple
    examples: ['من ذا', 'أن صدقوا'],
    explanation:
      'When noon saakinah or tanween is followed by certain letters, the noon sound is hidden (not fully pronounced).',
  },
  iqlab: {
    id: 'iqlab',
    name: 'Iqlab (Conversion)',
    arabicName: 'إقلاب',
    description: 'Converting noon saakinah or tanween to meem',
    color: '#60A5FA', // Blue
    examples: ['من بعد', 'أنبئهم'],
    explanation:
      'When noon saakinah or tanween is followed by ب, it is converted to meem sound.',
  },
  izhar: {
    id: 'izhar',
    name: 'Izhar (Clarity)',
    arabicName: 'إظهار',
    description: 'Clear pronunciation of noon saakinah or tanween',
    color: '#3DD9C5', // Turquoise
    examples: ['من حكيم', 'أنعمت'],
    explanation:
      'When noon saakinah or tanween is followed by certain letters (ء، ه، ع، ح، غ، خ), it is pronounced clearly.',
  },
  ghunnah: {
    id: 'ghunnah',
    name: 'Ghunnah (Nasalization)',
    arabicName: 'غنة',
    description: 'Nasal sound on noon and meem',
    color: '#FFB84D', // Gold
    examples: ['من', 'مم'],
    explanation:
      'A nasal sound produced when pronouncing noon (ن) or meem (م) with shaddah or when in idgham.',
  },
  madd: {
    id: 'madd',
    name: 'Madd (Elongation)',
    arabicName: 'مد',
    description: 'Elongation of vowels',
    color: '#4CAF50', // Green
    examples: ['آمن', 'يؤمن'],
    explanation:
      'Elongation of vowels for specific durations (2, 4, or 6 counts) depending on the type of madd.',
  },
  qalqalah: {
    id: 'qalqalah',
    name: 'Qalqalah (Echo)',
    arabicName: 'قلقلة',
    description: 'Echoing sound on certain letters',
    color: '#FF9800', // Orange
    examples: ['قطب جد', 'بخ'],
    explanation:
      'An echoing sound produced when pronouncing ق، ط، ب، ج، د when they have sukoon (no vowel).',
  },
  waqf: {
    id: 'waqf',
    name: 'Waqf (Stopping)',
    arabicName: 'وقف',
    description: 'Proper stopping points in recitation',
    color: '#9C27B0', // Purple
    examples: ['مُسْتَقِيمٌ', 'الْحَمْدُ'],
    explanation:
      'Designated stopping points where it is permissible or recommended to pause during recitation.',
  },
  ibtida: {
    id: 'ibtida',
    name: 'Ibtida (Starting)',
    arabicName: 'ابتداء',
    description: 'Proper starting points in recitation',
    color: '#00BCD4', // Cyan
    examples: ['بِسْمِ', 'الْحَمْدُ'],
    explanation:
      'Proper points to begin recitation, ensuring correct pronunciation and meaning.',
  },
  makharij: {
    id: 'makharij',
    name: 'Makharij al-Huruf (Articulation Points)',
    arabicName: 'مخارج الحروف',
    description: 'Correct articulation points for each letter',
    color: '#E91E63', // Pink
    examples: ['ب', 'ت', 'ث'],
    explanation:
      'The specific points in the mouth, throat, or nasal cavity where each Arabic letter is articulated.',
  },
  sifat: {
    id: 'sifat',
    name: 'Sifat al-Huruf (Letter Characteristics)',
    arabicName: 'صفات الحروف',
    description: 'Characteristics of letters (heavy/light, voiced/unvoiced)',
    color: '#795548', // Brown
    examples: ['ط', 'ت', 'ض', 'د'],
    explanation:
      'The inherent characteristics of letters such as being heavy (تفخيم) or light (ترقيق), voiced or unvoiced.',
  },
};

/**
 * Get tajweed rule by ID
 */
export function getTajweedRule(ruleId: TajweedRule): TajweedRuleInfo {
  return TAJWEED_RULES[ruleId];
}

/**
 * Get all tajweed rules
 */
export function getAllTajweedRules(): TajweedRuleInfo[] {
  return Object.values(TAJWEED_RULES);
}

/**
 * Analyze text for tajweed rules
 * This is a simplified version - in production, use a proper tajweed analysis library
 */
export function analyzeTajweed(text: string): Array<{
  start: number;
  end: number;
  rule: TajweedRule;
  text: string;
}> {
  const rules: Array<{
    start: number;
    end: number;
    rule: TajweedRule;
    text: string;
  }> = [];

  // Simplified pattern matching for common tajweed rules
  // In production, this would use a proper tajweed analysis engine

  // Check for idgham patterns (noon saakinah + ر، ل، م، ن، و، ي)
  const idghamPattern = /ن\s+[رلمنوي]/g;
  let match;
  while ((match = idghamPattern.exec(text)) !== null) {
    rules.push({
      start: match.index,
      end: match.index + match[0].length,
      rule: 'idgham',
      text: match[0],
    });
  }

  // Check for qalqalah (ق، ط، ب، ج، د with sukoon)
  const qalqalahPattern = /[قطبجد]ْ/g;
  while ((match = qalqalahPattern.exec(text)) !== null) {
    rules.push({
      start: match.index,
      end: match.index + match[0].length,
      rule: 'qalqalah',
      text: match[0],
    });
  }

  // Check for madd (elongation marks)
  const maddPattern = /[آأإا]|ى|و/g;
  while ((match = maddPattern.exec(text)) !== null) {
    // This is simplified - proper madd detection requires context
    rules.push({
      start: match.index,
      end: match.index + match[0].length,
      rule: 'madd',
      text: match[0],
    });
  }

  return rules;
}

/**
 * Get color for tajweed rule
 */
export function getTajweedColor(rule: TajweedRule): string {
  return TAJWEED_RULES[rule].color;
}

/**
 * Format text with tajweed color coding
 */
export function formatTextWithTajweed(
  text: string,
  tajweedAnalysis: Array<{
    start: number;
    end: number;
    rule: TajweedRule;
    text: string;
  }>,
): Array<{
  text: string;
  rule?: TajweedRule;
  color?: string;
}> {
  const segments: Array<{
    text: string;
    rule?: TajweedRule;
    color?: string;
  }> = [];

  let lastIndex = 0;

  // Sort rules by start position
  const sortedRules = [...tajweedAnalysis].sort((a, b) => a.start - b.start);

  for (const rule of sortedRules) {
    // Add text before this rule
    if (rule.start > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, rule.start),
      });
    }

    // Add the rule segment
    segments.push({
      text: rule.text,
      rule: rule.rule,
      color: getTajweedColor(rule.rule),
    });

    lastIndex = rule.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
    });
  }

  return segments;
}

