# CIN & LLPIN Format Research (P1)

**Research checked:** 25 November 2026
**Purpose:** document the evidence used by the browser-only format checker. This is not legal advice and not an MCA existence check.

## 1. CIN structure

The Government of India's Ministry of Statistics and Programme Implementation (MoSPI), in its Annual Survey of Industries 2017–18 instructions, describes a 21-character alphanumeric CIN as six segments:

| Segment | Positions | Expected characters | Meaning |
|---|---:|---|---|
| Listing marker | 1 | `L` or `U` | Listed / unlisted |
| Industry / activity code | 2–6 | 5 digits | Industry code (the MoSPI document references NIC-2004) |
| State / territory segment | 7–8 | 2 letters | State / territory identifier |
| Incorporation year | 9–12 | 4 digits | Calendar year of incorporation |
| Ownership / company-type code | 13–15 | 3 letters | Company classification code |
| ROC registration number | 16–21 | 6 digits | Registration number |

Sources: MoSPI ASI 2017–18 instructions, section 9.3, pages 2–3; Financial Intelligence Unit–India (FIU-IND), FINGate 2.0 User Manual, version 1.4, page 70; MCA materials also use the same six-part layout. The RBI publication is retained as secondary background, not as the only evidence.

**Implementation consequence:** the parser checks segment shapes and decodes only fields for which a supported mapping is available. The five-digit industry code is displayed as a code; this project does not attempt to decode NIC classifications.

## 2. Listing marker

- `L` = listed.
- `U` = unlisted.

The MoSPI ASI instructions and FIU-IND manual both explicitly describe this distinction. This is a decoded CIN field, not a real-time stock-exchange check.

## 3. State / territory mapping: keep the evidence layers separate

There is no safe basis for treating every two-letter state abbreviation in a general state table as an exhaustive list of CIN codes.

### MCA's published state-abbreviation table

MCA's June 2024 Monthly Information Bulletin, Table 13, lists these abbreviations: `AP, AR, AS, BR, CG, GA, GJ, HR, HP, JK, JH, KA, KL, MP, MH, MN, ML, MZ, NL, OD, PB, RJ, SK, TN, TR, UK, UP, WB, AN, CH, DH, DD, DL, LD, TS`.

A later MCA monthly bulletin's Table 14 also lists `PY` (Puducherry) and `LA` (Ladakh). These are useful current administrative/state labels, but the sources do not say that every value in those tables is necessarily the value encoded in every historical CIN. In this checker, medium-confidence administrative aliases are accepted with a visible review note rather than presented as conclusively verified CIN-specific mappings.

### CIN-specific / company-document evidence

- **Telangana:** MCA's June 2014 newsletter explicitly says MCA revised the state code *in the CIN* for companies located in Telangana from `AP` to `TG` after Telangana was formed on 2 June 2014. Therefore `TG` is a confirmed CIN code. Older `AP`-coded records are labelled “Andhra Pradesh / undivided Andhra Pradesh” and shown with a review note because the two-letter code alone cannot reliably split pre-revision entities. General MCA state-abbreviation tables use `TS`; the project records `TS` as an administrative alias/reference-table value, not as a proven replacement for the CIN-specific `TG` value.
- **Chhattisgarh:** Chhattisgarh State Power Distribution Company Limited's own government-controlled website publishes its CIN as `U40108CT2003SGC015822` (the site also spaces the segments in one display). This is direct evidence for `CT` in a CIN. MCA's general abbreviation table uses `CG`; we accept both, while retaining the distinction in the notes.
- **Odisha:** an official Orient Cement disclosure hosted by the Election Commission of India displays `L26940OR2011PLC013933`. MCA's general abbreviation table uses `OD`. Both `OR` and `OD` are therefore accepted as observed forms, with `OR` explicitly supported by a CIN printed on a company disclosure.
- **Uttarakhand:** `UR` is directly evidenced in CINs: MCA's RoC Uttarakhand company list contains numerous `UR` CINs, and a government-hosted Uttarakhand Power Corporation financial-statement filing publishes `U40109UR2001SGC025867`. The general MCA state-abbreviation table uses `UK`; company-record examples also show `UT`. The checker therefore maps `UR` to Uttarakhand with high confidence, while retaining `UK` and `UT` as separate medium-confidence values. It does not rewrite one abbreviation into another or claim that their historical use is interchangeable.
- **Dadra & Nagar Haveli / Daman & Diu:** the MCA general abbreviation table lists historical `DH` and `DD` values separately. The merged Union Territory was formed under the Dadra and Nagar Haveli and Daman and Diu (Merger of Union Territories) Act, 2019. A NeSL communiqué dated 29 July 2025 identifies `DN` as the merged Union Territory code for digital e-stamping, and, more directly for this checker, an NSE-hosted Sanathan Textiles disclosure dated 9 February 2026 publishes the company's CIN as `L17299DN2005PLC005690`. Accordingly, `DN` is accepted as a high-confidence observed CIN code for the merged territory; `DH` and `DD` remain medium-confidence historical/admin abbreviations and are not silently rewritten.

