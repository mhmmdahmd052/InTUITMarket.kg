import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-27',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

const productData = [
  {
    originalName: "Portland Cement Mix (50kg)",
    slug: "cement-m500",
    category: "cement",
    image: "portland_cement_mix_50kg.png",
    name: {
      en: "Portland Cement Mix (50kg)",
      ar: "خليط أسمنت بورتلاند (50 كجم)",
      ru: "Портландцементная смесь (50 кг)"
    },
    description: {
      en: "Standard structural grade cement mixture for load-bearing pillars and foundational masonry.",
      ar: "خليط أسمنت إنشائي قياسي للأعمدة الحاملة والبناء الأساسي.",
      ru: "Стандартная строительная цементная смесь для несущих колонн и фундаментной кладки."
    }
  },
  {
    originalName: "Pre-cast Concrete Panels",
    slug: "clay-bricks", // Mapping per request
    category: "bricks",
    image: "pre_cast_concrete_panels.png",
    name: {
      en: "Pre-cast Concrete Panels",
      ar: "ألواح خرسانية مسبقة الصب",
      ru: "Сборные бетонные панели"
    },
    description: {
      en: "Modular pre-cast concrete walls for rapid skyscraper exterior paneling and high-rise construction.",
      ar: "جدران خرسانية مسبقة الصب لكسوة ناطحات السحاب الخارجية والبناء الشاهق بسرعة.",
      ru: "Модульные сборные бетонные стены для быстрой облицовки фасадов небоскребов и высотного строительства."
    }
  },
  {
    originalName: "Heavy Gauge Steel Bars (A500)",
    slug: "steel-reinforcement",
    category: "steel",
    image: "heavy_gauge_steel_bars_a500.png",
    name: {
      en: "Heavy Gauge Steel Bars (A500)",
      ar: "قضبان فولاذية ثقيلة (A500)",
      ru: "Тяжелая стальная арматура (A500)"
    },
    description: {
      en: "Carbon-spec structural reinforcement grating for foundational meshes and reinforced concrete.",
      ar: "شبكة تقوية إنشائية كربونية للمواصفات الخاصة لشبكات التأسيس والخرسانة المسلحة.",
      ru: "Углеродистая конструкционная арматурная сетка для фундаментных каркасов и железобетона."
    }
  },
  {
    originalName: "Epoxy Floor Coating (50gal)",
    slug: "exterior-paint", // Mapping per request
    category: "paint",
    image: "epoxy_floor_coating_50gal.png",
    name: {
      en: "Epoxy Floor Coating (50gal)",
      ar: "طلاء أرضيات إيبوكسي (50 جالون)",
      ru: "Эпоксидное покрытие для пола (50 галлонов)"
    },
    description: {
      en: "Chemical-resistant industrial warehouse flooring compound for high-traffic environments.",
      ar: "مركب طلاء أرضيات المستودعات الصناعية المقاوم للمواد الكيميائية للبيئات عالية حركة المرور.",
      ru: "Химически стойкий промышленный состав для напольных покрытий складов в зонах с высокой проходимостью."
    }
  },
  {
    originalName: "Steel Beam Structure A",
    slug: "steel-beam-a",
    category: "steel",
    image: "steel_beam_structure_a.png",
    name: {
      en: "Steel Beam Structure A",
      ar: "هيكل عارضة فولاذية A",
      ru: "Стальная балочная конструкция A"
    },
    description: {
      en: "High strength cross beams for structural support in multi-level architectures.",
      ar: "عارضات عرضية عالية القوة للدعم الإنشائي في الهندسة المعمارية متعددة المستويات.",
      ru: "Высокопрочные поперечные балки для структурной поддержки в многоуровневых архитектурных сооружениях."
    }
  },
  {
    originalName: "Industrial Crane Rigging Wire",
    slug: "crane-rigging",
    category: "tools",
    image: "industrial_crane_rigging_wire.png",
    name: {
      en: "Industrial Crane Rigging Wire",
      ar: "سلك تزويد الرافعات الصناعية",
      ru: "Промышленный тросовый такелаж"
    },
    description: {
      en: "Braided steel wire optimized for heavy lifting and overhead assembly loads.",
      ar: "سلك فولاذي مضفر محسن للرفع الثقيل وأحمال التجميع العلوية.",
      ru: "Плетеный стальной трос, оптимизированный для тяжелых грузов и монтажных работ на высоте."
    }
  },
  {
    originalName: "Galvanized Roof Trusses",
    slug: "roof-trusses",
    category: "steel",
    image: "galvanized_roof_trusses.png",
    name: {
      en: "Galvanized Roof Trusses",
      ar: "دعامات سقف مجلفنة",
      ru: "Оцинкованные фермы крыши"
    },
    description: {
      en: "Engineered zinc-coated steel frameworks for long-span warehouse roofing.",
      ar: "إطارات فولاذية مغطاة بالزنك لأسقف المستودعات طويلة البحور.",
      ru: "Инженерные стальные каркасы с цинковым покрытием для длиннопролетных складских крыш."
    }
  },
  {
    originalName: "Titanium Fastener Bolts (Box)",
    slug: "titanium-bolts",
    category: "tools",
    image: "titanium_fastener_bolts_box.png",
    name: {
      en: "Titanium Fastener Bolts (Box)",
      ar: "مسامير ربط تيتانيوم (صندوق)",
      ru: "Титановые крепежные болты (коробка)"
    },
    description: {
      en: "Corrosion-resistant titanium bolts used for critical joint junctions in heavy machinery.",
      ar: "مسامير تيتانيوم مقاومة للتآكل تستخدم في وصلات المفاصل الحرجة في الآلات الثقيلة.",
      ru: "Коррозионностойкие титановые болты, используемые для ответственных соединений в тяжелой технике."
    }
  },
  {
    originalName: "Reinforced Concrete Foundation",
    slug: "concrete-foundation",
    category: "bricks",
    image: "reinforced_concrete_foundation.png",
    name: {
      en: "Reinforced Concrete Foundation",
      ar: "أساسات خرسانية مسلحة",
      ru: "Железобетонный фундамент"
    },
    description: {
      en: "Industrial grade foundational pour with heavy rebar framework for seismic stability.",
      ar: "صب أساسات صناعية مع إطار حديد تسليح ثقيل للاستقرار الزلزالي.",
      ru: "Фундамент промышленного класса с тяжелым арматурным каркасом для сейсмической устойчивости."
    }
  },
  {
    originalName: "Acoustic Ceiling Grid System",
    slug: "ceiling-grid",
    category: "tools",
    image: "acoustic_ceiling_grid_system.png",
    name: {
      en: "Acoustic Ceiling Grid System",
      ar: "نظام شبكي للسقف الصوتي",
      ru: "Акустическая подвесная потолочная система"
    },
    description: {
      en: "Suspended industrial grid system engineered to dampen interior acoustics and hide cabling.",
      ar: "نظام شبكي صناعي معلق مصمم لتخميد الصوتيات الداخلية وإخفاء الكابلات.",
      ru: "Промышленная подвесная система, предназначенная для улучшения акустики и скрытия инженерных коммуникаций."
    }
  },
  {
    originalName: "Commercial Facade Renovation",
    slug: "facade-renovation",
    category: "paint",
    image: "commercial_facade_renovation.png",
    name: {
      en: "Commercial Facade Renovation",
      ar: "تجديد الواجهات التجارية",
      ru: "Реновация коммерческого фасада"
    },
    description: {
      en: "Glass and steel exterior finishing for commercial building architectural updates.",
      ar: "تشطيب خارجي من الزجاج والفولاذ للتحديثات المعمارية للمباني التجارية.",
      ru: "Стеклянная и стальная наружная отделка для архитектурного обновления коммерческих зданий."
    }
  },
  {
    originalName: "Structural Insulated Panels (SIPs)",
    slug: "structural-panels",
    category: "bricks",
    image: "structural_insulated_panels_sips.png",
    name: {
      en: "Structural Insulated Panels (SIPs)",
      ar: "ألواح هيكلية معزولة (SIPs)",
      ru: "Структурные изоляционные панели (SIP)"
    },
    description: {
      en: "High-performance foam core sandwich panels for structural walls and roofs with superior thermal insulation.",
      ar: "ألواح ساندوتش عالية الأداء بجوهر رغوي للجدران والأسقف الإنشائية مع عزل حراري فائق.",
      ru: "Высокоэффективные сэндвич-панели с пенополистиролом для несущих стен и крыш с превосходной теплоизоляцией."
    }
  }
];

