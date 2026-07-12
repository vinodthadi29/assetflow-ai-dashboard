'use client'

import { ArrowRight, Zap, BarChart3, Lock, Cpu, Bell } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a2332]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AssetFlow
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <Link href="/assets" className="text-sm text-muted-foreground hover:text-foreground transition">
              Assets
            </Link>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50">
                  <span className="text-xs font-semibold text-primary">NEW</span>
                  <span className="text-xs text-muted-foreground">AI-Powered Asset Intelligence Now Available</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Enterprise Assets,
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {' '}Intelligent Management
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  AssetFlow AI revolutionizes enterprise asset management with autonomous intelligence, real-time tracking, and predictive maintenance.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-lg text-primary-foreground font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
                <button className="px-6 py-3 border border-border rounded-lg text-foreground font-medium hover:bg-card transition">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div>
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Assets Tracked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-2xl p-8 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Real-time Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium">Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Enterprise Security</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span className="text-xs font-semibold text-primary">AI Status: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features Built for Enterprise</h2>
            <p className="text-lg text-muted-foreground">Everything you need to manage assets at scale</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Asset Management?</h2>
            <p className="text-xl text-muted-foreground">Join enterprises using AssetFlow AI for intelligent asset operations</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-lg text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/50 transition group"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            © 2025 AssetFlow AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Cpu,
    title: 'AI-Powered Analytics',
    description: 'Autonomous intelligence predicts maintenance needs and optimizes asset utilization in real-time.'
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    description: 'Stay informed with instant alerts for asset status changes, maintenance schedules, and compliance issues.'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Role-based access control, audit trails, and encryption ensure your asset data stays protected.'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and reports provide deep insights into asset performance and ROI.'
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate allocation, booking, maintenance, and approval workflows to eliminate manual overhead.'
  },
  {
    icon: Lock,
    title: 'Compliance Ready',
    description: 'Built-in compliance tools and audit management ensure regulatory adherence across all operations.'
  }
]