### Conservative behaviour

A two-letter segment that has the correct character shape but is absent from the dictionary is reported as **unmapped / needs review**, not automatically as proof that the whole identifier is malformed. That avoids a false invalid result when historical data, office abbreviations, or registry conventions differ.

## 4. Company-type / ownership codes

The MoSPI ASI 2023–24 Instruction Manual (page 21) confirms the CIN segments and the following core company-type codes. The older MoSPI ASI 2017–18 instructions and Maharashtra's ASI 2024–25 manual provide corroborating material for legacy classifications:

| Code | Meaning supported by the government reference | Confidence / product handling |
|---|---|---|
| `GOI` | Union Government company | Confident |
| `SGC` | State Government company | Confident |
| `PLC` | Public limited Indian non-government company | Confident |
| `PTC` | Private limited Indian non-government company | Confident |
| `FTC` | Private limited foreign company incorporated in India | Confident |
| `ULL` | Unlimited-liability public company | Confident |
| `ULT` | Unlimited-liability private company | Confident |
| `GAP` | Guarantee & Association public | Supported by MoSPI and Maharashtra ASI manual |
| `GAT` | Guarantee & Association private | Supported by MoSPI and Maharashtra ASI manual |
| `NPL` | Not-for-profit company code; both Section 25 (Companies Act, 1956) and Section 8 (Companies Act, 2013) context is relevant | The MoSPI manual uses Section 25 terminology. An Angel One Limited exchange filing dated 22 October 2024 identifies Angel One Foundation as a Section 8 (not-for-profit) company and publishes CIN `U85500MH2024NPL433965`. The CIN code alone does not establish the current statutory status of every company using NPL; check its filings. |
| `FLC` | MoSPI says “public limited foreign company incorporated in India”; FIU-IND says “Financial Lease Company as Public Limited” | **Conflicting government references; do not choose one meaning. Show code + review warning.** |
| `OPC` | One Person Company | Confirmed by CAG audit annexures that list CINs containing `OPC` and mark the class “Private (One Person Company)”; also shown in a Government of India NSWS example CIN |

**Important:** `PLC` / `PTC` do not by themselves determine listing status. The first `L` / `U` character does that. `OPC` is included because it appears in real CINs and government-published records, despite not appearing in the older MoSPI ownership-code table.

## 5. LLPIN structure and limits of decoding

Evidence:

- The Government of India's National Single Window System user guide shows an LLPIN example `AAB-4321`.
- MCA's official LLP Form 3 FAQ uses `AAA-1111` as an LLPIN example.
- MCA's official 2009 LLP list and an official 2024 Gazette notice publish many records in the same `AAA-1234` display format.
- FIU-IND's 2022 manual describes an LLPIN as a seven-character alphanumeric identifier (the document says “7 digit Alphanumeric”; its example convention includes a display hyphen).

The checker therefore recognises three letters followed by four digits, displayed with an optional hyphen between them. If the hyphen is omitted, the UI inserts it for readability and marks the input as normalised. It does not claim that a no-hyphen representation is a separately allotted identifier.

The researched sources do not establish a reliable state, year, listing-status, or company-type decoding scheme from the LLPIN segments. For those fields, the product says **“Not encoded in LLPIN (not decoded by this format checker)”**. It does not guess what the first three letters mean. In particular, an unverified third-party claim that the first three letters identify a particular ROC is not adopted as a product rule.

## 6. Year plausibility

