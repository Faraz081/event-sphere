
const STYLES = {
  dashboard: {
    available: "border-gold/60 bg-gold/10 text-gold",
    pending: "border-amber-400/50 bg-amber-400/10 text-amber-300",
    reserved: "border-emerald/50 bg-emerald/10 text-emerald",
    occupied: "border-border bg-background text-muted opacity-70",
    ring: "ring-2 ring-gold ring-offset-2 ring-offset-background",
    badge: "bg-gold text-background",
  },
  website: {
    available: "border-[#c49424] bg-[#fff4d9] text-[#8d681b]",
    pending: "border-amber-300 bg-amber-50 text-amber-800",
    reserved: "border-green-300 bg-green-50 text-green-800",
    occupied: "border-gray-300 bg-gray-100 text-gray-600",
    ring: "ring-2 ring-[#c49424] ring-offset-2",
    badge: "bg-[#c49424] text-white",
  },
};

const LABELS = {
  available: "Available",
  pending: "Pending",
  reserved: "Reserved",
  occupied: "Occupied",
};

const FloorPlan = ({ booths = [], onSelect, selectedId, mineIds = [], variant = "dashboard" }) => {
  const s = STYLES[variant] ?? STYLES.dashboard;

  // A-2 should come before A-10
  const sorted = [...booths].sort((a, b) =>
    String(a.boothNumber).localeCompare(String(b.boothNumber), undefined, { numeric: true })
  );

  const count = (status) => booths.filter((b) => b.status === status).length;

  if (booths.length === 0) {
    return <p className="text-sm opacity-70">No booths have been added to this expo yet.</p>;
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        {Object.keys(LABELS).map((key) => (
          <span key={key} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm border ${s[key]}`} />
            {LABELS[key]} ({count(key)})
          </span>
        ))}
      </div>

      {/* Hall */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map((b) => {
          const selectable = !!onSelect && b.status === "available";
          const mine = mineIds.includes(b._id);
          const Tag = selectable ? "button" : "div";

          return (
            <Tag
              key={b._id}
              type={selectable ? "button" : undefined}
              onClick={selectable ? () => onSelect(b) : undefined}
              className={`relative rounded-2xl border-2 p-4 text-left transition ${s[b.status] ?? s.available} ${
                selectable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
              } ${selectedId === b._id ? s.ring : ""}`}
            >
              {mine && (
                <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                  Yours
                </span>
              )}
              <p className="font-mono text-lg font-bold">{b.boothNumber}</p>
              <p className="mt-1 text-xs capitalize">
                {b.status}
                {b.size ? ` · ${b.size}` : ""}
              </p>
              <p className="mt-2 truncate text-xs font-medium">
                {b.companyName || (b.status === "available" ? "Open booth" : "Taken")}
              </p>
              {b.location && <p className="mt-1 truncate text-[11px] opacity-70">{b.location}</p>}
            </Tag>
          );
        })}
      </div>
    </div>
  );
};

export default FloorPlan;