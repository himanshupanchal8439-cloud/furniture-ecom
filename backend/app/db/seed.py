"""Seed demo data: run with `python -m app.db.seed` after migrations."""
from decimal import Decimal

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.product import Category, Product, ProductImage, ProductVariant
from app.models.user import User, UserRole

CATEGORIES = ["Living Room", "Bedroom", "Dining", "Office", "Decor", "Kids", "Outdoor", "Storage", "Study"]

PRODUCTS = [
    # --- Living Room ---
    {
        "name": "Aura Lounge Chair",
        "category": "Living Room",
        "price": "1250.00",
        "description": "The Aura Lounge Chair embodies modern minimalism with its sculpted ash wood frame and plush bouclé upholstery.",
        "dimensions": '32"W x 34"D x 30"H',
        "material": "Ash wood, bouclé",
        "image": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Walnut", "sku": "AURA-WAL", "swatch_hex": "#5c4033", "stock_quantity": 12},
            {"color": "Oatmeal", "sku": "AURA-OAT", "swatch_hex": "#e5d9c5", "stock_quantity": 8},
            {"color": "Charcoal", "sku": "AURA-CHR", "swatch_hex": "#333333", "stock_quantity": 5},
        ],
    },
    {
        "name": "Lumina Velvet Sofa",
        "category": "Living Room",
        "price": "3400.00",
        "description": "A masterpiece of contemporary living, the Lumina Sofa features deep seating, tailored velvet, and hidden architectural legs.",
        "dimensions": '88"W x 40"D x 32"H',
        "material": "Velvet, hardwood frame",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Emerald", "sku": "LUM-EME", "swatch_hex": "#046307", "stock_quantity": 4},
            {"color": "Sand", "sku": "LUM-SAN", "swatch_hex": "#dcb991", "stock_quantity": 6},
        ],
    },
    {
        "name": "Nova Accent Chair",
        "category": "Living Room",
        "price": "780.00",
        "description": "A sculptural accent chair with a curved silhouette, upholstered in performance fabric over a solid wood frame.",
        "dimensions": '30"W x 32"D x 33"H',
        "material": "Solid wood, performance fabric",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Terracotta", "sku": "NOVA-TER", "swatch_hex": "#b5651d", "stock_quantity": 10},
            {"color": "Ivory", "sku": "NOVA-IVO", "swatch_hex": "#f5f0e6", "stock_quantity": 7},
        ],
    },
    {
        "name": "Haven Sectional Sofa",
        "category": "Living Room",
        "price": "4200.00",
        "description": "Modular sectional built for lounging, with deep down-blend cushions and a low, wide profile.",
        "dimensions": '112"W x 66"D x 31"H',
        "material": "Linen blend, hardwood frame",
        "image": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Fog Grey", "sku": "HAVEN-FOG", "swatch_hex": "#9a9a92", "stock_quantity": 3},
            {"color": "Clay", "sku": "HAVEN-CLA", "swatch_hex": "#a56a52", "stock_quantity": 5},
        ],
    },
    {
        "name": "Marlow Coffee Table",
        "category": "Living Room",
        "price": "560.00",
        "description": "A low, elemental coffee table in solid wood with a hand-rubbed oil finish that highlights the natural grain.",
        "dimensions": '48"L x 24"W x 16"H',
        "material": "Solid walnut",
        "image": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Walnut", "sku": "MARL-WAL", "swatch_hex": "#5c4033", "stock_quantity": 11},
        ],
    },
    # --- Bedroom ---
    {
        "name": "Serene Platform Bed",
        "category": "Bedroom",
        "price": "1850.00",
        "description": "Transform your bedroom into a sanctuary with this low-profile platform bed and upholstered headboard.",
        "dimensions": 'Queen: 85"L x 65"W x 38"H',
        "material": "Linen, engineered wood",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Linen", "sku": "SER-LIN", "swatch_hex": "#faf0e6", "stock_quantity": 9},
            {"color": "Slate", "sku": "SER-SLA", "swatch_hex": "#708090", "stock_quantity": 6},
        ],
    },
    {
        "name": "Willow Storage Bed",
        "category": "Bedroom",
        "price": "2100.00",
        "description": "A storage bed with hydraulic-lift base for hidden storage beneath a padded, channel-tufted headboard.",
        "dimensions": 'King: 95"L x 78"W x 40"H',
        "material": "Engineered wood, velvet",
        "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Charcoal", "sku": "WIL-CHR", "swatch_hex": "#333333", "stock_quantity": 5},
        ],
    },
    {
        "name": "Nightfall Wardrobe",
        "category": "Bedroom",
        "price": "1650.00",
        "description": "A three-door wardrobe with soft-close hinges, adjustable shelving, and an internal hanging rail.",
        "dimensions": '72"W x 22"D x 80"H',
        "material": "Engineered wood, veneer finish",
        "image": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Espresso", "sku": "NIGHT-ESP", "swatch_hex": "#3b2f2f", "stock_quantity": 6},
        ],
    },
    {
        "name": "Dawn Nightstand",
        "category": "Bedroom",
        "price": "320.00",
        "description": "A compact two-drawer nightstand with brushed brass hardware and a solid wood top.",
        "dimensions": '20"W x 16"D x 24"H',
        "material": "Solid oak, brass",
        "image": "https://images.unsplash.com/photo-1554295405-abb8fd54f153?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural Oak", "sku": "DAWN-OAK", "swatch_hex": "#c19a6b", "stock_quantity": 14},
        ],
    },
    {
        "name": "Haze Dresser",
        "category": "Bedroom",
        "price": "980.00",
        "description": "A six-drawer dresser with a wide silhouette and reeded drawer fronts for a soft, textured look.",
        "dimensions": '60"W x 18"D x 32"H',
        "material": "Engineered wood, oak veneer",
        "image": "https://images.unsplash.com/photo-1518481852452-9415b262eba4?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Honey Oak", "sku": "HAZE-HON", "swatch_hex": "#c19a6b", "stock_quantity": 8},
        ],
    },
    # --- Dining ---
    {
        "name": "Oakley Dining Table",
        "category": "Dining",
        "price": "2100.00",
        "description": "Crafted from solid European oak, this dining table anchors your space with its robust cylindrical legs.",
        "dimensions": '84"L x 40"W x 30"H',
        "material": "Solid oak",
        "image": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural Oak", "sku": "OAK-NAT", "swatch_hex": "#c19a6b", "stock_quantity": 10},
            {"color": "Smoked Oak", "sku": "OAK-SMK", "swatch_hex": "#3b2f2f", "stock_quantity": 7},
        ],
    },
    {
        "name": "Bistro Dining Chair",
        "category": "Dining",
        "price": "240.00",
        "description": "A curved-back dining chair with a woven cane insert and tapered solid wood legs.",
        "dimensions": '19"W x 22"D x 34"H',
        "material": "Solid beech, cane",
        "image": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural", "sku": "BIS-NAT", "swatch_hex": "#c19a6b", "stock_quantity": 20},
        ],
    },
    {
        "name": "Amara Bar Table",
        "category": "Dining",
        "price": "890.00",
        "description": "A counter-height bar table with a marble-effect top and a slim, powder-coated steel base.",
        "dimensions": '42"L x 42"W x 42"H',
        "material": "Engineered stone, steel",
        "image": "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Marble White", "sku": "AMARA-MAR", "swatch_hex": "#f0ece2", "stock_quantity": 6},
        ],
    },
    {
        "name": "Crestwood Dining Bench",
        "category": "Dining",
        "price": "410.00",
        "description": "A solid wood bench that pairs with any dining table, finished with rounded edges for family-friendly use.",
        "dimensions": '52"L x 14"D x 18"H',
        "material": "Solid acacia wood",
        "image": "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Acacia", "sku": "CREST-ACA", "swatch_hex": "#8a6b4c", "stock_quantity": 9},
        ],
    },
    {
        "name": "Vale Crockery Unit",
        "category": "Dining",
        "price": "1420.00",
        "description": "A glass-front crockery unit with adjustable shelves and soft-close doors to display your finest tableware.",
        "dimensions": '48"W x 16"D x 68"H',
        "material": "Engineered wood, tempered glass",
        "image": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Walnut", "sku": "VALE-WAL", "swatch_hex": "#5c4033", "stock_quantity": 4},
        ],
    },
    # --- Office ---
    {
        "name": "Meridian Study Desk",
        "category": "Office",
        "price": "760.00",
        "description": "A clean-lined writing desk with a cable management tray and a single soft-close drawer.",
        "dimensions": '48"W x 24"D x 30"H',
        "material": "Engineered wood, powder-coated steel",
        "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Oak", "sku": "MER-OAK", "swatch_hex": "#c19a6b", "stock_quantity": 12},
        ],
    },
    {
        "name": "Zenith Office Chair",
        "category": "Office",
        "price": "540.00",
        "description": "An ergonomic task chair with adjustable lumbar support, breathable mesh back, and smooth-rolling casters.",
        "dimensions": '26"W x 26"D x 40-44"H',
        "material": "Mesh, aluminum base",
        "image": "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Black", "sku": "ZEN-BLK", "swatch_hex": "#1a1a1a", "stock_quantity": 15},
            {"color": "Grey", "sku": "ZEN-GRY", "swatch_hex": "#808080", "stock_quantity": 10},
        ],
    },
    {
        "name": "Compass Bookshelf",
        "category": "Office",
        "price": "690.00",
        "description": "An open-back bookshelf with five tiers, ideal for books, files, and display objects.",
        "dimensions": '32"W x 12"D x 72"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Walnut", "sku": "COMP-WAL", "swatch_hex": "#5c4033", "stock_quantity": 8},
        ],
    },
    {
        "name": "Atlas Filing Cabinet",
        "category": "Office",
        "price": "430.00",
        "description": "A two-drawer filing cabinet with full-extension slides and a lockable top drawer for documents.",
        "dimensions": '16"W x 20"D x 28"H',
        "material": "Powder-coated steel",
        "image": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Graphite", "sku": "ATL-GRA", "swatch_hex": "#3a3a3a", "stock_quantity": 11},
        ],
    },
    {
        "name": "Horizon Executive Desk",
        "category": "Office",
        "price": "1580.00",
        "description": "A statement executive desk with a wide work surface, integrated drawers, and a floating top design.",
        "dimensions": '64"W x 30"D x 30"H',
        "material": "Engineered wood, veneer",
        "image": "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Dark Walnut", "sku": "HOR-WAL", "swatch_hex": "#3b2f2f", "stock_quantity": 5},
        ],
    },
    # --- Decor ---
    {
        "name": "Luna Floor Lamp",
        "category": "Decor",
        "price": "290.00",
        "description": "An arced floor lamp with a marble base and a linen drum shade that casts soft, ambient light.",
        "dimensions": '58"H, 12" base diameter',
        "material": "Marble, steel, linen",
        "image": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Black", "sku": "LUNA-BLK", "swatch_hex": "#1a1a1a", "stock_quantity": 9},
        ],
    },
    {
        "name": "Aria Table Lamp",
        "category": "Decor",
        "price": "140.00",
        "description": "A ceramic table lamp with a fluted base and a warm fabric shade, perfect for bedside or console styling.",
        "dimensions": '22"H, 8" base diameter',
        "material": "Ceramic, fabric",
        "image": "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Cream", "sku": "ARIA-CRE", "swatch_hex": "#f5f0e6", "stock_quantity": 16},
        ],
    },
    {
        "name": "Terra Area Rug",
        "category": "Decor",
        "price": "380.00",
        "description": "A hand-tufted area rug in a subtle abstract pattern, made from a durable wool-blend pile.",
        "dimensions": "8ft x 10ft",
        "material": "Wool blend",
        "image": "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Terracotta", "sku": "TERRA-TER", "swatch_hex": "#b5651d", "stock_quantity": 7},
        ],
    },
    {
        "name": "Willow Wall Mirror",
        "category": "Decor",
        "price": "260.00",
        "description": "An arched wall mirror in a slim brass frame, ideal for entryways or above a console table.",
        "dimensions": '30"W x 40"H',
        "material": "Brass, glass",
        "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Brass", "sku": "WIL-BRA", "swatch_hex": "#b5a642", "stock_quantity": 10},
        ],
    },
    {
        "name": "Clay Ceramic Vase Set",
        "category": "Decor",
        "price": "95.00",
        "description": "A set of three hand-thrown ceramic vases in varying heights, finished with a matte glaze.",
        "dimensions": "Set of 3: 6\"–12\" H",
        "material": "Ceramic",
        "image": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Sand", "sku": "CLAY-SAN", "swatch_hex": "#dcb991", "stock_quantity": 18},
        ],
    },
    # --- Kids ---
    {
        "name": "Playful Bunk Bed",
        "category": "Kids",
        "price": "1450.00",
        "description": "A sturdy twin-over-twin bunk bed with an integrated ladder and full-length guard rails.",
        "dimensions": 'Twin: 79"L x 42"W x 62"H',
        "material": "Solid pine",
        "image": "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "White", "sku": "PLAY-WHT", "swatch_hex": "#f5f5f5", "stock_quantity": 6},
        ],
    },
    {
        "name": "Cloud Toddler Bed",
        "category": "Kids",
        "price": "520.00",
        "description": "A low-to-the-ground toddler bed with a soft rounded frame, designed for an easy transition from crib.",
        "dimensions": '54"L x 30"W x 20"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Blush", "sku": "CLOUD-BLU", "swatch_hex": "#f2c6c2", "stock_quantity": 9},
        ],
    },
    {
        "name": "Rainbow Study Desk",
        "category": "Kids",
        "price": "310.00",
        "description": "A height-adjustable kids' study desk with a spacious surface and a built-in storage shelf.",
        "dimensions": '36"W x 20"D x 24-28"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "White", "sku": "RAIN-WHT", "swatch_hex": "#f5f5f5", "stock_quantity": 11},
        ],
    },
    {
        "name": "Star Toy Storage Unit",
        "category": "Kids",
        "price": "240.00",
        "description": "A cubby storage unit with removable fabric bins, sized for easy toy clean-up.",
        "dimensions": '30"W x 12"D x 24"H',
        "material": "Engineered wood, fabric bins",
        "image": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Multicolor", "sku": "STAR-MUL", "swatch_hex": "#f2c6c2", "stock_quantity": 13},
        ],
    },
    {
        "name": "Whimsy Kids Armchair",
        "category": "Kids",
        "price": "180.00",
        "description": "A mini upholstered armchair sized just for kids, with a durable wipe-clean fabric.",
        "dimensions": '20"W x 18"D x 22"H',
        "material": "Performance fabric, wood frame",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Mint", "sku": "WHIM-MIN", "swatch_hex": "#a8d8c9", "stock_quantity": 10},
        ],
    },
    # --- Outdoor ---
    {
        "name": "Patio Lounge Chair",
        "category": "Outdoor",
        "price": "420.00",
        "description": "A weather-resistant lounge chair with quick-dry cushions, built for all-season outdoor use.",
        "dimensions": '28"W x 32"D x 34"H',
        "material": "Rattan-effect resin, aluminum",
        "image": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Grey", "sku": "PATIO-GRY", "swatch_hex": "#808080", "stock_quantity": 8},
        ],
    },
    {
        "name": "Cabana Swing Chair",
        "category": "Outdoor",
        "price": "650.00",
        "description": "A hanging swing chair with a powder-coated stand and a weatherproof cushion.",
        "dimensions": '35"W x 35"D x 75"H',
        "material": "Steel frame, weatherproof fabric",
        "image": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural", "sku": "CABANA-NAT", "swatch_hex": "#c19a6b", "stock_quantity": 5},
        ],
    },
    {
        "name": "Teak Side Table",
        "category": "Outdoor",
        "price": "260.00",
        "description": "A compact side table in solid teak, finished to withstand outdoor weather year-round.",
        "dimensions": '18"W x 18"D x 20"H',
        "material": "Solid teak",
        "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Teak", "sku": "TEAK-TEA", "swatch_hex": "#a56a3f", "stock_quantity": 9},
        ],
    },
    {
        "name": "Rattan Dining Set",
        "category": "Outdoor",
        "price": "1380.00",
        "description": "A four-seat outdoor dining set in synthetic rattan, with a tempered glass tabletop.",
        "dimensions": 'Table: 48"L x 28"W x 29"H',
        "material": "Synthetic rattan, glass",
        "image": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Espresso", "sku": "RATTAN-ESP", "swatch_hex": "#3b2f2f", "stock_quantity": 4},
        ],
    },
    {
        "name": "Sundeck Bench",
        "category": "Outdoor",
        "price": "310.00",
        "description": "A slatted outdoor bench in solid acacia wood, treated for durability against the elements.",
        "dimensions": '48"L x 16"D x 18"H',
        "material": "Solid acacia wood",
        "image": "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Acacia", "sku": "SUN-ACA", "swatch_hex": "#8a6b4c", "stock_quantity": 7},
        ],
    },
    # --- Storage ---
    {
        "name": "Cascade Sliding Wardrobe",
        "category": "Storage",
        "price": "2200.00",
        "description": "A three-panel sliding-door wardrobe with mirrored front panels and configurable interior shelving.",
        "dimensions": '78"W x 24"D x 82"H',
        "material": "Engineered wood, mirrored glass",
        "image": "https://images.unsplash.com/photo-1518481852452-9415b262eba4?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "White Oak", "sku": "CASC-WOA", "swatch_hex": "#e5d9c5", "stock_quantity": 3},
        ],
    },
    {
        "name": "Loft Bookshelf",
        "category": "Storage",
        "price": "540.00",
        "description": "A tall, open-shelf storage unit that works equally well for books, decor, or pantry goods.",
        "dimensions": '30"W x 14"D x 70"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Walnut", "sku": "LOFT-WAL", "swatch_hex": "#5c4033", "stock_quantity": 7},
        ],
    },
    {
        "name": "Harbor Shoe Rack",
        "category": "Storage",
        "price": "180.00",
        "description": "A four-tier shoe rack with an angled design that fits neatly into entryways and closets.",
        "dimensions": '32"W x 12"D x 34"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "White", "sku": "HARB-WHT", "swatch_hex": "#f5f5f5", "stock_quantity": 14},
        ],
    },
    {
        "name": "Empire Chest of Drawers",
        "category": "Storage",
        "price": "760.00",
        "description": "A five-drawer chest with a compact footprint, suited for bedrooms or hallway storage.",
        "dimensions": '34"W x 18"D x 44"H',
        "material": "Engineered wood, oak veneer",
        "image": "https://images.unsplash.com/photo-1554295405-abb8fd54f153?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Oak", "sku": "EMP-OAK", "swatch_hex": "#c19a6b", "stock_quantity": 6},
        ],
    },
    {
        "name": "Nordic Sideboard",
        "category": "Storage",
        "price": "980.00",
        "description": "A minimalist sideboard with two cabinets and a central drawer, raised on tapered wooden legs.",
        "dimensions": '55"W x 17"D x 30"H',
        "material": "Engineered wood, solid wood legs",
        "image": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural Ash", "sku": "NORD-ASH", "swatch_hex": "#c19a6b", "stock_quantity": 8},
        ],
    },
    # --- Study ---
    {
        "name": "Scholar Study Table",
        "category": "Study",
        "price": "620.00",
        "description": "A compact study table with a spacious top and an under-desk shelf for books and files.",
        "dimensions": '42"W x 22"D x 29"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Oak", "sku": "SCHOL-OAK", "swatch_hex": "#c19a6b", "stock_quantity": 13},
        ],
    },
    {
        "name": "Focus Ergonomic Chair",
        "category": "Study",
        "price": "480.00",
        "description": "An ergonomic study chair with adjustable height and tilt, built for long focused sessions.",
        "dimensions": '24"W x 24"D x 38-42"H',
        "material": "Mesh, steel base",
        "image": "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Black", "sku": "FOCUS-BLK", "swatch_hex": "#1a1a1a", "stock_quantity": 12},
        ],
    },
    {
        "name": "Insight Computer Table",
        "category": "Study",
        "price": "540.00",
        "description": "A computer table with a pull-out keyboard tray and a side CPU stand for a tidy workspace.",
        "dimensions": '40"W x 20"D x 30"H',
        "material": "Engineered wood",
        "image": "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Wenge", "sku": "INS-WEN", "swatch_hex": "#3b2f2f", "stock_quantity": 9},
        ],
    },
    {
        "name": "Archive Filing Cabinet",
        "category": "Study",
        "price": "390.00",
        "description": "A slim three-drawer filing cabinet designed to fit under most study desks.",
        "dimensions": '15"W x 18"D x 26"H',
        "material": "Powder-coated steel",
        "image": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Graphite", "sku": "ARCH-GRA", "swatch_hex": "#3a3a3a", "stock_quantity": 10},
        ],
    },
    {
        "name": "Pinnacle Bookshelf",
        "category": "Study",
        "price": "610.00",
        "description": "A ladder-style bookshelf that leans against the wall, ideal for compact study corners.",
        "dimensions": '26"W x 14"D x 72"H',
        "material": "Solid pine",
        "image": "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=800&q=80",
        "variants": [
            {"color": "Natural Pine", "sku": "PIN-NAT", "swatch_hex": "#c19a6b", "stock_quantity": 7},
        ],
    },
]


