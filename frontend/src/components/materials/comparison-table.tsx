const ROWS = [
  { aspect: "Best for", wood: "Statement furniture, visible grain, premium feel", ply: "Cabinets, wardrobes, wet areas, curved designs" },
  { aspect: "Water resistance", wood: "Varies by species — Teak/Marine-grade high, Pine low", ply: "Grade-dependent — BWP & Marine are fully waterproof" },
  { aspect: "Cost", wood: "Generally higher, scales with species", ply: "More budget-friendly for large surfaces" },
  { aspect: "Finish options", wood: "Natural grain, polish, oil finish", ply: "Laminate, veneer, paint — wide finish flexibility" },
  { aspect: "Best applications", wood: "Legs, frames, tabletops, statement pieces", ply: "Doors, panels, carcasses, kitchen/bath units" },
];

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-beige/40 text-left">
            <th className="p-4 font-serif-display text-base font-normal">When to use which</th>
            <th className="p-4 font-serif-display text-base font-normal text-walnut">Solid Wood</th>
            <th className="p-4 font-serif-display text-base font-normal text-walnut">Plywood</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.aspect} className="border-b border-border-subtle last:border-0">
              <td className="p-4 font-medium text-foreground/80">{row.aspect}</td>
              <td className="p-4 text-foreground/65">{row.wood}</td>
              <td className="p-4 text-foreground/65">{row.ply}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
