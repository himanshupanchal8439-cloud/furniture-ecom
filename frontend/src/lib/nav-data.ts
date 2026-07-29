export interface MegaMenuColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export interface MegaMenuCategory {
  name: string;
  slug: string;
  image: string;
  columns: MegaMenuColumn[];
}

export const MEGA_MENU: MegaMenuCategory[] = [
  {
    name: "Living Room",
    slug: "living-room",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Seating",
        links: [
          { label: "Sofas", href: "/products?category=living-room&q=sofa" },
          { label: "Lounge Chairs", href: "/products?category=living-room&q=chair" },
          { label: "Recliners", href: "/products?category=living-room" },
        ],
      },
      {
        heading: "Tables",
        links: [
          { label: "Coffee Tables", href: "/products?category=living-room&q=table" },
          { label: "Console Tables", href: "/products?category=living-room" },
          { label: "TV Units", href: "/products?category=living-room" },
        ],
      },
      {
        heading: "Shop by material",
        links: [
          { label: "Velvet", href: "/products?category=living-room&material=velvet" },
          { label: "Solid Wood", href: "/products?category=living-room&material=wood" },
          { label: "Bouclé", href: "/products?category=living-room&material=bouclé" },
        ],
      },
    ],
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Beds",
        links: [
          { label: "Platform Beds", href: "/products?category=bedroom&q=bed" },
          { label: "Storage Beds", href: "/products?category=bedroom" },
          { label: "Headboards", href: "/products?category=bedroom" },
        ],
      },
      {
        heading: "Storage",
        links: [
          { label: "Wardrobes", href: "/products?category=bedroom" },
          { label: "Nightstands", href: "/products?category=bedroom" },
          { label: "Dressers", href: "/products?category=bedroom" },
        ],
      },
      {
        heading: "Shop by material",
        links: [
          { label: "Linen", href: "/products?category=bedroom&material=linen" },
          { label: "Engineered Wood", href: "/products?category=bedroom&material=wood" },
        ],
      },
    ],
  },
  {
    name: "Dining",
    slug: "dining",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Tables",
        links: [
          { label: "Dining Tables", href: "/products?category=dining&q=table" },
          { label: "Bar Tables", href: "/products?category=dining" },
        ],
      },
      {
        heading: "Seating",
        links: [
          { label: "Dining Chairs", href: "/products?category=dining&q=chair" },
          { label: "Benches", href: "/products?category=dining" },
        ],
      },
      {
        heading: "Storage",
        links: [
          { label: "Crockery Units", href: "/products?category=dining" },
          { label: "Bar Cabinets", href: "/products?category=dining" },
        ],
      },
    ],
  },
  {
    name: "Office",
    slug: "office",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Desks",
        links: [
          { label: "Study Desks", href: "/products?category=office&q=desk" },
          { label: "Executive Desks", href: "/products?category=office" },
        ],
      },
      {
        heading: "Seating",
        links: [
          { label: "Office Chairs", href: "/products?category=office&q=chair" },
          { label: "Ergonomic Chairs", href: "/products?category=office" },
        ],
      },
      {
        heading: "Storage",
        links: [
          { label: "Bookshelves", href: "/products?category=office" },
          { label: "Filing Cabinets", href: "/products?category=office" },
        ],
      },
    ],
  },
  {
    name: "Decor",
    slug: "decor",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Lighting",
        links: [
          { label: "Floor Lamps", href: "/products?category=decor&q=lamp" },
          { label: "Table Lamps", href: "/products?category=decor" },
        ],
      },
      {
        heading: "Textiles",
        links: [
          { label: "Rugs", href: "/products?category=decor&q=rug" },
          { label: "Cushions", href: "/products?category=decor" },
        ],
      },
      {
        heading: "Accents",
        links: [
          { label: "Mirrors", href: "/products?category=decor" },
          { label: "Vases", href: "/products?category=decor" },
        ],
      },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    image:
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Beds",
        links: [
          { label: "Bunk Beds", href: "/products?category=kids&q=bed" },
          { label: "Toddler Beds", href: "/products?category=kids" },
        ],
      },
      {
        heading: "Study",
        links: [
          { label: "Study Tables", href: "/products?category=kids&q=desk" },
          { label: "Study Chairs", href: "/products?category=kids" },
        ],
      },
      {
        heading: "Storage",
        links: [
          { label: "Toy Storage", href: "/products?category=kids" },
          { label: "Wardrobes", href: "/products?category=kids" },
        ],
      },
    ],
  },
  {
    name: "Outdoor",
    slug: "outdoor",
    image:
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Seating",
        links: [
          { label: "Patio Chairs", href: "/products?category=outdoor&q=chair" },
          { label: "Swings", href: "/products?category=outdoor" },
        ],
      },
      {
        heading: "Tables",
        links: [
          { label: "Patio Tables", href: "/products?category=outdoor&q=table" },
          { label: "Side Tables", href: "/products?category=outdoor" },
        ],
      },
      {
        heading: "Shop by material",
        links: [
          { label: "Rattan", href: "/products?category=outdoor&material=rattan" },
          { label: "Teak Wood", href: "/products?category=outdoor&material=wood" },
        ],
      },
    ],
  },
  {
    name: "Storage",
    slug: "storage",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Wardrobes",
        links: [
          { label: "Sliding Wardrobes", href: "/products?category=storage" },
          { label: "Hinged Wardrobes", href: "/products?category=storage" },
        ],
      },
      {
        heading: "Shelving",
        links: [
          { label: "Bookshelves", href: "/products?category=storage&q=shelf" },
          { label: "Shoe Racks", href: "/products?category=storage" },
        ],
      },
      {
        heading: "Cabinets",
        links: [
          { label: "Chest of Drawers", href: "/products?category=storage" },
          { label: "Sideboards", href: "/products?category=storage" },
        ],
      },
    ],
  },
  {
    name: "Study",
    slug: "study",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
    columns: [
      {
        heading: "Desks",
        links: [
          { label: "Study Tables", href: "/products?category=study&q=desk" },
          { label: "Computer Tables", href: "/products?category=study" },
        ],
      },
      {
        heading: "Seating",
        links: [
          { label: "Study Chairs", href: "/products?category=study&q=chair" },
          { label: "Ergonomic Chairs", href: "/products?category=study" },
        ],
      },
      {
        heading: "Storage",
        links: [
          { label: "Bookshelves", href: "/products?category=study" },
          { label: "Filing Cabinets", href: "/products?category=study" },
        ],
      },
    ],
  },
];
