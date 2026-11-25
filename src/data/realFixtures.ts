/**
 * Real-world identifier examples collected from public government / regulator
 * publications. These are parser fixtures only, not live status verification.
 * Source URLs are stored per fixture so the provenance is visible in review.
 */

export interface CinFixture {
  identifier: string;
  name: string;
  source: string;
  note?: string;
}

const provisionalCompanyList =
  'https://cdnbbsr.s3waas.gov.in/s3e2ad76f2326fbc6b56a45a56c59fafdb/uploads/2025/02/20250214996699680.pdf';

export const realCinFixtures: CinFixture[] = [
  { identifier: 'L99999GJ1987PLC009768', name: '20 Microns Limited', source: provisionalCompanyList },
  { identifier: 'L74140MH2008PLC177884', name: '360 ONE WAM Limited', source: provisionalCompanyList },
  { identifier: 'L67120MH1993PLC074411', name: '3i Infotech Limited', source: provisionalCompanyList },
  { identifier: 'L31300KA1987PLC013543', name: '3M India Limited', source: provisionalCompanyList },
  { identifier: 'L74999MH1999PLC013394', name: '3P Land Holdings Limited', source: provisionalCompanyList },
  { identifier: 'L74900MH2012PLC230802', name: '3rd Rock Multimedia Limited', source: provisionalCompanyList },
  { identifier: 'L67190MH2007PLC289249', name: '5paisa Capital Limited', source: provisionalCompanyList },
  { identifier: 'L29142TN1988PLC015586', name: '63 Moons Technologies Limited', source: provisionalCompanyList },
  { identifier: 'L52320GJ2012PLC073076', name: '7NR Retail Limited', source: provisionalCompanyList },
  { identifier: 'L72900TG1991PLC013074', name: '7SEAS Entertainment Limited', source: provisionalCompanyList, note: 'Published example of the TG CIN state segment.' },
  { identifier: 'L28113GJ2013PLC075662', name: 'A & M Febcon Limited', source: provisionalCompanyList },
  { identifier: 'L25202GJ2011PLC065632', name: 'A and M Jumbo Bags Limited', source: provisionalCompanyList },
  { identifier: 'L17111PB1997PLC020118', name: 'A B Cotspin India Limited', source: provisionalCompanyList },
  { identifier: 'L45202MH2011PLC214834', name: 'A B Infrabuild Limited', source: provisionalCompanyList },
  { identifier: 'L55101DL2005PLC140406', name: 'A B N Intercorp Limited', source: provisionalCompanyList },
  { identifier: 'L85110DL1984PLC018486', name: 'A.D.S. Diagnostics Limited', source: provisionalCompanyList },
  { identifier: 'L18100DL1983PLC016354', name: 'A.F. Enterprises Limited', source: provisionalCompanyList },
  { identifier: 'U51900MH2006PLC214277', name: 'A.K. Capital Finance Limited', source: provisionalCompanyList, note: 'U prefix with PLC code; illustrates unlisted public company format.' },
  { identifier: 'L17117RJ1994PLC008916', name: 'A.K. Spintex Limited', source: provisionalCompanyList },
  { identifier: 'L24119GJ2004PLC044011', name: 'A-1 Acid Limited', source: provisionalCompanyList },
  { identifier: 'L74999HR2002PLC034805', name: 'A2Z Infra Engineering Limited', source: provisionalCompanyList },
  { identifier: 'L72100MH2000PLC128949', name: 'Aaa Technologies Limited', source: provisionalCompanyList },
  { identifier: 'L25203MH1994PLC206053', name: 'Aadi Industries Limited', source: provisionalCompanyList },
  { identifier: 'L23209GJ2007PLC049792', name: 'Aakash Exploration Services Limited', source: provisionalCompanyList },
  { identifier: 'L17121TG2013PLC086564', name: 'Aananda Lakshmi Spinning Mills Limited', source: provisionalCompanyList, note: 'Published example of the TG CIN state segment.' },
  { identifier: 'L27106WB1996PLC076866', name: 'Aanchal Ispat Limited', source: provisionalCompanyList },
  { identifier: 'L63090DL1982PLC354818', name: 'AAR Commercial Company Limited', source: provisionalCompanyList },
  { identifier: 'L24110GJ1984PLC007301', name: 'Aarti Industries Limited', source: provisionalCompanyList },
  { identifier: 'L24100GJ2018PLC102891', name: 'Aarti Surfactants Limited', source: provisionalCompanyList },
  { identifier: 'L17110MH1973PLC019786', name: 'Reliance Industries Limited', source: 'https://nclt.gov.in/gen_pdf.php?filepath=%2FEfile_Document%2Fncltdoc%2Fcasedoc%2F2709138028662023%2F04%2FOrder-Challenge%2F04_order-Challange_004_167991713818156462246421805272f75.pdf' },
  { identifier: 'U74140DL2015OPC284935', name: 'TPAREX Technical Services OPC Private', source: 'https://cag.gov.in/webroot/uploads/download_audit_report/2021/13_Annexures-061c1b9cd751e70.53281461.pdf', note: 'CAG annexure: Private (One Person Company).' },
  { identifier: 'U74999KA2016OPC096171', name: 'PACKROOT Product Packaging Branding', source: 'https://cag.gov.in/webroot/uploads/download_audit_report/2021/13_Annexures-061c1b9cd751e70.53281461.pdf', note: 'CAG annexure: Private (One Person Company).' },
  { identifier: 'U72900KA2016OPC096308', name: 'Steernet Technologies (OPC) Private', source: 'https://cag.gov.in/webroot/uploads/download_audit_report/2021/13_Annexures-061c1b9cd751e70.53281461.pdf', note: 'CAG annexure: Private (One Person Company).' },
  { identifier: 'U72900TN2016OPC112987', name: 'Dodgeplay (OPC) Private Limited', source: 'https://cag.gov.in/webroot/uploads/download_audit_report/2021/13_Annexures-061c1b9cd751e70.53281461.pdf', note: 'CAG annexure: Private (One Person Company).' },
  { identifier: 'U40108CT2003SGC015822', name: 'Chhattisgarh State Power Distribution Company Limited', source: 'https://www.cspdcl.co.in/CSEB/frmCompanyProfile.aspx', note: "Company official government-controlled profile; confirms CT and SGC segments." },
  { identifier: 'U40109UR2001SGC025867', name: 'Uttarakhand Power Corporation Limited', source: 'https://cdnbbsr.s3waas.gov.in/s303412aef4dcdee4f934f7bf599f89783/uploads/2025/05/20250516312176690.pdf', note: 'Government-hosted 2024 financial statements publish this CIN; confirms UR as an Uttarakhand CIN state segment.' },
  { identifier: 'U85500MH2024NPL433965', name: 'Angel One Foundation', source: 'https://www.angelone.in/wp-content/uploads/pdfs/IncorporationSection8Company_Intimation.pdf', note: 'Angel One Limited’s 22 October 2024 exchange intimation identifies this as a Section 8 (not-for-profit) company and publishes its NPL CIN.' },
  { identifier: 'L26940OR2011PLC013933', name: 'Orient Cement Limited', source: 'https://www.eci.gov.in/eci-backend/public/pdf/report/December/1766120456.pdf', note: 'Company disclosure hosted by the Election Commission of India; confirms OR segment.' },
  { identifier: 'L17299DN2005PLC005690', name: 'Sanathan Textiles Limited', source: 'https://nsearchives.nseindia.com/corporate/SANATHAN_09022026204344_STL_Earnings_call_audio_recording.pdf', note: 'NSE-hosted company disclosure dated 9 February 2026; confirms DN in the published CIN.' },
];

