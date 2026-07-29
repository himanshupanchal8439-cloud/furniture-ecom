"""Seed the Wood & Ply Design Catalogue with starter content.

Run from backend/: .venv/Scripts/python.exe scripts/seed_materials.py
Safe to re-run — upserts by slug.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal  # noqa: E402
from app.models.material import Material, MaterialType  # noqa: E402


def placeholder_image(slug: str) -> str:
    return f"https://picsum.photos/seed/{slug}/900/700"


UNSPLASH_PARAMS = "w=900&h=700&fit=crop&auto=format&q=80"

MATERIAL_IMAGES = {
    "teak-wood": f"https://images.unsplash.com/photo-1515446134809-993c501ca304?{UNSPLASH_PARAMS}",
    "sheesham-wood": f"https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?{UNSPLASH_PARAMS}",
    "mango-wood": f"https://plus.unsplash.com/premium_photo-1675635570623-e4e9ed633e4b?{UNSPLASH_PARAMS}",
    "pine-wood": f"https://images.unsplash.com/photo-1611072337226-1140ab367200?{UNSPLASH_PARAMS}",
    "oak-walnut": f"https://images.unsplash.com/photo-1736506159893-22cca29b8018?{UNSPLASH_PARAMS}",
    "bwp-ply": f"https://images.unsplash.com/photo-1644925757334-d0397c01518c?{UNSPLASH_PARAMS}",
    "mr-grade-ply": f"https://images.unsplash.com/photo-1620671716215-b2c6609996fe?{UNSPLASH_PARAMS}",
    "marine-ply": f"https://images.unsplash.com/photo-1576092762791-dd9e2220abd1?{UNSPLASH_PARAMS}",
    "block-board": f"https://images.unsplash.com/photo-1700973408133-b45276ec8feb?{UNSPLASH_PARAMS}",
    "flexi-ply": f"https://images.unsplash.com/photo-1700906026482-f409e961aabc?{UNSPLASH_PARAMS}",
    "veneer-finish": f"https://images.unsplash.com/photo-1762978902169-e5789f7b56b8?{UNSPLASH_PARAMS}",
}


MATERIALS = [
    dict(
        name="Teak Wood",
        slug="teak-wood",
        type=MaterialType.wood,
        subtype="Premium Hardwood",
        short_description=(
            "Teak is one of the strongest and most water-resistant hardwoods available, prized for its "
            "natural golden-brown tone and long life. It's the go-to choice for furniture that needs to "
            "last generations."
        ),
        details=(
            "Naturally resistant to moisture, warping, and pests thanks to its high oil content, teak "
            "works beautifully both indoors and outdoors. It ages gracefully, developing a rich patina "
            "over time. Comes with a minimum 5-year structural warranty on solid-teak pieces."
        ),
        best_use="Living Room, Outdoor, Dining",
        finish="Natural / Matte Polish",
        price_min=45000,
        price_max=120000,
        durability_rating="Very High",
        waterproof=True,
        warranty_info="5-year structural warranty",
        position=1,
    ),
    dict(
        name="Sheesham Wood",
        slug="sheesham-wood",
        type=MaterialType.wood,
        subtype="Indian Rosewood",
        short_description=(
            "Sheesham (Indian Rosewood) is loved for its bold, distinctive grain pattern and rich reddish-brown "
            "colour. It's a dense, sturdy wood that holds up well to daily use."
        ),
        details=(
            "Highly durable and resistant to scratches and dents, sheesham is a favourite for statement "
            "furniture pieces where the natural grain is left visible. Each piece has a unique pattern, "
            "so no two items look exactly alike."
        ),
        best_use="Bedroom, Living Room, Study",
        finish="Natural / Walnut Polish",
        price_min=30000,
        price_max=85000,
        durability_rating="High",
        waterproof=False,
        warranty_info="3-year structural warranty",
        position=2,
    ),
    dict(
        name="Mango Wood",
        slug="mango-wood",
        type=MaterialType.wood,
        subtype="Eco-Friendly Hardwood",
        short_description=(
            "Mango wood is an affordable, eco-friendly choice sourced from mango trees that no longer bear "
            "fruit. It offers a warm, natural look at a fraction of the cost of teak or sheesham."
        ),
        details=(
            "A sustainable option that repurposes wood instead of felling new trees, mango wood is sturdy "
            "enough for everyday furniture and takes stains and finishes well, making it easy to match "
            "different interior styles."
        ),
        best_use="Bedroom, Dining, Kids' Room",
        finish="Natural / Painted / Stained",
        price_min=15000,
        price_max=45000,
        durability_rating="Medium-High",
        waterproof=False,
        warranty_info="2-year structural warranty",
        position=3,
    ),
    dict(
        name="Pine Wood",
        slug="pine-wood",
        type=MaterialType.wood,
        subtype="Softwood",
        short_description=(
            "Pine is a lightweight, budget-friendly softwood with a light, natural colour — ideal for those "
            "starting out or furnishing a second home without a heavy price tag."
        ),
        details=(
            "Easy to move and reconfigure thanks to its light weight, pine is best suited to low-to-moderate "
            "use furniture. It takes paint and whitewash finishes especially well, popular for casual and "
            "Scandinavian-style interiors."
        ),
        best_use="Kids' Room, Study, Budget Furniture",
        finish="Painted / Whitewash / Natural",
        price_min=8000,
        price_max=25000,
        durability_rating="Medium",
        waterproof=False,
        warranty_info="1-year structural warranty",
        position=4,
    ),
    dict(
        name="Oak & Walnut",
        slug="oak-walnut",
        type=MaterialType.wood,
        subtype="Premium Imported Hardwood",
        short_description=(
            "Our premium range in Oak and Walnut brings a refined texture and deep, luxurious finish to "
            "statement pieces — for customers who want the very best."
        ),
        details=(
            "Oak offers a light, prominent grain while Walnut brings a dark, sophisticated tone — both are "
            "extremely durable and finished with premium lacquers for a smooth, furniture-showroom feel. "
            "Reserved for our premium collection."
        ),
        best_use="Living Room, Home Office, Statement Pieces",
        finish="Premium Lacquer / Oiled",
        price_min=80000,
        price_max=250000,
        durability_rating="Very High",
        waterproof=False,
        warranty_info="5-year structural warranty",
        position=5,
    ),
    dict(
        name="BWP Ply (Boiling Water Proof)",
        slug="bwp-ply",
        type=MaterialType.plywood,
        subtype="BWP Grade",
        short_description=(
            "BWP (Boiling Water Proof) ply is the toughest plywood grade, built to withstand continuous "
            "exposure to water and humidity without delaminating."
        ),
        details=(
            "Manufactured with phenol-formaldehyde resin and hot-pressed for maximum bonding strength, "
            "BWP ply is the industry standard for kitchen and bathroom units where moisture exposure is "
            "constant."
        ),
        best_use="Kitchen Units, Bathroom Cabinets",
        finish="Laminate / Veneer Top",
        price_min=4500,
        price_max=8500,
        durability_rating="Very High",
        waterproof=True,
        warranty_info="10-year warranty against water damage",
        position=6,
    ),
    dict(
        name="MR Grade Ply (Moisture Resistant)",
        slug="mr-grade-ply",
        type=MaterialType.plywood,
        subtype="MR Grade",
        short_description=(
            "MR (Moisture Resistant) ply handles everyday humidity well and is the most commonly used grade "
            "for regular indoor furniture."
        ),
        details=(
            "A cost-effective choice for wardrobes, beds, and cabinets that aren't directly exposed to "
            "standing water. Offers a good balance of strength, finish, and price for general furniture use."
        ),
        best_use="Wardrobes, Beds, Cabinets",
        finish="Laminate / Veneer Top",
        price_min=2800,
        price_max=5500,
        durability_rating="High",
        waterproof=False,
        warranty_info="5-year warranty",
        position=7,
    ),
    dict(
        name="Marine Ply",
        slug="marine-ply",
        type=MaterialType.plywood,
        subtype="Marine Grade",
        short_description=(
            "Marine ply is built for maximum durability and full waterproofing — originally designed for "
            "boat-building, now used wherever furniture faces heavy wear or wet conditions."
        ),
        details=(
            "Made with tightly bonded veneers and premium adhesives, marine ply resists warping, fungal "
            "growth, and delamination even under prolonged water contact. The most durable — and most "
            "premium-priced — plywood grade we offer."
        ),
        best_use="Outdoor-Adjacent Furniture, Wet Areas",
        finish="Natural / Laminate",
        price_min=5500,
        price_max=9500,
        durability_rating="Very High",
        waterproof=True,
        warranty_info="10-year warranty against water damage",
        position=8,
    ),
    dict(
        name="Block Board",
        slug="block-board",
        type=MaterialType.plywood,
        subtype="Block Board",
        short_description=(
            "Block board is made from solid wood strips sandwiched between veneers, giving it excellent "
            "screw-holding strength — ideal for doors and large flat panels."
        ),
        details=(
            "Lighter than solid plywood but stronger than particle board for large surfaces, block board "
            "resists sagging over wide spans, making it a favourite for wardrobe doors, shelving, and "
            "table tops."
        ),
        best_use="Doors, Large Panels, Shelving",
        finish="Laminate / Veneer Top",
        price_min=2200,
        price_max=4200,
        durability_rating="High",
        waterproof=False,
        warranty_info="3-year warranty",
        position=9,
    ),
    dict(
        name="Flexi Ply (Laminated Ply)",
        slug="flexi-ply",
        type=MaterialType.plywood,
        subtype="Flexible / Laminated",
        short_description=(
            "Flexi ply bends smoothly without cracking, making it the material of choice for curved "
            "furniture designs and rounded cabinet fronts."
        ),
        details=(
            "Thin, cross-laminated veneers allow this ply to flex into curves while retaining strength "
            "once fixed in place — perfect for contemporary, curved furniture silhouettes that standard "
            "ply can't achieve."
        ),
        best_use="Curved Furniture, Rounded Cabinet Fronts",
        finish="Laminate / Veneer",
        price_min=3500,
        price_max=6500,
        durability_rating="Medium-High",
        waterproof=False,
        warranty_info="3-year warranty",
        position=10,
    ),
    dict(
        name="Veneer Finish",
        slug="veneer-finish",
        type=MaterialType.plywood,
        subtype="Natural Veneer",
        short_description=(
            "A thin natural-wood veneer layer applied over plywood or block board, giving furniture the "
            "genuine wood-grain look at a fraction of solid wood's cost."
        ),
        details=(
            "Sliced from real wood logs and bonded to a stable ply base, veneer finishes bring authentic "
            "grain and texture to furniture surfaces while keeping the underlying structure lightweight "
            "and cost-effective. Available in a range of wood-tone finishes."
        ),
        best_use="Premium Cabinet Fronts, Table Tops",
        finish="Natural Wood Grain",
        price_min=3800,
        price_max=7500,
        durability_rating="High",
        waterproof=False,
        warranty_info="3-year warranty",
        position=11,
    ),
]


def run():
    db = SessionLocal()
    try:
        for data in MATERIALS:
            image_url = MATERIAL_IMAGES.get(data["slug"], placeholder_image(data["slug"]))
            existing = db.query(Material).filter(Material.slug == data["slug"]).first()
            if existing:
                for key, value in data.items():
                    setattr(existing, key, value)
                existing.image_url = image_url
            else:
                db.add(Material(image_url=image_url, **data))
        db.commit()
        print(f"Seeded {len(MATERIALS)} materials.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