def slugify(value: str) -> str:
    return value.lower().replace(" ", "-")


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        category_map: dict[str, Category] = {}
        for name in CATEGORIES:
            slug = slugify(name)
            category = db.query(Category).filter(Category.slug == slug).first()
            if not category:
                category = Category(name=name, slug=slug)
                db.add(category)
                db.flush()
            category_map[name] = category

        added = 0
        for item in PRODUCTS:
            slug = slugify(item["name"])
            if db.query(Product).filter(Product.slug == slug).first():
                continue
            product = Product(
                name=item["name"],
                slug=slug,
                description=item["description"],
                base_price=Decimal(item["price"]),
                category_id=category_map[item["category"]].id,
                dimensions=item["dimensions"],
                material=item["material"],
            )
            product.images.append(ProductImage(url=item["image"], alt_text=item["name"], position=0))
            for variant in item["variants"]:
                product.variants.append(ProductVariant(**variant))
            db.add(product)
            added += 1

        if not db.query(User).filter(User.email == "admin@maison.example").first():
            admin = User(
                email="admin@maison.example",
                hashed_password=hash_password("Admin123!"),
                full_name="Maison Admin",
                role=UserRole.admin,
            )
            db.add(admin)

        db.commit()
        print(f"Seed complete. Added {added} new products.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
