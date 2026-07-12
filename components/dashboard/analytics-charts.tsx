'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AssetUtilizationChart() {
  const data = [
    { name: 'In Use', value: 240 },
    { name: 'Available', value: 120 },
    { name: 'Maintenance', value: 45 },
    { name: 'Retired', value: 20 },
  ]

  const COLORS = ['#ff6b35', '#00d4ff', '#a78bfa', '#8b92a0']

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Asset Utilization</CardTitle>
        <CardDescription>Current asset status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MaintenanceTrendChart() {
  const data = [
    { month: 'Jan', scheduled: 12, completed: 10, overdue: 2 },
    { month: 'Feb', scheduled: 15, completed: 14, overdue: 1 },
    { month: 'Mar', scheduled: 18, completed: 17, overdue: 1 },
    { month: 'Apr', scheduled: 14, completed: 13, overdue: 1 },
    { month: 'May', scheduled: 20, completed: 18, overdue: 2 },
    { month: 'Jun', scheduled: 16, completed: 15, overdue: 1 },
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Maintenance Trends</CardTitle>
        <CardDescription>Scheduled vs completed maintenance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="scheduled" fill="#ff6b35" />
            <Bar dataKey="completed" fill="#00d4ff" />
            <Bar dataKey="overdue" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AssetAgeDistributionChart() {
  const data = [
    { year: '0-1 yr', count: 45 },
    { year: '1-3 yr', count: 87 },
    { year: '3-5 yr', count: 102 },
    { year: '5-10 yr', count: 68 },
    { year: '10+ yr', count: 23 },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Asset Age Distribution</CardTitle>
        <CardDescription>Assets by age group</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ff6b35" strokeWidth={2} dot={{ fill: '#ff6b35', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CostAnalysisChart() {
  const data = [
    { category: 'Acquisition', amount: 125000 },
    { category: 'Maintenance', amount: 45000 },
    { category: 'Depreciation', amount: 35000 },
    { category: 'Insurance', amount: 22000 },
    { category: 'Disposal', amount: 8000 },
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
        <CardDescription>Annual asset lifecycle costs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" width={100} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="amount" fill="#00d4ff" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
