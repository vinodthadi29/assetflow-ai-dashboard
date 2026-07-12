'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Shield, Bell, Database, Key, Zap } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('team')

  const teams = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@company.com', role: 'Asset Manager', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Department Head', status: 'active' },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your organization and platform configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              {[
                { id: 'team', label: 'Team Members', icon: Users },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'integration', label: 'Integrations', icon: Zap },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Team Members Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Team Members</h2>
                    <p className="text-muted-foreground">Manage your team members and their permissions</p>
                  </div>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Users className="w-4 h-4" />
                    Add Member
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {teams.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition">
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-muted-foreground">{member.role}</span>
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-500/10 text-green-500 rounded">
                              {member.status}
                            </span>
                            <Button size="sm" variant="outline">Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Password & Authentication
                    </CardTitle>
                    <CardDescription>Manage your password and authentication methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                      </div>
                      <Button variant="outline">Change</Button>
                    </div>
                    <div className="flex justify-between items-center p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Role-Based Access Control
                    </CardTitle>
                    <CardDescription>Configure permissions for different user roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Admin', 'Asset Manager', 'Department Head', 'Employee'].map((role) => (
                        <div key={role} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <span className="font-medium">{role}</span>
                          <Button size="sm" variant="outline">Configure</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {[
                      { label: 'Asset Maintenance Alerts', description: 'Get notified when maintenance is due' },
                      { label: 'Allocation Approvals', description: 'Receive updates on pending allocations' },
                      { label: 'Audit Reminders', description: 'Get reminded about upcoming audits' },
                      { label: 'System Updates', description: 'Notifications about platform updates' },
                    ].map((notif) => (
                      <div key={notif.label} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{notif.label}</p>
                          <p className="text-sm text-muted-foreground">{notif.description}</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded border-border" defaultChecked />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Integrations</h2>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {[
                      { name: 'Slack', description: 'Get notifications in Slack', status: 'connected' },
                      { name: 'Microsoft Teams', description: 'Share reports with Teams', status: 'not_connected' },
                      { name: 'Salesforce', description: 'Sync customer data', status: 'not_connected' },
                      { name: 'QuickBooks', description: 'Integrate financial data', status: 'connected' },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              integration.status === 'connected'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}
                          >
                            {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                          </span>
                          <Button size="sm" variant="outline">
                            {integration.status === 'connected' ? 'Manage' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