The Supreme Court of India has described Act XLIII of 1850 as the earliest Indian legislation regulating registered joint-stock companies. Therefore a CIN year earlier than 1850 is flagged as implausible. This is a plausibility guard, not a claim that all companies incorporated since 1850 necessarily received a CIN in that year.

A year greater than the current calendar year is an invalid future year for this checker. The current year is injected into the pure validator so tests remain deterministic.

## 7. Format validity is not existence verification

A CIN / LLPIN can match the expected character structure and still be mistyped, unallotted, cancelled, or associated with a non-active entity. The application performs no live MCA lookup and makes no claim about company existence, status, authenticity, directors, filings, or financials.

MCA's Company Master Data service and the Open Government Data platform are separate sources for master-record lookups. This project does not call them.

## 8. Normalisation policy

The implemented presentation normalisation and batch-paste behaviour:

- trim leading / trailing whitespace;
- uppercase letters;
- remove harmless whitespace around a pasted identifier; in tab-delimited spreadsheet rows, skip recognisable spreadsheet header rows, retain identifier-like cells, and note skipped company-name / description cells;
- remove one trailing comma or surrounding quote marks;
- ignore blank lines rather than count them as invalid entries;
- accept the optional LLPIN display hyphen and add it for presentation;
- strip zero-width and non-breaking spaces when they occur as pasted formatting characters;
- detect more than one CIN / LLPIN candidate on a single line and ask the user to put one identifier on each line.

Do **not** delete arbitrary punctuation or arbitrary interior characters. If removal could turn a malformed value into a different identifier, report the problem instead.

## 9. Research references

