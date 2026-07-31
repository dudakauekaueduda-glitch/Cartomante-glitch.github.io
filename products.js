/* ===================================================
   FASHION_BAAY — PRODUCTS.JS (dados mockados)
=================================================== */

const CATEGORIES = [
  { id: "vestidos",   name: "Vestidos",     img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80" },
  { id: "conjuntos",  name: "Conjuntos",    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80" },
  { id: "blusas",     name: "Blusas",       img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&q=80" },
  { id: "calcas",     name: "Calças",       img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80" },
  { id: "shorts",     name: "Shorts",       img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80" },
  { id: "saias",      name: "Saias",        img: "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=500&q=80" },
  { id: "croppeds",   name: "Croppeds",     img: "https://images.unsplash.com/photo-1533659124865-d6072dc035e0?w=500&q=80" },
  { id: "fitness",    name: "Moda Fitness", img: "https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=500&q=80" },
  { id: "acessorios", name: "Acessórios",   img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&q=80" },
  { id: "promocoes",  name: "Promoções",    img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500&q=80" }
];

const COLORS = {
  "Rosa":   "#ec4899",
  "Roxo":   "#8b5cf6",
  "Preto":  "#1a1a22",
  "Branco": "#f5f5f7",
  "Nude":   "#d8b7a0",
  "Vermelho":"#ef4444",
  "Azul":   "#3b82f6",
  "Verde":  "#22c55e"
};

function img(id, w = 700) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

const PRODUCTS = [
  {
    id: 1, name: "Vestido Midi Floral", category: "vestidos",
    price: 189.90, oldPrice: 259.90, rating: 4.8, reviews: 34, stock: 12,
    colors: ["Rosa", "Roxo"], sizes: ["PP", "P", "M", "G"],
    images: [img("photo-1595777457583-95e059d581b8"), img("photo-1496747611176-843222e1e57c"), img("photo-1502716119720-b23a93e5fe1b")],
    tag: "novo",
    desc: "Vestido midi em tecido fluido com estampa floral exclusiva. Modelagem soltinha, ideal para o dia a dia ou eventos casuais. Peça leve e confortável que valoriza o corpo com muito estilo."
  },
  {
    id: 2, name: "Conjunto Alfaiataria Rosê", category: "conjuntos",
    price: 249.90, oldPrice: 329.90, rating: 4.9, reviews: 51, stock: 8,
    colors: ["Nude", "Preto"], sizes: ["P", "M", "G", "GG"],
    images: [img("photo-1490481651871-ab68de25d43d"), img("photo-1551803091-e20673f15770")],
    tag: "promo",
    desc: "Conjunto blazer + calça em alfaiataria premium. Corte moderno e alinhado, perfeito para compor looks elegantes com muita personalidade."
  },
  {
    id: 3, name: "Blusa Cropped Canelada", category: "blusas",
    price: 69.90, oldPrice: 89.90, rating: 4.6, reviews: 22, stock: 25,
    colors: ["Roxo", "Branco", "Preto"], sizes: ["PP", "P", "M"],
    images: [img("photo-1554568218-0f1715e72254"), img("photo-1523381210434-271e8be1f52b")],
    tag: "",
    desc: "Blusa em malha canelada com caimento justinho. Combina com calças de cintura alta e saias midi. Tecido macio com ótimo caimento."
  },
  {
    id: 4, name: "Calça Wide Leg Alfaiataria", category: "calcas",
    price: 159.90, oldPrice: 199.90, rating: 4.7, reviews: 40, stock: 3,
    colors: ["Preto", "Nude"], sizes: ["36", "38", "40", "42"],
    images: [img("photo-1541099649105-f69ad21f3246"), img("photo-1509551388413-e18d0ac5d495")],
    tag: "promo",
    desc: "Calça pantalona wide leg de cintura alta, tecido com caimento perfeito. Alonga a silhueta e é super versátil para diversas ocasiões."
  },
  {
    id: 5, name: "Short Jeans Desfiado", category: "shorts",
    price: 89.90, oldPrice: 0, rating: 4.5, reviews: 18, stock: 30,
    colors: ["Azul"], sizes: ["36", "38", "40"],
    images: [img("photo-1591195853828-11db59a44f6b"), img("photo-1560243563-062bfc001d68")],
    tag: "",
    desc: "Short jeans com barra desfiada, cintura alta e lavagem clara. Ótimo para compor looks despojados no verão."
  },
  {
    id: 6, name: "Saia Midi Plissada", category: "saias",
    price: 119.90, oldPrice: 149.90, rating: 4.8, reviews: 27, stock: 15,
    colors: ["Roxo", "Preto"], sizes: ["P", "M", "G"],
    images: [img("photo-1583496661160-fb5886a13d77"), img("photo-1594633312681-425c7b97ccd1")],
    tag: "novo",
    desc: "Saia midi plissada de tecido fluido, cintura alta com elástico. Movimento elegante a cada passo."
  },
  {
    id: 7, name: "Cropped Tricot Texturizado", category: "croppeds",
    price: 79.90, oldPrice: 99.90, rating: 4.6, reviews: 19, stock: 20,
    colors: ["Rosa", "Branco"], sizes: ["PP", "P", "M"],
    images: [img("photo-1533659124865-d6072dc035e0"), img("photo-1485462537746-965f33f7f6a7")],
    tag: "",
    desc: "Cropped em tricot texturizado, super confortável. Combina com calças de cintura alta e saias."
  },
  {
    id: 8, name: "Conjunto Fitness Bio Cós", category: "fitness",
    price: 139.90, oldPrice: 179.90, rating: 4.9, reviews: 63, stock: 18,
    colors: ["Preto", "Roxo", "Verde"], sizes: ["P", "M", "G"],
    images: [img("photo-1518310952931-b1de897abd40"), img("photo-1518611012118-696072aa579a")],
    tag: "promo",
    desc: "Conjunto fitness (top + legging) com tecido bio cós, compressão média e alta elasticidade. Perfeito para treinos e o dia a dia."
  },
  {
    id: 9, name: "Bolsa Tote Couro Sintético", category: "acessorios",
    price: 149.90, oldPrice: 0, rating: 4.7, reviews: 15, stock: 10,
    colors: ["Preto", "Nude"], sizes: ["Único"],
    images: [img("photo-1611652022419-a9419f74343d"), img("photo-1590874103328-eac38a683ce7")],
    tag: "novo",
    desc: "Bolsa tote espaçosa em couro sintético premium, alças reforçadas e acabamento impecável."
  },
  {
    id: 10, name: "Vestido Longo Festa", category: "vestidos",
    price: 289.90, oldPrice: 379.90, rating: 5.0, reviews: 12, stock: 4,
    colors: ["Roxo", "Vermelho"], sizes: ["P", "M", "G"],
    images: [img("photo-1566174053879-31528523f8ae"), img("photo-1515372039744-b8f02a3ae446")],
    tag: "promo",
    desc: "Vestido longo para festas com fenda lateral e caimento sofisticado. Peça statement para ocasiões especiais."
  },
  {
    id: 11, name: "Conjunto Moletom Oversized", category: "conjuntos",
    price: 179.90, oldPrice: 0, rating: 4.6, reviews: 29, stock: 22,
    colors: ["Roxo", "Preto"], sizes: ["P", "M", "G", "GG"],
    images: [img("photo-1552902865-b72c031ac5ea"), img("photo-1521572163474-6864f9cf17ab")],
    tag: "novo",
    desc: "Conjunto de moletom oversized (blusão + calça), tecido flanelado e super confortável para o dia a dia."
  },
  {
    id: 12, name: "Blusa de Alcinha Cetim", category: "blusas",
    price: 74.90, oldPrice: 94.90, rating: 4.5, reviews: 21, stock: 16,
    colors: ["Nude", "Preto", "Rosa"], sizes: ["PP", "P", "M"],
    images: [img("photo-1485968579580-b6d095142e6e"), img("photo-1434389677669-e08b4cac3105")],
    tag: "",
    desc: "Blusa de alcinha em cetim com caimento leve e brilho sutil. Ideal para compor looks noturnos."
  },
  {
    id: 13, name: "Calça Jeans Skinny", category: "calcas",
    price: 139.90, oldPrice: 0, rating: 4.7, reviews: 44, stock: 28,
    colors: ["Azul", "Preto"], sizes: ["36", "38", "40", "42"],
    images: [img("photo-1541099649105-f69ad21f3246"), img("photo-1475178626620-a4d074967452")],
    tag: "",
    desc: "Calça jeans skinny com elastano, cintura alta e modelagem que valoriza as curvas."
  },
  {
    id: 14, name: "Short Alfaiataria Fluido", category: "shorts",
    price: 94.90, oldPrice: 119.90, rating: 4.6, reviews: 14, stock: 9,
    colors: ["Preto", "Nude"], sizes: ["P", "M", "G"],
    images: [img("photo-1591195853828-11db59a44f6b"), img("photo-1548624313-0396c75f8b0f")],
    tag: "promo",
    desc: "Short de alfaiataria em tecido fluido com pences frontais. Elegante e confortável."
  },
  {
    id: 15, name: "Saia Jeans Lápis", category: "saias",
    price: 99.90, oldPrice: 0, rating: 4.5, reviews: 17, stock: 13,
    colors: ["Azul"], sizes: ["36", "38", "40"],
    images: [img("photo-1583496661160-fb5886a13d77"), img("photo-1551232864-3f0890e580d9")],
    tag: "",
    desc: "Saia jeans modelo lápis com fenda traseira, cintura alta e caimento impecável."
  },
  {
    id: 16, name: "Cropped Ombro a Ombro", category: "croppeds",
    price: 64.90, oldPrice: 84.90, rating: 4.4, reviews: 11, stock: 19,
    colors: ["Branco", "Rosa"], sizes: ["PP", "P", "M"],
    images: [img("photo-1485462537746-965f33f7f6a7"), img("photo-1503342217505-b0a15ec3261c")],
    tag: "promo",
    desc: "Cropped ombro a ombro em malha canelada. Romântico e super fácil de combinar."
  },
  {
    id: 17, name: "Legging Fitness Estampada", category: "fitness",
    price: 99.90, oldPrice: 129.90, rating: 4.8, reviews: 37, stock: 24,
    colors: ["Roxo", "Preto"], sizes: ["P", "M", "G"],
    images: [img("photo-1506126613408-eca07ce68773"), img("photo-1518459031867-a89b944bffe4")],
    tag: "",
    desc: "Legging fitness com estampa exclusiva, tecido de alta compressão e secagem rápida."
  },
  {
    id: 18, name: "Óculos de Sol Redondo", category: "acessorios",
    price: 59.90, oldPrice: 79.90, rating: 4.6, reviews: 9, stock: 17,
    colors: ["Preto", "Rosa"], sizes: ["Único"],
    images: [img("photo-1511499767150-a48a237f0083"), img("photo-1572635196237-14b3f281503f")],
    tag: "",
    desc: "Óculos de sol modelo redondo com proteção UV400 e armação leve."
  },
  {
    id: 19, name: "Vestido Tricot Canelado", category: "vestidos",
    price: 169.90, oldPrice: 0, rating: 4.7, reviews: 25, stock: 11,
    colors: ["Roxo", "Nude"], sizes: ["P", "M", "G"],
    images: [img("photo-1496747611176-843222e1e57c"), img("photo-1503342394128-c104d54dba01")],
    tag: "novo",
    desc: "Vestido em tricot canelado com fenda lateral, modelagem que abraça o corpo com conforto."
  },
  {
    id: 20, name: "Conjunto Cropped e Saia", category: "conjuntos",
    price: 199.90, oldPrice: 249.90, rating: 4.9, reviews: 33, stock: 7,
    colors: ["Rosa", "Roxo"], sizes: ["PP", "P", "M"],
    images: [img("photo-1551803091-e20673f15770"), img("photo-1544022613-e87ca75a784a")],
    tag: "promo",
    desc: "Conjunto cropped + saia midi no mesmo tecido. Combinação certeira para um look coordenado."
  }
];

const TESTIMONIALS = [
  { name: "Juliana Costa", city: "São Paulo, SP", rating: 5, text: "Comprei um vestido pelo Direct e chegou super rápido! A qualidade do tecido é incrível, virei cliente fiel da Fashion_Baay.", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
  { name: "Fernanda Lima", city: "Guaratinguetá, SP", rating: 5, text: "Atendimento maravilhoso e as peças são lindas de perto. Já comprei 3 vezes e nunca me decepcionei.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Camila Santos", city: "Potim, SP", rating: 5, text: "Loja física impecável, super organizada. O conjunto que comprei ficou perfeito, recomendo demais!", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Beatriz Alves", city: "Taubaté, SP", rating: 4, text: "Recebi via motoboy no mesmo dia. Preço justo e roupas de qualidade, com certeza vou comprar mais.", avatar: "https://randomuser.me/api/portraits/women/21.jpg" },
  { name: "Larissa Souza", city: "Pindamonhangaba, SP", rating: 5, text: "A Fashion_Baay entende de moda mesmo! Sempre acerto nas peças e o suporte no WhatsApp é super atencioso.", avatar: "https://randomuser.me/api/portraits/women/56.jpg" }
];

const INSTAGRAM_IMAGES = [
  img("photo-1595777457583-95e059d581b8", 400),
  img("photo-1490481651871-ab68de25d43d", 400),
  img("photo-1554568218-0f1715e72254", 400),
  img("photo-1541099649105-f69ad21f3246", 400),
  img("photo-1583496661160-fb5886a13d77", 400),
  img("photo-1518310952931-b1de897abd40", 400)
];

const COUPONS = {
  "BAAY10": 0.10,
  "BAAY20": 0.20,
  "BEMVINDA": 0.15
};
