/**
 * Comprehensive census of Russian federal legislation.
 *
 * Source: pravo.gov.ru (Official Internet Portal of Legal Information)
 *
 * This census covers:
 * - The Constitution of the Russian Federation
 * - All major Codes (Кодексы)
 * - Federal Constitutional Laws (ФКЗ)
 * - Key Federal Laws (ФЗ) — all major statutes
 *
 * Each entry includes:
 * - pravo.gov.ru nd (document number) for retrieval
 * - Official title in Russian
 * - English translation of title
 * - Identifier (law number)
 * - Type classification
 * - Key dates
 * - Status
 *
 * The nd numbers are internal pravo.gov.ru identifiers used in URL:
 * http://pravo.gov.ru/proxy/ips/?docbody=&nd={nd}
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LawType =
  | 'constitution'
  | 'code'
  | 'federal_constitutional_law'
  | 'federal_law';

export type LawStatus = 'in_force' | 'amended' | 'repealed';

export type CensusClassification =
  | 'ingestable'
  | 'ocr_needed'
  | 'inaccessible'
  | 'excluded';

export interface CensusEntry {
  id: string;
  nd: string;                    // pravo.gov.ru document number
  title: string;                 // Russian title
  title_en: string;              // English title
  identifier: string;            // e.g. "152-ФЗ", "ГК РФ"
  law_type: LawType;
  status: LawStatus;
  effective_date: string;        // ISO 8601
  publication_date?: string;
  last_amended?: string;
  classification: CensusClassification;
  description?: string;          // Full official designation
  source_url: string;
  eu_references?: EuReference[];
}

export interface EuReference {
  eu_document_id: string;
  eu_type: 'directive' | 'regulation';
  eu_year: number;
  eu_number: number;
  eu_title: string;
  eu_short_name: string;
  reference_type: string;
  is_primary: boolean;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constitution
// ─────────────────────────────────────────────────────────────────────────────

const CONSTITUTION: CensusEntry[] = [
  {
    id: 'constitution-rf',
    nd: '102027595',
    title: 'Конституция Российской Федерации',
    title_en: 'Constitution of the Russian Federation',
    identifier: 'Конституция РФ',
    law_type: 'constitution',
    status: 'amended',
    effective_date: '1993-12-25',
    last_amended: '2020-07-04',
    classification: 'ingestable',
    description: 'Конституция Российской Федерации (принята всенародным голосованием 12.12.1993 с изменениями, одобренными в ходе общероссийского голосования 01.07.2020)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102027595',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Codes (Кодексы Российской Федерации)
// ─────────────────────────────────────────────────────────────────────────────

const CODES: CensusEntry[] = [
  {
    id: 'gk-rf-1',
    nd: '102033239',
    title: 'Гражданский кодекс Российской Федерации (часть первая)',
    title_en: 'Civil Code of the Russian Federation (Part 1)',
    identifier: 'ГК РФ ч.1',
    law_type: 'code',
    status: 'amended',
    effective_date: '1995-01-01',
    classification: 'ingestable',
    description: 'Гражданский кодекс Российской Федерации (часть первая) от 30.11.1994 № 51-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102033239',
  },
  {
    id: 'gk-rf-2',
    nd: '102039209',
    title: 'Гражданский кодекс Российской Федерации (часть вторая)',
    title_en: 'Civil Code of the Russian Federation (Part 2)',
    identifier: 'ГК РФ ч.2',
    law_type: 'code',
    status: 'amended',
    effective_date: '1996-03-01',
    classification: 'ingestable',
    description: 'Гражданский кодекс Российской Федерации (часть вторая) от 26.01.1996 № 14-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102039209',
  },
  {
    id: 'gk-rf-3',
    nd: '102079553',
    title: 'Гражданский кодекс Российской Федерации (часть третья)',
    title_en: 'Civil Code of the Russian Federation (Part 3)',
    identifier: 'ГК РФ ч.3',
    law_type: 'code',
    status: 'amended',
    effective_date: '2002-03-01',
    classification: 'ingestable',
    description: 'Гражданский кодекс Российской Федерации (часть третья) от 26.11.2001 № 146-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102079553',
  },
  {
    id: 'gk-rf-4',
    nd: '102105844',
    title: 'Гражданский кодекс Российской Федерации (часть четвертая)',
    title_en: 'Civil Code of the Russian Federation (Part 4)',
    identifier: 'ГК РФ ч.4',
    law_type: 'code',
    status: 'amended',
    effective_date: '2008-01-01',
    classification: 'ingestable',
    description: 'Гражданский кодекс Российской Федерации (часть четвертая) от 18.12.2006 № 230-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102105844',
  },
  {
    id: 'uk-rf',
    nd: '102041891',
    title: 'Уголовный кодекс Российской Федерации',
    title_en: 'Criminal Code of the Russian Federation',
    identifier: 'УК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '1997-01-01',
    classification: 'ingestable',
    description: 'Уголовный кодекс Российской Федерации от 13.06.1996 № 63-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102041891',
  },
  {
    id: 'upk-rf',
    nd: '102073942',
    title: 'Уголовно-процессуальный кодекс Российской Федерации',
    title_en: 'Criminal Procedure Code of the Russian Federation',
    identifier: 'УПК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2002-07-01',
    classification: 'ingestable',
    description: 'Уголовно-процессуальный кодекс Российской Федерации от 18.12.2001 № 174-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102073942',
  },
  {
    id: 'uik-rf',
    nd: '102044563',
    title: 'Уголовно-исполнительный кодекс Российской Федерации',
    title_en: 'Penal Code of the Russian Federation',
    identifier: 'УИК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '1997-07-01',
    classification: 'ingestable',
    description: 'Уголовно-исполнительный кодекс Российской Федерации от 08.01.1997 № 1-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102044563',
  },
  {
    id: 'koap-rf',
    nd: '102074277',
    title: 'Кодекс Российской Федерации об административных правонарушениях',
    title_en: 'Code of Administrative Offences of the Russian Federation',
    identifier: 'КоАП РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2002-07-01',
    classification: 'ingestable',
    description: 'Кодекс Российской Федерации об административных правонарушениях от 30.12.2001 № 195-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102074277',
  },
  {
    id: 'tk-rf',
    nd: '102074279',
    title: 'Трудовой кодекс Российской Федерации',
    title_en: 'Labour Code of the Russian Federation',
    identifier: 'ТК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2002-02-01',
    classification: 'ingestable',
    description: 'Трудовой кодекс Российской Федерации от 30.12.2001 № 197-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102074279',
  },
  {
    id: 'nk-rf-1',
    nd: '102054955',
    title: 'Налоговый кодекс Российской Федерации (часть первая)',
    title_en: 'Tax Code of the Russian Federation (Part 1)',
    identifier: 'НК РФ ч.1',
    law_type: 'code',
    status: 'amended',
    effective_date: '1999-01-01',
    classification: 'ingestable',
    description: 'Налоговый кодекс Российской Федерации (часть первая) от 31.07.1998 № 146-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102054955',
  },
  {
    id: 'nk-rf-2',
    nd: '102067058',
    title: 'Налоговый кодекс Российской Федерации (часть вторая)',
    title_en: 'Tax Code of the Russian Federation (Part 2)',
    identifier: 'НК РФ ч.2',
    law_type: 'code',
    status: 'amended',
    effective_date: '2001-01-01',
    classification: 'ingestable',
    description: 'Налоговый кодекс Российской Федерации (часть вторая) от 05.08.2000 № 117-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102067058',
  },
  {
    id: 'bk-rf',
    nd: '102054815',
    title: 'Бюджетный кодекс Российской Федерации',
    title_en: 'Budget Code of the Russian Federation',
    identifier: 'БК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2000-01-01',
    classification: 'ingestable',
    description: 'Бюджетный кодекс Российской Федерации от 31.07.1998 № 145-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102054815',
  },
  {
    id: 'sk-rf',
    nd: '102040037',
    title: 'Семейный кодекс Российской Федерации',
    title_en: 'Family Code of the Russian Federation',
    identifier: 'СК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '1996-03-01',
    classification: 'ingestable',
    description: 'Семейный кодекс Российской Федерации от 29.12.1995 № 223-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102040037',
  },
  {
    id: 'zk-rf',
    nd: '102073184',
    title: 'Земельный кодекс Российской Федерации',
    title_en: 'Land Code of the Russian Federation',
    identifier: 'ЗК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2001-10-30',
    classification: 'ingestable',
    description: 'Земельный кодекс Российской Федерации от 25.10.2001 № 136-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102073184',
  },
  {
    id: 'zhk-rf',
    nd: '102090645',
    title: 'Жилищный кодекс Российской Федерации',
    title_en: 'Housing Code of the Russian Federation',
    identifier: 'ЖК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2005-03-01',
    classification: 'ingestable',
    description: 'Жилищный кодекс Российской Федерации от 29.12.2004 № 188-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102090645',
  },
  {
    id: 'gpk-rf',
    nd: '102079331',
    title: 'Гражданский процессуальный кодекс Российской Федерации',
    title_en: 'Civil Procedure Code of the Russian Federation',
    identifier: 'ГПК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2003-02-01',
    classification: 'ingestable',
    description: 'Гражданский процессуальный кодекс Российской Федерации от 14.11.2002 № 138-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102079331',
  },
  {
    id: 'apk-rf',
    nd: '102077581',
    title: 'Арбитражный процессуальный кодекс Российской Федерации',
    title_en: 'Arbitration Procedure Code of the Russian Federation',
    identifier: 'АПК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2002-09-01',
    classification: 'ingestable',
    description: 'Арбитражный процессуальный кодекс Российской Федерации от 24.07.2002 № 95-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102077581',
  },
  {
    id: 'kas-rf',
    nd: '102371260',
    title: 'Кодекс административного судопроизводства Российской Федерации',
    title_en: 'Code of Administrative Procedure of the Russian Federation',
    identifier: 'КАС РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2015-09-15',
    classification: 'ingestable',
    description: 'Кодекс административного судопроизводства Российской Федерации от 08.03.2015 № 21-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102371260',
  },
  {
    id: 'vk-rf',
    nd: '102101522',
    title: 'Водный кодекс Российской Федерации',
    title_en: 'Water Code of the Russian Federation',
    identifier: 'ВК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2007-01-01',
    classification: 'ingestable',
    description: 'Водный кодекс Российской Федерации от 03.06.2006 № 74-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102101522',
  },
  {
    id: 'lk-rf',
    nd: '102105388',
    title: 'Лесной кодекс Российской Федерации',
    title_en: 'Forestry Code of the Russian Federation',
    identifier: 'ЛК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2007-01-01',
    classification: 'ingestable',
    description: 'Лесной кодекс Российской Федерации от 04.12.2006 № 200-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102105388',
  },
  {
    id: 'vozdkod-rf',
    nd: '102045976',
    title: 'Воздушный кодекс Российской Федерации',
    title_en: 'Air Code of the Russian Federation',
    identifier: 'ВзК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '1997-04-01',
    classification: 'ingestable',
    description: 'Воздушный кодекс Российской Федерации от 19.03.1997 № 60-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102045976',
  },
  {
    id: 'gradk-rf',
    nd: '102090643',
    title: 'Градостроительный кодекс Российской Федерации',
    title_en: 'Town Planning Code of the Russian Federation',
    identifier: 'ГрК РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2005-01-10',
    classification: 'ingestable',
    description: 'Градостроительный кодекс Российской Федерации от 29.12.2004 № 190-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102090643',
  },
  {
    id: 'tamk-eaes',
    nd: '102447400',
    title: 'Таможенный кодекс Евразийского экономического союза',
    title_en: 'Customs Code of the Eurasian Economic Union',
    identifier: 'ТК ЕАЭС',
    law_type: 'code',
    status: 'in_force',
    effective_date: '2018-01-01',
    classification: 'ingestable',
    description: 'Таможенный кодекс Евразийского экономического союза (приложение к Договору о ТК ЕАЭС)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102447400',
  },
  {
    id: 'ktz-rf',
    nd: '102084892',
    title: 'Кодекс торгового мореплавания Российской Федерации',
    title_en: 'Merchant Shipping Code of the Russian Federation',
    identifier: 'КТМ РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '1999-05-01',
    classification: 'ingestable',
    description: 'Кодекс торгового мореплавания Российской Федерации от 30.04.1999 № 81-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102084892',
  },
  {
    id: 'kvs-rf',
    nd: '102061430',
    title: 'Кодекс внутреннего водного транспорта Российской Федерации',
    title_en: 'Inland Water Transport Code of the Russian Federation',
    identifier: 'КВВТ РФ',
    law_type: 'code',
    status: 'amended',
    effective_date: '2001-03-12',
    classification: 'ingestable',
    description: 'Кодекс внутреннего водного транспорта Российской Федерации от 07.03.2001 № 24-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102061430',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Key Federal Laws (ФЗ) — comprehensive list
// ─────────────────────────────────────────────────────────────────────────────

const FEDERAL_LAWS: CensusEntry[] = [
  // ── Data Protection & Privacy ──
  {
    id: 'fz-152-2006',
    nd: '102108264',
    title: 'О персональных данных',
    title_en: 'On Personal Data',
    identifier: '152-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2006-07-27',
    classification: 'ingestable',
    description: 'Федеральный закон от 27.07.2006 № 152-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102108264',
    eu_references: [
      {
        eu_document_id: 'regulation:2016/679',
        eu_type: 'regulation', eu_year: 2016, eu_number: 679,
        eu_title: 'General Data Protection Regulation',
        eu_short_name: 'GDPR',
        reference_type: 'references', is_primary: true,
        description: 'Russia\'s primary personal data protection law, comparable to the EU GDPR',
      },
    ],
  },

  // ── Information & Cybersecurity ──
  {
    id: 'fz-149-2006',
    nd: '102108264',
    title: 'Об информации, информационных технологиях и о защите информации',
    title_en: 'On Information, Information Technologies and Protection of Information',
    identifier: '149-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2006-07-27',
    classification: 'ingestable',
    description: 'Федеральный закон от 27.07.2006 № 149-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102108264',
    eu_references: [
      {
        eu_document_id: 'directive:2022/2555',
        eu_type: 'directive', eu_year: 2022, eu_number: 2555,
        eu_title: 'Directive on measures for a high common level of cybersecurity (NIS2)',
        eu_short_name: 'NIS2 Directive',
        reference_type: 'references', is_primary: false,
        description: 'Addresses information security requirements similar to NIS2',
      },
    ],
  },
  {
    id: 'fz-187-2017',
    nd: '102447399',
    title: 'О безопасности критической информационной инфраструктуры Российской Федерации',
    title_en: 'On Security of Critical Information Infrastructure of the Russian Federation',
    identifier: '187-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2018-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 26.07.2017 № 187-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102447399',
    eu_references: [
      {
        eu_document_id: 'directive:2022/2555',
        eu_type: 'directive', eu_year: 2022, eu_number: 2555,
        eu_title: 'NIS2 Directive',
        eu_short_name: 'NIS2',
        reference_type: 'references', is_primary: true,
        description: 'Russia\'s critical infrastructure security law, comparable to EU NIS2',
      },
    ],
  },
  {
    id: 'fz-63-2011',
    nd: '102147781',
    title: 'Об электронной подписи',
    title_en: 'On Electronic Signatures',
    identifier: '63-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2011-04-08',
    classification: 'ingestable',
    description: 'Федеральный закон от 06.04.2011 № 63-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102147781',
    eu_references: [
      {
        eu_document_id: 'regulation:2014/910',
        eu_type: 'regulation', eu_year: 2014, eu_number: 910,
        eu_title: 'eIDAS Regulation',
        eu_short_name: 'eIDAS',
        reference_type: 'references', is_primary: true,
        description: 'Comparable to EU eIDAS on electronic identification and signatures',
      },
    ],
  },

  // ── State Secrets & Security ──
  {
    id: 'fz-5485-1993',
    nd: '102033815',
    title: 'О государственной тайне',
    title_en: 'On State Secrets',
    identifier: '5485-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1993-07-21',
    classification: 'ingestable',
    description: 'Закон РФ от 21.07.1993 № 5485-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102033815',
  },
  {
    id: 'fz-390-2010',
    nd: '102144301',
    title: 'О безопасности',
    title_en: 'On Security',
    identifier: '390-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2011-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 28.12.2010 № 390-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102144301',
  },

  // ── Intellectual Property & Commerce ──
  {
    id: 'fz-135-2006',
    nd: '102108256',
    title: 'О защите конкуренции',
    title_en: 'On Protection of Competition',
    identifier: '135-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2006-10-26',
    classification: 'ingestable',
    description: 'Федеральный закон от 26.07.2006 № 135-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102108256',
  },
  {
    id: 'fz-44-2013',
    nd: '102162706',
    title: 'О контрактной системе в сфере закупок товаров, работ, услуг для обеспечения государственных и муниципальных нужд',
    title_en: 'On Contract System for Procurement of Goods, Works, Services for State and Municipal Needs',
    identifier: '44-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2014-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 05.04.2013 № 44-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102162706',
  },
  {
    id: 'fz-223-2011',
    nd: '102150039',
    title: 'О закупках товаров, работ, услуг отдельными видами юридических лиц',
    title_en: 'On Procurement of Goods, Works, Services by Certain Types of Legal Entities',
    identifier: '223-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2012-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 18.07.2011 № 223-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102150039',
  },

  // ── Banking & Financial ──
  {
    id: 'fz-86-2002',
    nd: '102077044',
    title: 'О Центральном банке Российской Федерации (Банке России)',
    title_en: 'On the Central Bank of the Russian Federation (Bank of Russia)',
    identifier: '86-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-07-10',
    classification: 'ingestable',
    description: 'Федеральный закон от 10.07.2002 № 86-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102077044',
  },
  {
    id: 'fz-395-1990',
    nd: '102003583',
    title: 'О банках и банковской деятельности',
    title_en: 'On Banks and Banking Activities',
    identifier: '395-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1990-12-02',
    classification: 'ingestable',
    description: 'Федеральный закон от 02.12.1990 № 395-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102003583',
  },
  {
    id: 'fz-115-2001',
    nd: '102071593',
    title: 'О противодействии легализации (отмыванию) доходов, полученных преступным путём, и финансированию терроризма',
    title_en: 'On Countering Legalization (Laundering) of Proceeds of Crime and Financing of Terrorism',
    identifier: '115-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-02-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 07.08.2001 № 115-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102071593',
  },
  {
    id: 'fz-259-2020',
    nd: '102685447',
    title: 'О цифровых финансовых активах, цифровой валюте',
    title_en: 'On Digital Financial Assets, Digital Currency',
    identifier: '259-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2021-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 31.07.2020 № 259-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102685447',
  },

  // ── Corporate & Business ──
  {
    id: 'fz-14-1998',
    nd: '102051532',
    title: 'Об обществах с ограниченной ответственностью',
    title_en: 'On Limited Liability Companies',
    identifier: '14-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1998-03-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 08.02.1998 № 14-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102051532',
  },
  {
    id: 'fz-208-1995',
    nd: '102038956',
    title: 'Об акционерных обществах',
    title_en: 'On Joint-Stock Companies',
    identifier: '208-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1996-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 26.12.1995 № 208-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102038956',
  },
  {
    id: 'fz-129-2001',
    nd: '102072328',
    title: 'О государственной регистрации юридических лиц и индивидуальных предпринимателей',
    title_en: 'On State Registration of Legal Entities and Individual Entrepreneurs',
    identifier: '129-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 08.08.2001 № 129-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102072328',
  },
  {
    id: 'fz-127-2002',
    nd: '102078756',
    title: 'О несостоятельности (банкротстве)',
    title_en: 'On Insolvency (Bankruptcy)',
    identifier: '127-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-12-03',
    classification: 'ingestable',
    description: 'Федеральный закон от 26.10.2002 № 127-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102078756',
  },

  // ── Consumer Protection ──
  {
    id: 'fz-2300-1992',
    nd: '102023464',
    title: 'О защите прав потребителей',
    title_en: 'On Protection of Consumer Rights',
    identifier: '2300-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1992-02-07',
    classification: 'ingestable',
    description: 'Закон РФ от 07.02.1992 № 2300-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102023464',
  },

  // ── Environment ──
  {
    id: 'fz-7-2002',
    nd: '102074303',
    title: 'Об охране окружающей среды',
    title_en: 'On Environmental Protection',
    identifier: '7-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-01-10',
    classification: 'ingestable',
    description: 'Федеральный закон от 10.01.2002 № 7-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102074303',
  },

  // ── Education ──
  {
    id: 'fz-273-2012',
    nd: '102162745',
    title: 'Об образовании в Российской Федерации',
    title_en: 'On Education in the Russian Federation',
    identifier: '273-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2013-09-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 29.12.2012 № 273-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102162745',
  },

  // ── Healthcare ──
  {
    id: 'fz-323-2011',
    nd: '102152259',
    title: 'Об основах охраны здоровья граждан в Российской Федерации',
    title_en: 'On Fundamentals of Public Health Protection in the Russian Federation',
    identifier: '323-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2012-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 21.11.2011 № 323-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102152259',
  },

  // ── Anti-Corruption ──
  {
    id: 'fz-273-2008',
    nd: '102126657',
    title: 'О противодействии коррупции',
    title_en: 'On Combating Corruption',
    identifier: '273-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2009-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 25.12.2008 № 273-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102126657',
  },

  // ── Licensing ──
  {
    id: 'fz-99-2011',
    nd: '102147654',
    title: 'О лицензировании отдельных видов деятельности',
    title_en: 'On Licensing of Certain Types of Activities',
    identifier: '99-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2011-11-03',
    classification: 'ingestable',
    description: 'Федеральный закон от 04.05.2011 № 99-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102147654',
  },

  // ── Defense & Military ──
  {
    id: 'fz-61-1996',
    nd: '102040878',
    title: 'Об обороне',
    title_en: 'On Defence',
    identifier: '61-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1996-06-05',
    classification: 'ingestable',
    description: 'Федеральный закон от 31.05.1996 № 61-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102040878',
  },
  {
    id: 'fz-53-1998',
    nd: '102052366',
    title: 'О воинской обязанности и военной службе',
    title_en: 'On Military Duty and Military Service',
    identifier: '53-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1998-03-28',
    classification: 'ingestable',
    description: 'Федеральный закон от 28.03.1998 № 53-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102052366',
  },

  // ── Elections ──
  {
    id: 'fz-67-2002',
    nd: '102076507',
    title: 'Об основных гарантиях избирательных прав и права на участие в референдуме граждан Российской Федерации',
    title_en: 'On Basic Guarantees of Electoral Rights and the Right to Participate in Referendums of Citizens of the Russian Federation',
    identifier: '67-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-06-15',
    classification: 'ingestable',
    description: 'Федеральный закон от 12.06.2002 № 67-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102076507',
  },

  // ── Foreign Agents / NGOs ──
  {
    id: 'fz-255-2022',
    nd: '102785647',
    title: 'О контроле за деятельностью лиц, находящихся под иностранным влиянием',
    title_en: 'On Control of Activities of Persons Under Foreign Influence',
    identifier: '255-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2022-12-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 14.07.2022 № 255-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102785647',
  },

  // ── Communications ──
  {
    id: 'fz-126-2003',
    nd: '102082548',
    title: 'О связи',
    title_en: 'On Communications',
    identifier: '126-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2004-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 07.07.2003 № 126-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102082548',
  },

  // ── Media ──
  {
    id: 'fz-2124-1991',
    nd: '102016159',
    title: 'О средствах массовой информации',
    title_en: 'On Mass Media',
    identifier: '2124-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1992-02-08',
    classification: 'ingestable',
    description: 'Закон РФ от 27.12.1991 № 2124-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102016159',
  },

  // ── Insurance ──
  {
    id: 'fz-40-2002',
    nd: '102075637',
    title: 'Об обязательном страховании гражданской ответственности владельцев транспортных средств',
    title_en: 'On Mandatory Insurance of Civil Liability of Vehicle Owners (OSAGO)',
    identifier: '40-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2003-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 25.04.2002 № 40-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102075637',
  },

  // ── Pensions & Social Security ──
  {
    id: 'fz-400-2013',
    nd: '102170825',
    title: 'О страховых пенсиях',
    title_en: 'On Insurance Pensions',
    identifier: '400-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2015-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 28.12.2013 № 400-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102170825',
  },

  // ── Local Government ──
  {
    id: 'fz-131-2003',
    nd: '102083574',
    title: 'Об общих принципах организации местного самоуправления в Российской Федерации',
    title_en: 'On General Principles of Organization of Local Self-Government in the Russian Federation',
    identifier: '131-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2003-10-06',
    classification: 'ingestable',
    description: 'Федеральный закон от 06.10.2003 № 131-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102083574',
  },

  // ── Judicial System ──
  {
    id: 'fz-1-1996',
    nd: '102038693',
    title: 'О судебной системе Российской Федерации',
    title_en: 'On the Judicial System of the Russian Federation',
    identifier: '1-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '1997-01-01',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 31.12.1996 № 1-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102038693',
  },

  // ── Immigration & Citizenship ──
  {
    id: 'fz-62-2002',
    nd: '102076357',
    title: 'О гражданстве Российской Федерации',
    title_en: 'On Citizenship of the Russian Federation',
    identifier: '62-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 31.05.2002 № 62-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102076357',
  },
  {
    id: 'fz-115-2002',
    nd: '102078032',
    title: 'О правовом положении иностранных граждан в Российской Федерации',
    title_en: 'On the Legal Status of Foreign Citizens in the Russian Federation',
    identifier: '115-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-11-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 25.07.2002 № 115-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102078032',
  },

  // ── Transportation ──
  {
    id: 'fz-17-2003',
    nd: '102080107',
    title: 'О железнодорожном транспорте в Российской Федерации',
    title_en: 'On Railway Transport in the Russian Federation',
    identifier: '17-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2003-05-18',
    classification: 'ingestable',
    description: 'Федеральный закон от 10.01.2003 № 17-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102080107',
  },
  {
    id: 'fz-196-1995',
    nd: '102038018',
    title: 'О безопасности дорожного движения',
    title_en: 'On Road Traffic Safety',
    identifier: '196-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1996-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 10.12.1995 № 196-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102038018',
  },

  // ── Energy ──
  {
    id: 'fz-35-2003',
    nd: '102080862',
    title: 'Об электроэнергетике',
    title_en: 'On Electric Power Industry',
    identifier: '35-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2003-03-26',
    classification: 'ingestable',
    description: 'Федеральный закон от 26.03.2003 № 35-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102080862',
  },

  // ── Nuclear/Atomic Energy ──
  {
    id: 'fz-170-1995',
    nd: '102037816',
    title: 'Об использовании атомной энергии',
    title_en: 'On Use of Atomic Energy',
    identifier: '170-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-11-20',
    classification: 'ingestable',
    description: 'Федеральный закон от 21.11.1995 № 170-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102037816',
  },

  // ── Construction & Real Estate ──
  {
    id: 'fz-214-2004',
    nd: '102091195',
    title: 'Об участии в долевом строительстве многоквартирных домов',
    title_en: 'On Participation in Shared-Equity Construction of Multi-Apartment Buildings',
    identifier: '214-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2005-04-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 30.12.2004 № 214-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102091195',
  },
  {
    id: 'fz-218-2015',
    nd: '102375519',
    title: 'О государственной регистрации недвижимости',
    title_en: 'On State Registration of Real Property',
    identifier: '218-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2017-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 13.07.2015 № 218-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102375519',
  },

  // ── Public Associations ──
  {
    id: 'fz-82-1995',
    nd: '102035554',
    title: 'Об общественных объединениях',
    title_en: 'On Public Associations',
    identifier: '82-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-05-19',
    classification: 'ingestable',
    description: 'Федеральный закон от 19.05.1995 № 82-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102035554',
  },

  // ── Charity ──
  {
    id: 'fz-135-1995',
    nd: '102037205',
    title: 'О благотворительной деятельности и добровольчестве (волонтёрстве)',
    title_en: 'On Charitable Activities and Volunteering',
    identifier: '135-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-08-11',
    classification: 'ingestable',
    description: 'Федеральный закон от 11.08.1995 № 135-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102037205',
  },

  // ── Archives ──
  {
    id: 'fz-125-2004',
    nd: '102088832',
    title: 'Об архивном деле в Российской Федерации',
    title_en: 'On Archives in the Russian Federation',
    identifier: '125-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2004-10-22',
    classification: 'ingestable',
    description: 'Федеральный закон от 22.10.2004 № 125-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102088832',
  },

  // ── State Governance ──
  {
    id: 'fz-79-2004',
    nd: '102088364',
    title: 'О государственной гражданской службе Российской Федерации',
    title_en: 'On State Civil Service of the Russian Federation',
    identifier: '79-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2005-02-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 27.07.2004 № 79-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102088364',
  },

  // ── Sports ──
  {
    id: 'fz-329-2007',
    nd: '102119226',
    title: 'О физической культуре и спорте в Российской Федерации',
    title_en: 'On Physical Culture and Sports in the Russian Federation',
    identifier: '329-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2008-03-30',
    classification: 'ingestable',
    description: 'Федеральный закон от 04.12.2007 № 329-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102119226',
  },

  // ── Counter-Terrorism ──
  {
    id: 'fz-35-2006',
    nd: '102105954',
    title: 'О противодействии терроризму',
    title_en: 'On Combating Terrorism',
    identifier: '35-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2006-03-10',
    classification: 'ingestable',
    description: 'Федеральный закон от 06.03.2006 № 35-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102105954',
  },

  // ── Counter-Extremism ──
  {
    id: 'fz-114-2002',
    nd: '102078043',
    title: 'О противодействии экстремистской деятельности',
    title_en: 'On Combating Extremist Activities',
    identifier: '114-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-07-25',
    classification: 'ingestable',
    description: 'Федеральный закон от 25.07.2002 № 114-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102078043',
  },

  // ── Internet Regulation (Yarovaya Law) ──
  {
    id: 'fz-374-2016',
    nd: '102404930',
    title: 'О внесении изменений в Федеральный закон «О противодействии терроризму» и отдельные законодательные акты Российской Федерации',
    title_en: 'On Amendments to the Federal Law "On Combating Terrorism" (Yarovaya Law)',
    identifier: '374-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2016-07-20',
    classification: 'ingestable',
    description: 'Федеральный закон от 06.07.2016 № 374-ФЗ (Закон Яровой)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102404930',
  },

  // ── Sovereign Internet (RuNet) ──
  {
    id: 'fz-90-2019',
    nd: '102567261',
    title: 'О внесении изменений в Федеральный закон «О связи» и Федеральный закон «Об информации, информационных технологиях и о защите информации»',
    title_en: 'On Amendments to Federal Laws on Communications and Information (Sovereign Internet Law)',
    identifier: '90-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2019-11-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 01.05.2019 № 90-ФЗ (Закон о суверенном интернете)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102567261',
  },

  // ── Accounting ──
  {
    id: 'fz-402-2011',
    nd: '102153604',
    title: 'О бухгалтерском учёте',
    title_en: 'On Accounting',
    identifier: '402-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2013-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 06.12.2011 № 402-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102153604',
  },

  // ── Technical Regulation ──
  {
    id: 'fz-184-2002',
    nd: '102079292',
    title: 'О техническом регулировании',
    title_en: 'On Technical Regulation',
    identifier: '184-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2003-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 27.12.2002 № 184-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102079292',
  },

  // ── Advertising ──
  {
    id: 'fz-38-2006',
    nd: '102106305',
    title: 'О рекламе',
    title_en: 'On Advertising',
    identifier: '38-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2006-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 13.03.2006 № 38-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102106305',
  },

  // ── Police ──
  {
    id: 'fz-3-2011',
    nd: '102145133',
    title: 'О полиции',
    title_en: 'On Police',
    identifier: '3-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2011-03-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 07.02.2011 № 3-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102145133',
  },

  // ── Operational Search ──
  {
    id: 'fz-144-1995',
    nd: '102037166',
    title: 'Об оперативно-розыскной деятельности',
    title_en: 'On Operational Search Activities',
    identifier: '144-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-08-12',
    classification: 'ingestable',
    description: 'Федеральный закон от 12.08.1995 № 144-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102037166',
  },

  // ── Customs ──
  {
    id: 'fz-289-2018',
    nd: '102479254',
    title: 'О таможенном регулировании в Российской Федерации',
    title_en: 'On Customs Regulation in the Russian Federation',
    identifier: '289-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2018-09-04',
    classification: 'ingestable',
    description: 'Федеральный закон от 03.08.2018 № 289-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102479254',
  },

  // ── Notarial ──
  {
    id: 'fz-4462-1993',
    nd: '102020854',
    title: 'Основы законодательства Российской Федерации о нотариате',
    title_en: 'Fundamentals of Legislation of the Russian Federation on Notaries',
    identifier: '4462-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1993-02-11',
    classification: 'ingestable',
    description: 'Основы законодательства РФ о нотариате от 11.02.1993 № 4462-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102020854',
  },

  // ── Advocacy ──
  {
    id: 'fz-63-2002',
    nd: '102076503',
    title: 'Об адвокатской деятельности и адвокатуре в Российской Федерации',
    title_en: 'On Advocacy and the Bar in the Russian Federation',
    identifier: '63-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2002-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 31.05.2002 № 63-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102076503',
  },

  // ── Foreign Policy ──
  {
    id: 'fz-101-1995',
    nd: '102035990',
    title: 'О международных договорах Российской Федерации',
    title_en: 'On International Treaties of the Russian Federation',
    identifier: '101-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '1995-07-15',
    classification: 'ingestable',
    description: 'Федеральный закон от 15.07.1995 № 101-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102035990',
  },

  // ── Trade Secrets ──
  {
    id: 'fz-98-2004',
    nd: '102088433',
    title: 'О коммерческой тайне',
    title_en: 'On Trade Secrets',
    identifier: '98-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2004-10-16',
    classification: 'ingestable',
    description: 'Федеральный закон от 29.07.2004 № 98-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102088433',
  },

  // ── Natural Monopolies ──
  {
    id: 'fz-147-1995',
    nd: '102037347',
    title: 'О естественных монополиях',
    title_en: 'On Natural Monopolies',
    identifier: '147-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-08-17',
    classification: 'ingestable',
    description: 'Федеральный закон от 17.08.1995 № 147-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102037347',
  },

  // ── Securities Market ──
  {
    id: 'fz-39-1996',
    nd: '102040702',
    title: 'О рынке ценных бумаг',
    title_en: 'On the Securities Market',
    identifier: '39-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1996-04-22',
    classification: 'ingestable',
    description: 'Федеральный закон от 22.04.1996 № 39-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102040702',
  },

  // ── Sanitary / Epidemiological ──
  {
    id: 'fz-52-1999',
    nd: '102058836',
    title: 'О санитарно-эпидемиологическом благополучии населения',
    title_en: 'On Sanitary and Epidemiological Welfare of the Population',
    identifier: '52-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1999-03-30',
    classification: 'ingestable',
    description: 'Федеральный закон от 30.03.1999 № 52-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102058836',
  },

  // ── Fire Safety ──
  {
    id: 'fz-69-1994',
    nd: '102033419',
    title: 'О пожарной безопасности',
    title_en: 'On Fire Safety',
    identifier: '69-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1995-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 21.12.1994 № 69-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102033419',
  },

  // ── Biometric Data ──
  {
    id: 'fz-572-2022',
    nd: '102814751',
    title: 'Об осуществлении идентификации и (или) аутентификации физических лиц с использованием биометрических персональных данных',
    title_en: 'On Identification and/or Authentication of Natural Persons Using Biometric Personal Data',
    identifier: '572-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2023-06-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 29.12.2022 № 572-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102814751',
  },

  // ── AI / Experimental Legal Regimes ──
  {
    id: 'fz-258-2020',
    nd: '102685446',
    title: 'Об экспериментальных правовых режимах в сфере цифровых инноваций в Российской Федерации',
    title_en: 'On Experimental Legal Regimes in the Field of Digital Innovations in the Russian Federation',
    identifier: '258-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2021-01-28',
    classification: 'ingestable',
    description: 'Федеральный закон от 31.07.2020 № 258-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102685446',
    eu_references: [
      {
        eu_document_id: 'regulation:2024/1689',
        eu_type: 'regulation', eu_year: 2024, eu_number: 1689,
        eu_title: 'Artificial Intelligence Act',
        eu_short_name: 'AI Act',
        reference_type: 'references', is_primary: false,
        description: 'Regulatory sandboxes for AI innovation, comparable to the EU AI Act sandbox provisions',
      },
    ],
  },

  // ── Gambling ──
  {
    id: 'fz-244-2006',
    nd: '102111879',
    title: 'О государственном регулировании деятельности по организации и проведению азартных игр',
    title_en: 'On State Regulation of Gambling',
    identifier: '244-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2007-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 29.12.2006 № 244-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102111879',
  },

  // ── Investment ──
  {
    id: 'fz-39-1999',
    nd: '102057592',
    title: 'Об инвестиционной деятельности в Российской Федерации, осуществляемой в форме капитальных вложений',
    title_en: 'On Investment Activities in the Russian Federation in the Form of Capital Investments',
    identifier: '39-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1999-02-25',
    classification: 'ingestable',
    description: 'Федеральный закон от 25.02.1999 № 39-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102057592',
  },

  // ── Occupational Safety ──
  {
    id: 'fz-116-1997',
    nd: '102048573',
    title: 'О промышленной безопасности опасных производственных объектов',
    title_en: 'On Industrial Safety of Hazardous Production Facilities',
    identifier: '116-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1997-07-21',
    classification: 'ingestable',
    description: 'Федеральный закон от 21.07.1997 № 116-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102048573',
  },

  // ── Audit ──
  {
    id: 'fz-307-2008',
    nd: '102127015',
    title: 'Об аудиторской деятельности',
    title_en: 'On Auditing Activities',
    identifier: '307-ФЗ',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '2009-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 30.12.2008 № 307-ФЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102127015',
  },

  // ── Data Localization (Amendments to 152-FZ) ──
  {
    id: 'fz-242-2014',
    nd: '102356419',
    title: 'О внесении изменений в отдельные законодательные акты Российской Федерации в части уточнения порядка обработки персональных данных в информационно-телекоммуникационных сетях',
    title_en: 'On Amendments to Legislative Acts on Processing Personal Data in Information Networks (Data Localization)',
    identifier: '242-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2015-09-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 21.07.2014 № 242-ФЗ (Закон о локализации данных)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102356419',
  },

  // ── Right to Be Forgotten ──
  {
    id: 'fz-264-2015',
    nd: '102376024',
    title: 'О внесении изменений в Федеральный закон «Об информации, информационных технологиях и о защите информации» и статьи 29 и 402 Гражданского процессуального кодекса Российской Федерации',
    title_en: 'On Amendments to the Federal Law "On Information" (Right to Be Forgotten)',
    identifier: '264-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2016-01-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 13.07.2015 № 264-ФЗ (Право на забвение)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102376024',
  },

  // ── Messaging Services / Bloggers ──
  {
    id: 'fz-97-2014',
    nd: '102352653',
    title: 'О внесении изменений в Федеральный закон «Об информации, информационных технологиях и о защите информации» и отдельные законодательные акты Российской Федерации по вопросам упорядочения обмена информацией с использованием информационно-телекоммуникационных сетей',
    title_en: 'On Amendments to the Federal Law "On Information" (Blogger Law)',
    identifier: '97-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2014-08-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 05.05.2014 № 97-ФЗ (Закон о блогерах)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102352653',
  },

  // ── Artificial Intelligence (Moscow Experiment) ──
  {
    id: 'fz-123-2020',
    nd: '102645241',
    title: 'О проведении эксперимента по установлению специального регулирования в целях создания необходимых условий для разработки и внедрения технологий искусственного интеллекта',
    title_en: 'On Conducting an Experiment on Special Regulation for AI Technologies Development',
    identifier: '123-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2020-07-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 24.04.2020 № 123-ФЗ (Эксперимент по ИИ в Москве)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102645241',
  },

  // ── Subsoil / Natural Resources ──
  {
    id: 'fz-2395-1992',
    nd: '102021338',
    title: 'О недрах',
    title_en: 'On Subsoil',
    identifier: '2395-1',
    law_type: 'federal_law',
    status: 'amended',
    effective_date: '1992-02-21',
    classification: 'ingestable',
    description: 'Закон РФ от 21.02.1992 № 2395-1',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102021338',
  },

  // ── Government ──
  {
    id: 'fkz-4-2020',
    nd: '102683251',
    title: 'О Правительстве Российской Федерации',
    title_en: 'On the Government of the Russian Federation',
    identifier: '4-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'in_force',
    effective_date: '2020-11-06',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 06.11.2020 № 4-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102683251',
  },

  // ── Constitutional Court ──
  {
    id: 'fkz-1-1994',
    nd: '102030785',
    title: 'О Конституционном Суде Российской Федерации',
    title_en: 'On the Constitutional Court of the Russian Federation',
    identifier: '1-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '1994-07-21',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 21.07.1994 № 1-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102030785',
  },

  // ── Supreme Court ──
  {
    id: 'fkz-3-2014',
    nd: '102349932',
    title: 'О Верховном Суде Российской Федерации',
    title_en: 'On the Supreme Court of the Russian Federation',
    identifier: '3-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '2014-02-05',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 05.02.2014 № 3-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102349932',
  },

  // ── Emergency ──
  {
    id: 'fkz-3-2001',
    nd: '102070908',
    title: 'О чрезвычайном положении',
    title_en: 'On the State of Emergency',
    identifier: '3-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '2001-05-30',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 30.05.2001 № 3-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102070908',
  },

  // ── Martial Law ──
  {
    id: 'fkz-1-2002',
    nd: '102074553',
    title: 'О военном положении',
    title_en: 'On Martial Law',
    identifier: '1-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '2002-01-30',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 30.01.2002 № 1-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102074553',
  },

  // ── Referendum ──
  {
    id: 'fkz-5-2004',
    nd: '102087817',
    title: 'О референдуме Российской Федерации',
    title_en: 'On the Referendum of the Russian Federation',
    identifier: '5-ФКЗ',
    law_type: 'federal_constitutional_law',
    status: 'amended',
    effective_date: '2004-06-28',
    classification: 'ingestable',
    description: 'Федеральный конституционный закон от 28.06.2004 № 5-ФКЗ',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102087817',
  },

  // ── VPN / Anonymizers ──
  {
    id: 'fz-276-2017',
    nd: '102438834',
    title: 'О внесении изменений в Федеральный закон «Об информации, информационных технологиях и о защите информации»',
    title_en: 'On Amendments to Federal Law "On Information" (VPN/Anonymizer Restrictions)',
    identifier: '276-ФЗ',
    law_type: 'federal_law',
    status: 'in_force',
    effective_date: '2017-11-01',
    classification: 'ingestable',
    description: 'Федеральный закон от 29.07.2017 № 276-ФЗ (О запрете анонимайзеров и VPN)',
    source_url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102438834',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Full Census
// ─────────────────────────────────────────────────────────────────────────────

export function getFullCensus(): CensusEntry[] {
  return [
    ...CONSTITUTION,
    ...CODES,
    ...FEDERAL_LAWS,
  ];
}

/**
 * Get census statistics by type
 */
export function getCensusStats(census: CensusEntry[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: census.length,
    ingestable: 0,
    ocr_needed: 0,
    inaccessible: 0,
    excluded: 0,
    constitution: 0,
    code: 0,
    federal_constitutional_law: 0,
    federal_law: 0,
    in_force: 0,
    amended: 0,
    repealed: 0,
    with_eu_references: 0,
  };

  for (const entry of census) {
    stats[entry.classification]++;
    stats[entry.law_type]++;
    stats[entry.status]++;
    if (entry.eu_references && entry.eu_references.length > 0) {
      stats.with_eu_references++;
    }
  }

  return stats;
}