1. **MoSPI, Annual Survey of Industries 2023–24 — Instruction Manual**, section 3.3.3, page 21 (CIN segment layout and GOI / SGC / PLC / PTC / FLC / FTC / ULL / ULT / GAP / GAT / NPL code meanings): https://mospi.gov.in/sites/default/files/asi_results/Instruction-Manual-2023-24.pdf
2. **MoSPI, Annual Survey of Industries 2017–18 — Instructions for filling Part I of ASI return**, section 9.3, pages 2–3 (corroborating CIN structure and legacy company-type codes): https://mospi.gov.in/sites/default/files/publication_reports/Instruction.pdf
3. **FIU-IND, FINGate 2.0 User Manual — Reports, version 1.4**, pages 70–71 (CIN structure, conflicting `FLC` explanation, LLPIN length): https://fiuindia.gov.in/pdfs/quicklinks/User_Manual_Reports_FINGate_Portal.pdf
4. **MCA, Monthly Newsletter, June 2014**, note on Telangana CIN revision from `AP` to `TG`: https://www.mca.gov.in/Ministry/pdf/Monthly_Newsletter_June_2014.pdf
5. **MCA, Monthly Information Bulletin, June 2024**, Table 13, State Abbreviations (includes `OD`, `UK`, `TS`, `CG`, etc.): https://www.mca.gov.in/bin/dms/getdocument?mds=ufb472J7Xw4%252BNuStNOdCTQ%253D%253D&type=open
6. **MCA, Monthly Information Bulletin, June 2024 / later bulletin**, Table 14 state abbreviations including Puducherry and Ladakh: https://www.mca.gov.in/bin/dms/getdocument?mds=bET%252F2TaeKGL%252BcFb%252FaHrrXg%253D%253D&type=open
7. **Chhattisgarh State Power Distribution Company Limited**, official company profile displaying CIN `U40108CT2003SGC015822`: https://www.cspdcl.co.in/CSEB/frmCompanyProfile.aspx
8. **Orient Cement Limited disclosure hosted by the Election Commission of India**, displaying CIN `L26940OR2011PLC013933`: https://www.eci.gov.in/eci-backend/public/pdf/report/December/1766120456.pdf
9. **MCA, List of Companies (Provisional) as on 31.03.2022**, source list for sourced CIN test fixtures: https://cdnbbsr.s3waas.gov.in/s3e2ad76f2326fbc6b56a45a56c59fafdb/uploads/2025/02/20250214996699680.pdf
10. **CAG, Report No. 16 of 2021**, Annexure XXII, examples of OPC CINs and the `Private (One Person Company)` class: https://cag.gov.in/webroot/uploads/download_audit_report/2021/13_Annexures-061c1b9cd751e70.53281461.pdf
11. **NCLT, Mumbai Bench, C.A.(CAA)/57/MB/2023**, Reliance Industries CIN `L17110MH1973PLC019786`: https://nclt.gov.in/gen_pdf.php?filepath=%2FEfile_Document%2Fncltdoc%2Fcasedoc%2F2709138028662023%2F04%2FOrder-Challenge%2F04_order-Challange_004_167991713818156462246421805272f75.pdf
12. **Government of India, National Single Window System — Common Registration Form user guide**, LLPIN example `AAB-4321`: https://www.nsws.gov.in/s3fs/2022-05/Fill%20Common%20Registration%20Form.pdf
13. **MCA, LLP Form 3 FAQs**, LLPIN example `AAA-1111`: https://www.mca.gov.in/content/dam/mca/pdf/Revised-Filing-Steps-and-FAQs-of-Form-3-LLP-20230607.pdf
14. **MCA, List of LLPs registered during 2009**, LLPIN examples and names: https://www.mca.gov.in/Ministry/pdf/List%20of%20LLPs-2009.pdf
15. **The Gazette of India, 26 October 2024**, LLPIN examples in official notice list: https://egazette.gov.in/WriteReadData/2024/258255.pdf
16. **Supreme Court of India judgment, 26 March 2021**, discussion of Act XLIII of 1850 as earliest legislation regulating registered joint-stock companies: https://api.sci.gov.in/supremecourt/2020/212/212_2020_31_1503_27229_Judgement_26-Mar-2021.pdf
17. **MCA Company Master Data portal**, official live service (not called by this project): https://www.mcacdm.nic.in/company-master-details
18. **NeSL, Communiqué to DDE Users #207, 29 July 2025**, expressly identifies `DN` as the State Code for the merged Union Territory of Dadra and Nagar Haveli and Daman and Diu (digital e-stamping context): https://nesl.co.in/wp-content/uploads/2025/07/Communique-207-Article-updation-for-the-Union-Territory-of-Dadra-and-Nagar-Haveli-and-Daman-and-Diu.pdf
19. **Sanathan Textiles Limited, NSE-hosted disclosure dated 9 February 2026**, publishes the CIN `L17299DN2005PLC005690`, direct company-document evidence for `DN` in a CIN: https://nsearchives.nseindia.com/corporate/SANATHAN_09022026204344_STL_Earnings_call_audio_recording.pdf
20. **The Dadra and Nagar Haveli and Daman and Diu (Merger of Union Territories) Act, 2019**, legal background for the merged territory: https://www.indiacode.nic.in/indiacode/handle/123456789/13079?view_type=browse
21. **MCA, List of Companies registered with RoC Uttarakhand**, publishes multiple CINs containing the `UR` state segment: https://www.mca.gov.in/Ministry/pdf/RocUttarakhandFinal_30082018.pdf
22. **Uttarakhand Power Corporation Limited, financial statements for the year ended 31 March 2024**, government-hosted filing publishing CIN `U40109UR2001SGC025867`: https://cdnbbsr.s3waas.gov.in/s303412aef4dcdee4f934f7bf599f89783/uploads/2025/05/20250516312176690.pdf
23. **Angel One Limited, exchange intimation dated 22 October 2024**, identifies Angel One Foundation as a Section 8 (not-for-profit) company and publishes CIN `U85500MH2024NPL433965`: https://www.angelone.in/wp-content/uploads/pdfs/IncorporationSection8Company_Intimation.pdf
24. **W3C, Web Content Accessibility Guidelines 2.2**, Success Criterion 1.4.3: text contrast ratio minimum of 4.5:1 for normal text: https://www.w3.org/TR/WCAG22/#contrast-minimum

## 10. Known limitations / open items

- We have a sourced test set, not a complete MCA master-data export.
- The checker cannot tell whether a six-digit ROC registration number is currently allotted or active.
- State abbreviations in CINs have historical and administrative ambiguities. The app must make the mapping's confidence visible and must not silently reject a correctly shaped CIN for an unmapped two-letter code.
- `FLC` remains deliberately unresolved because MoSPI and FIU-IND government publications give different expansions; the checker shows the conflict instead of selecting one.
- No industry/NIC interpretation is attempted.
