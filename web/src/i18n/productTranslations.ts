import type { Locale } from "./types";

type ProductLocaleEntry = { name: string; description: string };

export const productI18n: Partial<
  Record<string, Partial<Record<Exclude<Locale, "ru">, ProductLocaleEntry>>>
> = {
  e1: {
    en: {
      name: "Wireless Noise-Canceling Headphones",
      description:
        "Premium full-size headphones with 30-hour battery, active noise cancellation and crystal-clear sound.",
    },
    ky: {
      name: "Шумдуктоочусуз зымдуу гарнитура",
      description:
        "30 сааттык батарея, активдүү шумдуктоочуу жана таза үн менен премиум толук көлөмдүү гарнитура.",
    },
  },
  e2: {
    en: {
      name: '4K Smart TV 55"',
      description:
        "Ultra HD 4K display with HDR, built-in streaming apps and voice control.",
    },
    ky: {
      name: '4K Smart TV 55"',
      description:
        "HDR, киргизилген стриминг колдонмолору жана үн менен башкаруу менен Ultra HD 4K дисплей.",
    },
  },
  e3: {
    en: {
      name: "Portable Bluetooth Speaker",
      description:
        "Waterproof portable speaker with 360° surround sound and 12 hours of playback.",
    },
    ky: {
      name: "Көчмө Bluetooth колонка",
      description:
        "Суукка төзөмдүү көчмө колонка, 360° үн жана 12 саат ойнотуу.",
    },
  },
  e4: {
    en: {
      name: "Smartwatch with Fitness Tracker",
      description:
        "Heart rate monitor, GPS, sleep tracking and 7-day battery life.",
    },
    ky: {
      name: "Фитнес трекери бар акылдуу саат",
      description:
        "Жүрөк ыргагы монитору, GPS, уктоо көзөмөлү жана 7 күндүк батарея.",
    },
  },
  c1: {
    en: {
      name: 'Ultra-Slim 15.6" Laptop',
      description:
        "Intel Core i5, 16 GB RAM, 512 GB SSD. Ideal for work and entertainment.",
    },
    ky: {
      name: '15,6" ультра жеңил ноутбук',
      description:
        "Intel Core i5, 16 ГБ ой жады, 512 ГБ SSD. Иш жана көрңгүзүү үчүн идеалдуу.",
    },
  },
  c2: {
    en: {
      name: "RGB Mechanical Gaming Keyboard",
      description:
        "Cherry MX switches, per-key RGB backlighting and aluminum frame.",
    },
    ky: {
      name: "RGB механикалык оюн клавиатурасы",
      description:
        "Cherry MX өткөргүчтөр, ар бир баскычта RGB жана алюминий каркас.",
    },
  },
  c3: {
    en: {
      name: "Wireless Ergonomic Mouse",
      description: "Silent clicks, adjustable DPI and rechargeable battery.",
    },
    ky: {
      name: "Зымдуу эргономикалык чычкан",
      description: "Тынч чыкылдактар, тууралануучу DPI жана кайра заряддалуучу батарея.",
    },
  },
  c4: {
    en: {
      name: '27" 144 Hz Monitor',
      description:
        "QHD resolution, 1 ms response time, AMD FreeSync support.",
    },
    ky: {
      name: '27" 144 Гц монитор',
      description:
        "QHD чечилиши, 1 мс жооп берүү убактысы, AMD FreeSync колдоосу.",
    },
  },
  b1: {
    en: {
      name: "The Art of Programming",
      description:
        "Comprehensive guide to modern software development practices.",
    },
    ky: {
      name: "Программалоо искусствосу",
      description:
        "Заманбап программалык камсыздоону иштеп чыгуунун толук колдонмосу.",
    },
  },
  b2: {
    en: {
      name: "Midnight Mystery",
      description:
        "Gripping thriller that keeps you on edge until the last page.",
    },
    ky: {
      name: "Түн ортосунун жашырыны",
      description:
        "Акыркы баракка чейин кызыктырган триллер.",
    },
  },
  b3: {
    en: {
      name: "Healthy Kitchen Made Simple",
      description: "Over 200 nutritious recipes for busy families.",
    },
    ky: {
      name: "Ден соолук ашкана — жөнөкөй",
      description: "Бош эмес үй-бүлөлөр үчүн 200дөн ашык пайдалуу рецепттер.",
    },
  },
  b4: {
    en: {
      name: "Illustrated World History",
      description: "Stunning visual journey through human history.",
    },
    ky: {
      name: "Сүрөттөлгөн дүйнөлүк тарых",
      description: "Адамзат тарыхы боюнча кереметтүү визуалдык саякат.",
    },
  },
  cl1: {
    en: {
      name: "Classic Cotton T-Shirt Set",
      description:
        "Soft 100% cotton tees in assorted colors. Set of 3.",
    },
    ky: {
      name: "Классикалык пахта футболка комплекти",
      description:
        "Жумшак 100% пахта футболкалар, түрдүү түстөрдө. 3 даанадан.",
    },
  },
  cl2: {
    en: {
      name: "Slim Fit Jeans",
      description:
        "Stretch denim with modern slim fit and classic 5-pocket design.",
    },
    ky: {
      name: "Slim fit джинсы",
      description:
        "Заманбап slim fit жана классикалык 5 кармактуу дизайн.",
    },
  },
  cl3: {
    en: {
      name: "Winter Down Jacket",
      description:
        "Warm insulated jacket with water-repellent shell and hood.",
    },
    ky: {
      name: "Кышкы жүндүк куртка",
      description:
        "Жылуу изоляцияланган куртка, сууну кайтаруучу кабык жана капюшон.",
    },
  },
  cl4: {
    en: {
      name: "Running Sneakers",
      description:
        "Lightweight mesh upper with responsive cushioning for daily runs.",
    },
    ky: {
      name: "Чуркоо кроссовкалары",
      description:
        "Жеңил тор экинчи катмар жана күнүмдүк чуркоо үчүн жооп берүүчү амортизация.",
    },
  },
  hk1: {
    en: {
      name: "10-Piece Stainless Steel Cookware Set",
      description:
        "Professional pots and pans with even heat distribution.",
    },
    ky: {
      name: "10 даанадан түздүктөн жасалган казан-таган комплекти",
      description:
        "Тең жылуулукту таратуу менен профессионалдык казандар жана таңдайлар.",
    },
  },
  hk2: {
    en: {
      name: "Programmable Coffee Maker",
      description:
        "12-cup capacity with auto shut-off and reusable filter.",
    },
    ky: {
      name: "Программалануучу кофе машинасы",
      description:
        "12 чашкалык көлөм, автоматтык өчүрүү жана кайра колдонууга болгон фильтр.",
    },
  },
  hk3: {
    en: {
      name: "Memory Foam Pillow Set",
      description:
        "Memory foam with cooling gel for optimal neck support. Set of 2.",
    },
    ky: {
      name: "Эс түрүү көрүпкөсүнүн көтөрүч жастыгы",
      description:
        "Оңтолгон моюн колдоосу үчүн эс түрүү көрүпкөсү жана муздатуу гели. 2 даана.",
    },
  },
  hk4: {
    en: {
      name: "Robot Vacuum Cleaner",
      description:
        "Smart mapping, app control and 120 minutes of runtime.",
    },
    ky: {
      name: "Робот шаңсыздык тазалооч",
      description:
        "Акылдуу карта түзүү, колдонмо менен башкаруу жана 120 мүнөт иштөө.",
    },
  },
  so1: {
    en: {
      name: "Premium 6mm Yoga Mat",
      description:
        "Non-slip surface with carrying strap. Eco-friendly TPE material.",
    },
    ky: {
      name: "Премиум 6 мм йога матасы",
      description:
        "Тайганбооч бет, ташуу белдемчиги. Эколигиялык TPE материал.",
    },
  },
  so2: {
    en: {
      name: "4-Person Tent",
      description:
        "Waterproof dome tent with easy setup and ventilation windows.",
    },
    ky: {
      name: "4 кишилик чатыр",
      description:
        "Суукка төзөмдүү купол формалуу чатыр, оңой орнотуу жана вентиляция терезелери.",
    },
  },
  so3: {
    en: {
      name: "Adjustable Dumbbells up to 50 lbs",
      description:
        "Compact adjustable dumbbells from 5 to 50 lbs each.",
    },
    ky: {
      name: "50 фунтка чейин тууралануучу гантель",
      description:
        "Ар бири 5тен 50 фунтка чейин ыкчам тууралануучу гантельдер.",
    },
  },
  so4: {
    en: {
      name: "21-Speed Mountain Bike",
      description:
        "Aluminum frame, front suspension and disc brakes.",
    },
    ky: {
      name: "21 ылдамдык тоо велосипеди",
      description:
        "Алюминий каркас, алдыңкы амортизация жана диск тежебети.",
    },
  },
  be1: {
    en: {
      name: "5-Piece Skincare Set",
      description:
        "Cleanser, toner, serum, moisturizer and eye cream.",
    },
    ky: {
      name: "5 даанадан тери кам көрүү комплекти",
      description:
        "Тазалоочу, тоник, сыворотка, нымдоочу крем жана көз креми.",
    },
  },
  be2: {
    en: {
      name: "Professional Hair Dryer",
      description:
        "Ionic technology reduces frizz and dries hair 50% faster.",
    },
    ky: {
      name: "Профессионалдык чач кургаткыч",
      description:
        "Иондук технология булайттын азайтуусу жана 50% тез кургатуу.",
    },
  },
  be3: {
    en: {
      name: "Organic Shampoo and Conditioner",
      description:
        "Sulfate-free formula with argan oil and keratin.",
    },
    ky: {
      name: "Органикалык шампунь жана кондиционер",
      description:
        "Сульфатсыз формула, арган майы жана кератин менен.",
    },
  },
  be4: {
    en: {
      name: "Electric Toothbrush Pro",
      description:
        "5 cleaning modes, 2-minute timer and 30-day battery life.",
    },
    ky: {
      name: "Pro электр тиш щёткасы",
      description:
        "5 тазалоо режими, 2 мүнөтттүк таймер жана 30 күндүк батарея.",
    },
  },
  tg1: {
    en: {
      name: "500-Piece Building Block Set",
      description:
        "Compatible building bricks with storage container. Ages 4+.",
    },
    ky: {
      name: "500 даанадан куруу блок комплекти",
      description:
        "Сактоо контейнери менен шаармаштык куруу кирпичтери. 4 жастан баштап.",
    },
  },
  tg2: {
    en: {
      name: "Family Board Game",
      description:
        "Classic strategy game for 2–6 players. Hours of engaging fun.",
    },
    ky: {
      name: "Үй-бүлөлүк настольная оюну",
      description:
        "2–6 оюнчу үчүн классикалык стратегиялык оюн. Сааттар бою ээлеп кетчү убакыт.",
    },
  },
  tg3: {
    en: {
      name: "4K RC Quadcopter with Remote",
      description:
        "GPS return to home, 25-minute flight and 4K camera.",
    },
    ky: {
      name: "4K камералуу квадрокоптер",
      description:
        "GPS үйгө кайтуу, 25 мүнөт учуу жана 4K камера.",
    },
  },
  tg4: {
    en: {
      name: "Large Plush Teddy Bear",
      description:
        "Super-soft 60 cm teddy bear. Perfect gift for any age.",
    },
    ky: {
      name: "Чоң жумшак аюу оюнчук",
      description:
        "60 см супер жумшак аюу. Кандай курада болбосун сыйлык.",
    },
  },
  gr1: {
    en: {
      name: "Organic Coffee Beans, 900 g",
      description: "Single-origin medium roast Arabica.",
    },
    ky: {
      name: "Органикалык кофе зерендери, 900 г",
      description: "Бир чыккан жерден орто кууралган арабика.",
    },
  },
  gr2: {
    en: {
      name: "Premium Extra Virgin Olive Oil",
      description:
        "Cold-pressed Italian olive oil. Rich fruity flavor.",
    },
    ky: {
      name: "Премиум Extra Virgin зайтун майы",
      description:
        "Суугу кысым итальян зайтун майы. Жанада жемиштүү даам.",
    },
  },
  gr3: {
    en: {
      name: "Trail Mix Nuts and Dried Fruit, 1.4 kg",
      description:
        "Roasted almonds, cashews, walnuts and dried cranberries.",
    },
    ky: {
      name: "Жаңгак жана кургак жемиш аралашмасы, 1,4 кг",
      description:
        "Курулган бадем, жаңгак, жөгөр жаңгак жана кургак клюква.",
    },
  },
  gr4: {
    en: {
      name: "Dark Chocolate Assortment",
      description:
        "Belgian dark chocolate truffles. 24-piece gift box.",
    },
    ky: {
      name: "Кара шоколад ассорти",
      description:
        "Бельгия кара шоколад трюфельдери. 24 даанадан сыйлык коробкасы.",
    },
  },
  au1: {
    en: {
      name: "Magnetic Car Phone Mount",
      description:
        "Secure 360° magnetic mount for dashboard or vent.",
    },
    ky: {
      name: "Магниттүү унаа телефон кармакчысы",
      description:
        "Панель же аба тазалагычка 360° магниттүү бекем кармоо.",
    },
  },
  au2: {
    en: {
      name: "Portable Jump Starter 2000A",
      description:
        "Start any vehicle plus USB ports for charging devices.",
    },
    ky: {
      name: "Көчмө 2000A кубаттуулуктагы жүргүзгүч",
      description:
        "Ар кандай унааны иштетүү жана түзмөктөрдү заряддоочу USB порттор.",
    },
  },
  au3: {
    en: {
      name: "All-Season Floor Mat Set",
      description: "Custom-fit rubber mats. Easy to clean, odor-free.",
    },
    ky: {
      name: "Төрт мезгилдик коврик комплекти",
      description: "Өлчөмү боюнча резина ковриктер. Тазалоо оңой, жыты жок.",
    },
  },
  au4: {
    en: {
      name: "Front and Rear Dash Cam",
      description: "1080p recording, night vision and parking mode.",
    },
    ky: {
      name: "Алдыңкы жана арткы видеорегистратор",
      description: "1080p жазуу, түнкү көрүү жана токтотмо режими.",
    },
  },
  ga1: {
    en: {
      name: "8-Piece Garden Tool Set",
      description:
        "Stainless steel tools with ergonomic handles and storage bag.",
    },
    ky: {
      name: "8 даанадан боорак асаптар комплекти",
      description:
        "Эргономикалык колдор менен түздүктөн жасалган аспаптар жана сактоо сумкасы.",
    },
  },
  ga2: {
    en: {
      name: "15 m Patio String Lights",
      description: "Weatherproof LED bulbs for outdoor relaxation.",
    },
    ky: {
      name: "15 м терраса гирляндалары",
      description: "Ачык абада эс алуу үчүн бардык аба ырайына төзөмдүү LED чырактар.",
    },
  },
  ga3: {
    en: {
      name: "Raised Garden Bed Kit",
      description: "Cedar planter box. Easy assembly without tools.",
    },
    ky: {
      name: "Көтөрүлгөн боуруң комплекти",
      description: "Кедр өсүмдүк кутусу. Аспапсыз оңой жыйноо.",
    },
  },
  ga4: {
    en: {
      name: "30 m Hose Reel",
      description: "Automatic hose reel with 9-mode spray nozzle.",
    },
    ky: {
      name: "30 м шланг катушкасы",
      description: "9 режимдүү чачыраткыч менен автоматтык шланг катушкасы.",
    },
  },
  he1: {
    en: {
      name: "Digital Blood Pressure Monitor",
      description:
        "Clinically validated device with large LCD display and measurement memory.",
    },
    ky: {
      name: "Санариптик кан басымы өлчөгүч",
      description:
        "Чоң ЖК дисплей жана өлчөмдөрдү сактоо менен клиникалык текшерилген прибор.",
    },
  },
  he2: {
    en: {
      name: "200-Piece First Aid Kit",
      description: "Complete kit for home, car and travel.",
    },
    ky: {
      name: "200 даанадан биринчи жардам комплекти",
      description: "Үй, унаа жана саякат үчүн толук комплект.",
    },
  },
  he3: {
    en: {
      name: "Whey Protein, 2.3 kg",
      description: "25 g protein per serving. Vanilla flavor, 75 servings.",
    },
    ky: {
      name: "Сывороткалык протеин, 2,3 кг",
      description: "Бир порцияда 25 г белок. Ваниль даамы, 75 порция.",
    },
  },
  he4: {
    en: {
      name: "HEPA Air Purifier",
      description:
        "Captures 99.97% of allergens. Suitable for rooms up to 46 m².",
    },
    ky: {
      name: "HEPA аба тазалооч",
      description:
        "Аллергендин 99,97% кармайт. 46 м² чейинки бөлмөлөр үчүн ыңгайлуу.",
    },
  },
  pe1: {
    en: {
      name: "Premium Dog Food, 14 kg",
      description: "Grain-free recipe with real chicken. For adult dogs.",
    },
    ky: {
      name: "Премиум ит тукузу, 14 кг",
      description: "Чыныгы тоок эти менен дансыз рецепт. Чоң иттер үчүн.",
    },
  },
  pe2: {
    en: {
      name: "183 cm Cat Scratching Tower",
      description:
        "Multi-level cat tree with sisal posts and cozy condos.",
    },
    ky: {
      name: "183 см мышык когот тырмоосу",
      description:
        "Сизал столбдору жана жупун үйчөлөрү менен көп деңгээлдүү мышык манарасы.",
    },
  },
  pe3: {
    en: {
      name: "Automatic Pet Feeder",
      description: "Programmable portions up to 4 feedings per day.",
    },
    ky: {
      name: "Автоматтык үй жаныбар тамактандыргыч",
      description: "Күнүнө 4 жолу чейин программалануучу порциялар.",
    },
  },
  pe4: {
    en: {
      name: "Dog Leash and Harness Set",
      description:
        "No-pull harness with reflective stitching. Adjustable sizes.",
    },
    ky: {
      name: "Ит поводугу жана шлейка комплекти",
      description:
        "Чагылыштыруучу тикеме менен тартууга каршы шлейка. Тууралануучу өлчөмдөр.",
    },
  },
  of1: {
    en: {
      name: "Ergonomic Office Chair",
      description:
        "Lumbar support, adjustable armrests and breathable mesh back.",
    },
    ky: {
      name: "Эргономикалык офис креслосу",
      description:
        "Бел колдоосу, тууралануучу кол аркандар жана дем тартуучу тор арткы бет.",
    },
  },
  of2: {
    en: {
      name: "Standing Desk Converter",
      description: "Sit-stand riser with dual monitor support.",
    },
    ky: {
      name: "Турган жумуш үстөлү адаптери",
      description: "Эки монитор колдоосу менен отурган-туруган режим.",
    },
  },
  of3: {
    en: {
      name: "Portable Label Printer",
      description:
        "Prints labels up to 12 mm. QWERTY keyboard and 200+ symbols.",
    },
    ky: {
      name: "Көчмө этикетка принтери",
      description:
        "12 мм чейин этикетка басып чыгаруу. QWERTY клавиатура жана 200+ символ.",
    },
  },
  of4: {
    en: {
      name: "Cross-Cut Paper Shredder",
      description: "Shreds 8 sheets at once. 15-liter bin capacity.",
    },
    ky: {
      name: "Кесмелештирген кагаз өлчүүч",
      description: "Бир жолу 8 баракты кесет. 15 литрлук контейнер.",
    },
  },
  jw1: {
    en: {
      name: "Sterling Silver Necklace",
      description: "Elegant pendant necklace with 45 cm chain.",
    },
    ky: {
      name: "Күмүш көбөлчөк",
      description: "45 см чынжыр менен сымбаттуу кулпанак көбөлчөк.",
    },
  },
  jw2: {
    en: {
      name: "Diamond Stud Earrings",
      description: "Total weight 1/4 carat. 14K white gold setting.",
    },
    ky: {
      name: "Гаухар тасман сүйрүүчү сөйкөлөр",
      description: "Жалпы салмак 1/4 карат. 14K ак алтын кебенде.",
    },
  },
  jw3: {
    en: {
      name: "Classic Leather Strap Watch",
      description:
        "Japanese quartz movement with genuine leather strap.",
    },
    ky: {
      name: "Классикалык тери ремни сааты",
      description:
        "Жапон кварц механизми жана натуральдык тери ремни.",
    },
  },
  jw4: {
    en: {
      name: "Natural Stone Bracelet Set",
      description:
        "Natural stone beads with adjustable elastic band.",
    },
    ky: {
      name: "Табигый таш браслет комплекти",
      description:
        "Тууралануучу эластик тасма менен табигый таш мончуктар.",
    },
  },
  ba1: {
    en: {
      name: "3-in-1 Baby Stroller",
      description: "Includes infant car seat, stroller and base.",
    },
    ky: {
      name: "3 в 1 балдар арбасы",
      description: "Чакалак автокреслосу, арба жана база кирет.",
    },
  },
  ba2: {
    en: {
      name: "Organic Baby Bodysuits, 5-Pack",
      description: "Soft organic cotton with snap closures.",
    },
    ky: {
      name: "Органикалык балдар боди, 5 даана",
      description: "Жумшак органикалык пахта, кнопкалар менен.",
    },
  },
  ba3: {
    en: {
      name: "HD Baby Monitor",
      description: "Two-way audio, night vision and smartphone app.",
    },
    ky: {
      name: "HD видео няня",
      description: "Эки тараптуу аудио, түнкү көрүү жана смартфон колдонмосу.",
    },
  },
  ba4: {
    en: {
      name: "Diaper Backpack",
      description:
        "Insulated bottle pockets, changing mat and stroller straps.",
    },
    ky: {
      name: "Бөжөк рюкзагы",
      description:
        "Изоляцияланган бөтөлкө кармандары, алмаштыруу коврик жана арба белдемчиги.",
    },
  },
  mm1: {
    en: {
      name: "4K Blu-ray Movie Collection",
      description: "5 blockbuster films in stunning 4K Ultra HD quality.",
    },
    ky: {
      name: "4K Blu-ray тасма коллекциясы",
      description: "Кереметтүү 4K Ultra HD сапатта 5 блокбастер тасма.",
    },
  },
  mm2: {
    en: {
      name: "Retro Vinyl Record Player",
      description:
        "Built-in speakers, Bluetooth and 3-speed turntable.",
    },
    ky: {
      name: "Ретро винил проигрыватель",
      description:
        "Киргизилген динамиктер, Bluetooth жана 3 ылдамдык.",
    },
  },
  mm3: {
    en: {
      name: "Wireless Headphones Pro",
      description:
        "Active noise cancellation and 24 hours total battery life.",
    },
    ky: {
      name: "Pro зымдуу гарнитура",
      description:
        "Активдүү шумдуктоочуу жана 24 сааттык батарея.",
    },
  },
  mm4: {
    en: {
      name: "Acoustic Guitar Starter Pack",
      description:
        "Full-size guitar with case, tuner, picks and strap.",
    },
    ky: {
      name: "Акустикалык гитара башталгыч комплекти",
      description:
        "Чехол, тюнер, медиатор жана ремен менен толук көлөмдүү гитара.",
    },
  },
  to1: {
    en: {
      name: "Cordless Drill/Driver",
      description:
        "20V lithium-ion with 2 batteries and 30-piece bit set.",
    },
    ky: {
      name: "Аккумулятордук дрель-шуруповёрт",
      description:
        "2 батарея жана 30 даанадан насадка менен 20V литий-ион.",
    },
  },
  to2: {
    en: {
      name: "48 cm Tool Box",
      description:
        "Durable plastic with removable tray and metal latches.",
    },
    ky: {
      name: "48 см аспаптар жашыгы",
      description:
        "Чыгарылуучу лоток жана металл защёлкалар менен туруктуу пластик.",
    },
  },
  to3: {
    en: {
      name: "Self-Leveling Laser Level",
      description: "Cross-line laser with magnetic swivel base.",
    },
    ky: {
      name: "Өзүн-өзү теңдеген лазердик деңгээл",
      description: "Магниттүү айлануучу негиз менен крест таза сызык.",
    },
  },
  to4: {
    en: {
      name: "40-Piece Socket and Wrench Set",
      description:
        "Chrome vanadium steel in carrying case. Metric and imperial sizes.",
    },
    ky: {
      name: "40 даанадан башка жана ачкыч комплекти",
      description:
        "Ташуу кейсиндеги хром-ванадий стали. Метрдик жана дюймдук өлчөмдөр.",
    },
  },
};
