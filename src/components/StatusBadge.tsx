const map: Record<string, { label: string; cls: string }> = {
  approved:          { label: "Approved",          cls: "badge-approved" },
  pending:           { label: "Pending",            cls: "badge-pending"  },
  changes_requested: { label: "Changes requested",  cls: "badge-changes"  },
  rejected:          { label: "Rejected",           cls: "badge-rejected" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = map[status] ?? { label: status, cls: "badge bg-gray-100 text-gray-600" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
