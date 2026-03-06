/**
 * Competency knowledge base — maps UNSIA target course names to known
 * equivalent course names from other universities. If a source course
 * name *includes* any of the listed equivalents it's considered a
 * competency-based match (score 1.0).
 *
 * Add / remove entries here to tune matching without touching the
 * algorithm in matching.ts.
 */
export const competencyMap: Record<string, string[]> = {
  // ── MKU / General ──────────────────────────────────────────────────
  'ICT Literacy': [
    'konsep dasar sistem informasi', 'pengantar teknologi informasi',
    'literasi teknologi informasi', 'dasar teknologi informasi',
    'pengantar komputer', 'pengantar teknologi komunikasi',
    'literasi digital', 'ict literacy',
  ],
  'Bahasa Inggris': [
    'bahasa inggris 1', 'bahasa inggris 2', 'bahasa inggris i', 'bahasa inggris ii',
    'english', 'english for business', 'english for academic purposes',
    'english communication', 'bahasa inggris bisnis',
  ],
  'Bahasa Indonesia': [
    'bahasa indonesia', 'bahasa indonesia akademik',
  ],
  'Bahasa Korea': ['bahasa korea', 'korean language'],
  'Pendidikan Pancasila': [
    'pancasila', 'pendidikan pancasila', 'pancasila dan kewarganegaraan',
  ],
  'Pancasila': [
    'pancasila', 'pendidikan pancasila', 'pancasila dan kewarganegaraan',
  ],
  'Pendidikan Kewarganegaraan': [
    'kewarganegaraan', 'pendidikan kewarganegaraan', 'pkn',
    'pendidikan kewargaan', 'civic education',
  ],
  'Kewarganegaraan': [
    'kewarganegaraan', 'pendidikan kewarganegaraan', 'pkn',
  ],
  'Pendidikan Agama': [
    'agama', 'pendidikan agama', 'pendidikan agama islam',
    'pendidikan agama kristen', 'pendidikan agama katolik',
    'pendidikan agama hindu', 'pendidikan agama buddha',
  ],
  'Agama': [
    'agama', 'pendidikan agama', 'pendidikan agama islam',
  ],
  'Estetika Humanisme': [
    'estetika humanisme', 'filsafat ilmu', 'ilmu sosial budaya dasar',
    'isbd', 'ilmu sosial dasar',
  ],
  'Kewirausahaan': [
    'kewirausahaan', 'pendidikan kewirausahaan', 'entrepreneurship',
    'technopreneurship', 'pengantar kewirausahaan',
  ],
  'Pendidikan Kewirausahaan': [
    'kewirausahaan', 'pendidikan kewirausahaan', 'entrepreneurship',
    'technopreneurship',
  ],

  // ── Matematika & Sains ─────────────────────────────────────────────
  'Kalkulus': [
    'kalkulus', 'kalkulus 1', 'kalkulus i', 'kalkulus dasar', 'matematika dasar',
  ],
  'Kalkulus I': [
    'kalkulus', 'kalkulus 1', 'kalkulus i', 'kalkulus dasar', 'matematika dasar',
  ],
  'Kalkulus II': ['kalkulus 2', 'kalkulus ii', 'kalkulus lanjut'],
  'Matematika Diskrit': [
    'matematika diskrit', 'discrete mathematics', 'logika matematika',
  ],
  'Aljabar Linier': [
    'aljabar linier', 'aljabar linear', 'aljabar matriks', 'aljabar linier dan matriks',
  ],
  'Aljabar Linear': [
    'aljabar linier', 'aljabar linear', 'aljabar matriks',
  ],
  'Statistika dan Probabilitas': [
    'statistika', 'statistik', 'probabilitas', 'statistika dan probabilitas',
    'statistik dan probabilitas', 'biostatistik',
  ],
  'Statistika dan Probabiltas': [
    'statistika', 'statistik', 'probabilitas',
    'statistika dan probabilitas', 'statistik dan probabilitas',
  ],
  'Statistik Ekonomi dan Bisnis': [
    'statistik', 'statistika', 'statistik ekonomi', 'statistik bisnis',
  ],
  'Metode Numerik': ['metode numerik', 'komputasi numerik', 'analisis numerik'],
  'Fisika Dasar': ['fisika', 'fisika dasar', 'fisika 1'],
  'Matematika Ekonomi dan Bisnis': [
    'matematika ekonomi', 'matematika bisnis', 'matematika ekonomi dan bisnis',
  ],

  // ── Pemrograman ────────────────────────────────────────────────────
  'Dasar Pemrograman': [
    'dasar pemrograman', 'pengantar pemrograman', 'pemrograman dasar',
    'algoritma dan pemrograman', 'dasar-dasar pemrograman',
    'introduction to programming', 'pemrograman komputer',
  ],
  'Dasar-Dasar Pemrograman': [
    'dasar pemrograman', 'pengantar pemrograman', 'pemrograman dasar',
    'algoritma dan pemrograman', 'dasar-dasar pemrograman',
  ],
  'Algoritma dan Pemrograman': [
    'algoritma', 'algoritma dan pemrograman', 'algoritma pemrograman',
    'pemrograman terstruktur', 'pemrograman prosedural',
  ],
  'Pemrograman Visual': [
    'pemrograman visual', 'visual programming', 'pemrograman visual basic',
  ],
  'Pemrograman Lanjut': [
    'pemrograman lanjut', 'pemrograman lanjutan', 'advanced programming',
  ],
  'Pemrograman Berorientasi Objek': [
    'pemrograman berorientasi objek', 'pbo', 'object oriented programming',
    'oop', 'pemrograman berbasis objek',
  ],
  'Pemrograman Web I': [
    'pemrograman web', 'pemrograman web 1', 'pemrograman web i',
    'pengembangan web', 'web programming',
  ],
  'Pemrograman Web II': [
    'pemrograman web 2', 'pemrograman web ii', 'pemrograman web lanjut',
    'pengembangan web lanjut',
  ],
  'Pengembangan Aplikasi Web I': [
    'pemrograman web', 'pemrograman web 1', 'pengembangan aplikasi web',
    'pengembangan web', 'web development',
  ],
  'Pengembangan Aplikasi Web II': [
    'pemrograman web 2', 'pemrograman web lanjut', 'pengembangan web lanjut',
    'pengembangan aplikasi web 2',
  ],
  'Pemrograman Berbasis Web': [
    'pemrograman web', 'pemrograman berbasis web', 'web programming',
  ],
  'Pemrograman PL/SQL': [
    'pemrograman sql', 'pemrograman pl/sql', 'sql', 'basis data lanjut',
  ],
  'Pemrograman SQL': [
    'pemrograman sql', 'sql', 'basis data', 'pemrograman pl/sql',
  ],
  'Pemrograman Bergerak': [
    'pemrograman mobile', 'pemrograman bergerak', 'mobile programming',
    'pengembangan aplikasi mobile', 'pemrograman perangkat bergerak',
  ],
  'Pemrograman Bergerak (Mobile)': [
    'pemrograman mobile', 'pemrograman bergerak', 'mobile programming',
  ],
  'Pemrograman Perangkat Bergerak': [
    'pemrograman mobile', 'pemrograman bergerak', 'mobile programming',
    'pemrograman perangkat bergerak',
  ],

  // ── Sistem & Jaringan ──────────────────────────────────────────────
  'Struktur Data dan Algoritma': [
    'struktur data', 'struktur data dan algoritma', 'data structure',
  ],
  'Struktur Data': [
    'struktur data', 'struktur data dan algoritma', 'data structure',
  ],
  'Sistem Operasi': [
    'sistem operasi', 'operating system', 'operating systems',
  ],
  'Arsitektur dan Organisasi Komputer': [
    'arsitektur komputer', 'organisasi komputer', 'arsitektur dan organisasi komputer',
  ],
  'Organisasi dan Arsitektur Komputer': [
    'arsitektur komputer', 'organisasi komputer', 'arsitektur dan organisasi komputer',
  ],
  'Sistem Digital': ['sistem digital', 'logika digital', 'teknik digital'],
  'Jaringan Komputer': [
    'jaringan komputer', 'jarkom', 'computer network', 'sistem jaringan',
  ],
  'Sistem Jaringan I': [
    'jaringan komputer', 'sistem jaringan', 'jaringan komputer 1',
  ],
  'Sistem Jaringan II': [
    'jaringan komputer 2', 'jaringan komputer lanjut', 'sistem jaringan 2',
  ],
  'Komunikasi Data': [
    'komunikasi data', 'data communication', 'komunikasi data dan komputer',
  ],
  'Komunikasi Data dan Komputer': [
    'komunikasi data', 'data communication', 'jaringan komunikasi data',
  ],
  'Komunikasi Data dan Jaringan Komputer': [
    'komunikasi data', 'jaringan komputer', 'komunikasi data dan jaringan',
  ],

  // ── Basis Data ─────────────────────────────────────────────────────
  'Sistem Basis Data': [
    'basis data', 'database', 'sistem basis data', 'pengantar basis data',
    'manajemen basis data',
  ],

  // ── Keamanan ───────────────────────────────────────────────────────
  'Dasar Keamanan Komputer': [
    'keamanan komputer', 'keamanan informasi', 'keamanan siber',
    'pengantar keamanan', 'keamanan sistem',
  ],
  'Pengantar Keamanan Siber': [
    'keamanan komputer', 'keamanan siber', 'keamanan informasi',
    'cyber security', 'information security',
  ],
  'Keamanan Sistem Informasi': [
    'keamanan sistem', 'keamanan informasi', 'keamanan komputer',
  ],
  'Kriptografi dan Steganografi': [
    'kriptografi', 'steganografi', 'kriptografi dan steganografi',
  ],

  // ── AI / Data ──────────────────────────────────────────────────────
  'Kecerdasan Buatan': [
    'kecerdasan buatan', 'artificial intelligence', 'ai',
    'pengantar kecerdasan buatan',
  ],
  'Machine Learning': ['machine learning', 'pembelajaran mesin'],
  'Deep Learning': ['deep learning', 'pembelajaran mendalam'],
  'Data Mining': ['data mining', 'penambangan data'],
  'Data Science': ['data science', 'ilmu data', 'sains data'],
  'Natural Language Processing': [
    'nlp', 'natural language processing', 'pengolahan bahasa alami',
  ],

  // ── RPL & Manajemen Proyek ─────────────────────────────────────────
  'Rekayasa Perangkat Lunak': [
    'rekayasa perangkat lunak', 'rpl', 'software engineering',
  ],
  'Interaksi Manusia Komputer': [
    'interaksi manusia komputer', 'imk', 'interaksi manusia dan komputer',
    'human computer interaction', 'hci',
  ],
  'Interaksi Manusia dan Komputer': [
    'interaksi manusia komputer', 'imk', 'interaksi manusia dan komputer',
  ],
  'Analisa Berorientasi Objek': [
    'analisa berorientasi objek', 'analisis berorientasi objek', 'ooad',
    'analisis dan desain berorientasi objek',
  ],
  'Analisis dan Perancangan Sistem Informasi': [
    'analisis perancangan sistem', 'analisis dan perancangan sistem',
    'perancangan sistem informasi',
  ],
  'Manajemen Proyek Sistem Informasi': [
    'manajemen proyek', 'manajemen proyek ti', 'project management',
  ],

  // ── Akuntansi & Ekonomi ────────────────────────────────────────────
  'Pengantar Akuntansi 1': [
    'pengantar akuntansi', 'akuntansi dasar', 'akuntansi 1', 'akuntansi i',
    'dasar akuntansi',
  ],
  'Pengantar Akuntansi 2': [
    'pengantar akuntansi 2', 'akuntansi 2', 'akuntansi ii', 'akuntansi lanjutan',
  ],
  'Akuntansi Keuangan 1': [
    'akuntansi keuangan', 'akuntansi keuangan 1', 'akuntansi keuangan menengah',
  ],
  'Akuntansi Keuangan 2': [
    'akuntansi keuangan 2', 'akuntansi keuangan lanjutan',
    'akuntansi keuangan menengah 2',
  ],
  'Akuntansi Biaya': ['akuntansi biaya', 'cost accounting'],
  'Akuntansi Manajemen': ['akuntansi manajemen', 'management accounting'],
  'Akuntansi Sektor Publik': ['akuntansi sektor publik', 'akuntansi pemerintahan'],
  'Teori Akuntansi': ['teori akuntansi', 'accounting theory'],
  'Sistem Informasi Akuntansi': [
    'sistem informasi akuntansi', 'sia', 'accounting information system',
  ],
  'Ekonomi Mikro': [
    'ekonomi mikro', 'pengantar ekonomi mikro', 'mikroekonomi',
    'teori ekonomi mikro',
  ],
  'Ekonomi Makro': [
    'ekonomi makro', 'pengantar ekonomi makro', 'makroekonomi',
    'teori ekonomi makro',
  ],
  'Pengantar Manajemen': [
    'pengantar manajemen', 'manajemen umum', 'dasar manajemen',
    'manajemen', 'manajemen dasar',
  ],
  'Manajemen Umum': [
    'pengantar manajemen', 'manajemen umum', 'dasar manajemen',
  ],
  'Manajemen Keuangan 1': [
    'manajemen keuangan', 'manajemen keuangan 1', 'manajemen keuangan i',
  ],
  'Manajemen Keuangan 2': [
    'manajemen keuangan 2', 'manajemen keuangan ii', 'manajemen keuangan lanjutan',
  ],
  'Hukum Bisnis': ['hukum bisnis', 'hukum dagang', 'aspek hukum bisnis'],
  'Komunikasi Bisnis': ['komunikasi bisnis', 'business communication'],
  'Pengantar Perpajakan': [
    'pengantar perpajakan', 'perpajakan', 'dasar perpajakan',
  ],
  'Perpajakan 1': ['perpajakan 1', 'perpajakan i', 'hukum pajak'],
  'Perpajakan 2': ['perpajakan 2', 'perpajakan ii', 'perpajakan lanjutan'],
  'Digital Auditing 1': [
    'auditing', 'audit', 'auditing 1', 'pengauditan', 'digital auditing',
  ],
  'Digital Auditing 2': ['auditing 2', 'auditing lanjutan', 'digital auditing 2'],
  'Perilaku Organisasi': ['perilaku organisasi', 'organizational behavior'],
  'Manajemen Stratejik': ['manajemen stratejik', 'manajemen strategis', 'strategic management'],
  'Manajemen Risiko': ['manajemen risiko', 'risk management'],
  'Metode Penelitian Akuntansi': [
    'metode penelitian', 'metodologi penelitian', 'research methodology',
  ],

  // ── Sistem Informasi ──────────────────────────────────────────────
  'Pengantar Teknologi Sistem Informasi': [
    'pengantar teknologi informasi', 'pengantar sistem informasi',
    'konsep teknologi informasi',
  ],
  'Pengantar Sistem Informasi Bisnis': [
    'sistem informasi bisnis', 'pengantar sistem informasi',
    'sistem informasi manajemen',
  ],
  'Manajemen Teknologi Sistem Informasi': [
    'manajemen teknologi informasi', 'tata kelola ti',
  ],
  'Analisis Proses Bisnis': [
    'analisis proses bisnis', 'proses bisnis', 'business process',
  ],
  'Teori Prilaku Organisasi': [
    'perilaku organisasi', 'teori organisasi', 'organizational behavior',
  ],
  'Business Intelligent': [
    'business intelligence', 'business intelligent', 'inteligensia bisnis',
  ],
  'E-Business': ['e-business', 'ebusiness', 'electronic business'],
  'E-Commerce': ['e-commerce', 'ecommerce', 'electronic commerce'],
  'Enterprise Resource Planning': [
    'enterprise resource planning', 'erp', 'sistem erp',
  ],
  'Arsitektur Sistem Enterprise': [
    'arsitektur enterprise', 'enterprise architecture', 'arsitektur sistem enterprise',
  ],

  // ── Cloud & IoT ────────────────────────────────────────────────────
  'Cloud Computing': ['cloud computing', 'komputasi awan', 'komputasi awan dan virtualisasi'],
  'Komputasi Awan dan Virtualisasi': [
    'cloud computing', 'komputasi awan', 'virtualisasi',
  ],
  'IoT (Internet of Things)': [
    'iot', 'internet of things', 'pemrograman platform dan iot',
  ],
  'Pemrograman Platform dan IoT': [
    'iot', 'internet of things', 'platform iot',
  ],

  // ── Komunikasi ─────────────────────────────────────────────────────
  'Komunikasi Massa': ['komunikasi massa', 'mass communication'],
  'Pengantar Komunikasi Digital': [
    'pengantar komunikasi', 'ilmu komunikasi', 'pengantar ilmu komunikasi',
  ],
  'Pengantar Corporate Communication': [
    'corporate communication', 'komunikasi korporat', 'komunikasi organisasi',
  ],
  'Teori Komunikasi Digital': ['teori komunikasi', 'communication theory'],
  'Digital Marketing Communication': [
    'digital marketing', 'marketing communication', 'komunikasi pemasaran',
  ],
  'Digital Marketing': ['digital marketing', 'pemasaran digital'],
  'Statistika Sosial': ['statistika sosial', 'statistik sosial', 'statistika'],
  'Metode Penelitian Kuantitatif': [
    'metode penelitian kuantitatif', 'metodologi penelitian kuantitatif',
    'metode penelitian',
  ],
  'Metode Penelitian Kualitatif': [
    'metode penelitian kualitatif', 'metodologi penelitian kualitatif',
  ],
  'Desain Komunikasi Visual': [
    'desain komunikasi visual', 'dkv', 'desain grafis',
  ],

  // ── Metodologi Penelitian (general) ────────────────────────────────
  'Metodologi Penelitian Teknologi Informasi': [
    'metodologi penelitian', 'metode penelitian', 'research methodology',
    'metode riset',
  ],
  'Metodologi Penelitian dan Penulisan Ilmiah': [
    'metodologi penelitian', 'penulisan ilmiah', 'metode penelitian',
  ],
  'Metodologi Riset dan Penulisan Ilmiah SI': [
    'metodologi penelitian', 'penulisan ilmiah', 'metode riset',
  ],

  // ── Teori Informasi ───────────────────────────────────────────────
  'Teori Informasi': ['teori informasi', 'information theory'],

  // ── Grafika & Multimedia ───────────────────────────────────────────
  'Grafika Komputer': ['grafika komputer', 'computer graphics'],
  'Sistem Multimedia': ['multimedia', 'sistem multimedia'],
  'Pengolahan Citra': ['pengolahan citra', 'image processing'],
  'Visi Komputer': ['visi komputer', 'computer vision', 'pengolahan citra'],
}