export interface LlpinFixture {
  identifier: string;
  name: string;
  source: string;
}

const mcaLlpList2009 = 'https://www.mca.gov.in/Ministry/pdf/List%20of%20LLPs-2009.pdf';
const gazetteNotice2024 = 'https://egazette.gov.in/WriteReadData/2024/258255.pdf';

export const realLlpinFixtures: LlpinFixture[] = [
  { identifier: 'AAA-0150', name: 'KKK Prime Properties LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0151', name: 'Pentagra Software Management and Solutions LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0152', name: 'Affordable Luxury Tour India LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0153', name: 'Fortune Group Propstar LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0154', name: 'APT Business Services LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0155', name: 'Insync Capital Partners LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0156', name: 'Mindwagon Projects LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0157', name: 'International Forensic Sciences India LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0158', name: 'Almechants Systems LLP', source: mcaLlpList2009 },
  { identifier: 'AAA-0159', name: 'Sofi Healthcare LLP', source: mcaLlpList2009 },
  { identifier: 'AAN-5407', name: 'RQ Voice LLP', source: gazetteNotice2024 },
  { identifier: 'AAY-8023', name: 'Youniverset Edtech LLP', source: gazetteNotice2024 },
  { identifier: 'AAN-6889', name: 'Anant Business Development & Consultants LLP', source: gazetteNotice2024 },
  { identifier: 'AAV-4733', name: 'Datostor Enterprise LLP', source: gazetteNotice2024 },
  { identifier: 'AAP-7121', name: 'Infinite Moments LLP', source: gazetteNotice2024 },
  { identifier: 'AAA-2345', name: 'Erica Sky Dwellers LLP', source: gazetteNotice2024 },
  { identifier: 'AAI-2256', name: 'Imetrics Info LLP', source: gazetteNotice2024 },
  { identifier: 'AAQ-4147', name: 'Revplus Services LLP', source: gazetteNotice2024 },
  { identifier: 'AAK-8333', name: 'ARK Advisory Services LLP', source: gazetteNotice2024 },
  { identifier: 'AAZ-6648', name: 'Avon Developers Chembur LLP', source: gazetteNotice2024 },
  { identifier: 'AAJ-2437', name: 'Prachi Design Consultancy LLP', source: gazetteNotice2024 },
  { identifier: 'AAS-4644', name: 'Hale Promoters LLP', source: gazetteNotice2024 },
  { identifier: 'ABA-7705', name: 'Cape Spirited LLP', source: gazetteNotice2024 },
  { identifier: 'AAN-7993', name: 'Triadditive Knowledge Solutions LLP', source: gazetteNotice2024 },
  { identifier: 'AAX-9772', name: 'Btechforce LLP', source: gazetteNotice2024 },
];