async function runPatch() {
  console.log('--- STARTING SURGICAL DATA PATCH ---');

  try {
    // 1. Fetch current data
    const existing = await client.fetch('*[_type == "project"]{_id, name}');
    console.log(`Found ${existing.length} existing products.`);

    // 2. Identify and remove duplicates
    const seenNames = new Set();
    const toDelete = [];
    const uniqueMap = new Map(); // name -> ID

    for (const p of existing) {
      if (seenNames.has(p.name)) {
        toDelete.push(p._id);
      } else {
        seenNames.add(p.name);
        uniqueMap.set(p.name, p._id);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Deleting ${toDelete.length} duplicates...`);
      for (const id of toDelete) {
        await client.delete(id);
      }
      console.log('Duplicates removed.');
    }

    // 3. Upload Assets
    const imageAssetMap = new Map(); // fileName -> assetId
    const imageDir = path.resolve(process.cwd(), 'public/products');
    const images = fs.readdirSync(imageDir).filter(f => f.endsWith('.png'));

    console.log(`Uploading ${images.length} images...`);
    for (const img of images) {
      const imgPath = path.join(imageDir, img);
      const asset = await client.assets.upload('image', fs.createReadStream(imgPath), {
        filename: img,
      });
      imageAssetMap.set(img, asset._id);
      console.log(`Uploaded: ${img} (${asset._id})`);
    }

    // 4. Patch Documents
    console.log('Patching unique documents...');
    for (const data of productData) {
      const docId = uniqueMap.get(data.originalName);
      if (!docId) {
        console.warn(`Could not find document for ${data.originalName}. Skipping.`);
        continue;
      }

      console.log(`Patching [${docId}] - ${data.originalName}`);
      await client.patch(docId)
        .set({
          slug: { _type: 'slug', current: data.slug },
          category: data.category,
          name: data.name,
          description: data.description,
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: imageAssetMap.get(data.image) }
          }
        })
        .commit();
    }

    console.log('--- PATCH COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('CRITICAL PATCH FAILURE:', err);
    process.exit(1);
  }
}

runPatch();
