/**
 * Mapping dictionary built from docs/RESEARCH.md.
 * Confidence is deliberately explicit because state labels differ by source.
 */
export interface StateCodeMapping {
  name: string;
  confidence: 'high' | 'medium';
  note?: string;
}

export const stateCodes: Record<string, StateCodeMapping> = {
  AP: { name: 'Andhra Pradesh / undivided Andhra Pradesh', confidence: 'medium', note: 'MCA revised the CIN state code for Telangana companies from AP to TG in June 2014; older AP records cannot be split by this two-letter code alone.' },
  AR: { name: 'Arunachal Pradesh', confidence: 'high' },
  AS: { name: 'Assam', confidence: 'high' },
  BR: { name: 'Bihar', confidence: 'high' },
  CG: { name: 'Chhattisgarh', confidence: 'medium', note: 'MCA state-abbreviation table; CT is also observed in CINs.' },
  CT: { name: 'Chhattisgarh', confidence: 'high', note: 'Observed in an official state power company CIN.' },
  GA: { name: 'Goa', confidence: 'high' },
  GJ: { name: 'Gujarat', confidence: 'high' },
  HR: { name: 'Haryana', confidence: 'high' },
  HP: { name: 'Himachal Pradesh', confidence: 'high' },
  JK: { name: 'Jammu and Kashmir', confidence: 'high' },
  JH: { name: 'Jharkhand', confidence: 'high' },
  KA: { name: 'Karnataka', confidence: 'high' },
  KL: { name: 'Kerala', confidence: 'high' },
  MP: { name: 'Madhya Pradesh', confidence: 'high' },
  MH: { name: 'Maharashtra', confidence: 'high' },
  MN: { name: 'Manipur', confidence: 'high' },
  ML: { name: 'Meghalaya', confidence: 'high' },
  MZ: { name: 'Mizoram', confidence: 'high' },
  NL: { name: 'Nagaland', confidence: 'high' },
  OD: { name: 'Odisha', confidence: 'medium', note: 'MCA state-abbreviation table; OR is also observed in a company disclosure CIN.' },
  OR: { name: 'Odisha', confidence: 'high', note: 'Observed in a company disclosure hosted by the Election Commission of India.' },
  PB: { name: 'Punjab', confidence: 'high' },
  RJ: { name: 'Rajasthan', confidence: 'high' },
  SK: { name: 'Sikkim', confidence: 'high' },
  TN: { name: 'Tamil Nadu', confidence: 'high' },
  TR: { name: 'Tripura', confidence: 'high' },
  UR: { name: 'Uttarakhand', confidence: 'high', note: 'MCA’s RoC Uttarakhand company list and a government-hosted Uttarakhand Power Corporation annual return publish UR in CINs. UK and UT are retained separately as observed administrative / CIN aliases.' },
  UK: { name: 'Uttarakhand', confidence: 'medium', note: 'MCA state-abbreviation table; UR and UT are also observed in company CIN records.' },
  UT: { name: 'Uttarakhand', confidence: 'medium', note: 'Observed in published company CIN records; alias history is not fully established.' },
  UP: { name: 'Uttar Pradesh', confidence: 'high' },
  WB: { name: 'West Bengal', confidence: 'high' },
  AN: { name: 'Andaman and Nicobar Islands', confidence: 'high' },
  CH: { name: 'Chandigarh', confidence: 'high' },
  DH: { name: 'Dadra and Nagar Haveli', confidence: 'medium', note: 'MCA general abbreviation table; do not infer merged-territory history.' },
  DD: { name: 'Daman and Diu', confidence: 'medium', note: 'MCA general abbreviation table; historical records may differ.' },
  DN: { name: 'Dadra and Nagar Haveli and Daman and Diu', confidence: 'high', note: 'Observed in Sanathan Textiles Limited’s CIN in an NSE-hosted disclosure dated 9 February 2026; NeSL also identifies DN as the merged Union Territory code.' },
  DL: { name: 'Delhi', confidence: 'high' },
  LD: { name: 'Lakshadweep', confidence: 'high' },
  PY: { name: 'Puducherry', confidence: 'medium', note: 'MCA later state-abbreviation table.' },
  LA: { name: 'Ladakh', confidence: 'medium', note: 'MCA later state-abbreviation table.' },
  TG: { name: 'Telangana', confidence: 'high', note: 'MCA explicitly revised Telangana CINs from AP to TG in June 2014.' },
  TS: { name: 'Telangana', confidence: 'medium', note: 'MCA general state-abbreviation table uses TS; CIN-specific source confirms TG.' },
};

export interface CompanyTypeMapping {
  label: string;
  confidence: 'high' | 'conflicting';
  note?: string;
}

export const companyTypeCodes: Record<string, CompanyTypeMapping> = {
  GOI: { label: 'Union Government company', confidence: 'high' },
  SGC: { label: 'State Government company', confidence: 'high' },
  PLC: { label: 'Public limited Indian non-government company', confidence: 'high' },
  PTC: { label: 'Private limited Indian non-government company', confidence: 'high' },
  FTC: { label: 'Private limited foreign company incorporated in India', confidence: 'high' },
  ULL: { label: 'Unlimited-liability public company', confidence: 'high' },
  ULT: { label: 'Unlimited-liability private company', confidence: 'high' },
  GAP: { label: 'Guarantee and Association public', confidence: 'high' },
  GAT: { label: 'Guarantee and Association private', confidence: 'high' },
  NPL: { label: 'Not-for-profit company (Section 8 / Section 25 context)', confidence: 'high', note: 'MoSPI uses Section 25 terminology for NPL. An Angel One Limited incorporation disclosure dated 22 October 2024 identifies Angel One Foundation as a Section 8 (not-for-profit) company and publishes CIN U85500MH2024NPL433965. A CIN code alone does not establish an individual company’s current statutory status; confirm that from its filings.' },
  OPC: { label: 'One Person Company', confidence: 'high' },
  FLC: { label: 'FLC — meaning disputed across government references', confidence: 'conflicting', note: 'MoSPI describes a public limited foreign company; FIU-IND describes a financial lease company as public limited.' },
};
