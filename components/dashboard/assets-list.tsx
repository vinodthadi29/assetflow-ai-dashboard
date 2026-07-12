'use client'

import { MoreVertical, AlertTriangle, CheckCircle2 } from 'lucide-react'

const assets = [
  {
    id: 'AST-001',
    name: 'MacBook Pro 16"',
    category: 'Computers',
    owner: 'John Smith',
    status: 'active',
    location: 'Office A - Desk 1',
    value: '$2,499',
  },
  {
    id: 'AST-002',
    name: 'Dell Monitor 27"',
    category: 'Monitors',
    owner: 'Sarah Johnson',
    status: 'active',
    location: 'Office B - Desk 5',
    value: '$449',
  },
  {
    id: 'AST-003',
    name: 'Office Chair Pro',
    category: 'Furniture',
    owner: 'Mike Davis',
    status: 'maintenance',
    location: 'Warehouse',
    value: '$850',
  },
  {
    id: 'AST-004',
    name: 'Printer HP Color',
    category: 'Equipment',
    owner: 'Team Shared',
    status: 'active',
    location: 'Office A - Floor 2',
    value: '$1,299',
  },
]

export function AssetsList() {
  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <div className="p-6 border-b border-border/30">
        <h2 className="text-lg font-semibold">Assets Inventory</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border/30 bg-background/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Asset Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Value</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr
                key={idx}
                className="border-b border-border/30 hover:bg-background/30 transition"
              >
                <td className="px-6 py-4 text-sm font-medium text-primary">{asset.id}</td>
                <td className="px-6 py-4 text-sm text-foreground">{asset.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{asset.category}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{asset.owner}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-orange-500/10 text-orange-500'
                    }`}
                  >
                    {asset.status === 'active' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {asset.status === 'active' ? 'Active' : 'Maintenance'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{asset.location}</td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{asset.value}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-background/50 rounded transition">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
