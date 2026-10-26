import React from 'react'
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
  name?: string
  className?: string
  fallback?: React.ReactNode
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  className = 'w-5 h-5 text-orange',
  fallback,
}) => {
  if (!name || typeof name !== 'string') {
    return <>{fallback || <LucideIcons.ShieldCheck className={className} />}</>
  }

  const cleanName = name.trim().toLowerCase()

  // 1. Direct and common aliases mapping
  const aliasMap: Record<string, string> = {
    // Buildings / structures
    shield: 'ShieldCheck',
    check: 'ShieldCheck',
    security: 'ShieldCheck',
    shieldcheck: 'ShieldCheck',
    // Time
    clock: 'Clock',
    time: 'Clock',
    timer: 'Clock',
    calendar: 'Calendar',
    // People
    users: 'Users',
    people: 'Users',
    team: 'Users',
    // Construction / trades
    worker: 'HardHat',
    workers: 'HardHat',
    hardhat: 'HardHat',
    shovel: 'Shovel',
    drill: 'Drill',
    // Awards
    trophy: 'Trophy',
    award: 'Award',
    awards: 'Award',
    medal: 'Medal',
    star: 'Star',
    // Navigation / home
    home: 'Home',
    house: 'Home',
    compass: 'Compass',
    // Buildings
    building: 'Building2',
    buildings: 'Building2',
    commercial: 'Building2',
    // Tools
    hammer: 'Hammer',
    renovation: 'Hammer',
    wrench: 'Wrench',
    tool: 'Wrench',
    tools: 'Wrench',
    settings: 'Settings',
    maintenance: 'Settings',
    // Infrastructure / roads
    road: 'GitMerge',
    roads: 'GitMerge',
    infrastructure: 'GitMerge',
    layers: 'Layers',
    // Charts / analytics
    chart: 'BarChart2',
    management: 'BarChart2',
    analytics: 'BarChart2',
    stats: 'BarChart2',
    barchart2: 'BarChart2',
    trendup: 'TrendingUp',
    trending: 'TrendingUp',
    trendingup: 'TrendingUp',
    growth: 'TrendingUp',
    target: 'Target',
    // Design / architecture
    ruler: 'Ruler',
    design: 'Ruler',
    architecture: 'Ruler',
    pentool: 'PenTool',
    // Business
    briefcase: 'Briefcase',
    business: 'Briefcase',
    // Clients
    smile: 'Smile',
    client: 'Smile',
    clients: 'Smile',
    happy: 'Smile',
    // Logistics
    truck: 'Truck',
    forklift: 'Truck',
    // Verification
    checkcircle: 'CheckCircle',
    verified: 'CheckCircle',
    // Contact
    phone: 'Phone',
    mail: 'Mail',
  }


  // 2. Resolve component name
  let targetIconName = aliasMap[cleanName]

  if (!targetIconName) {
    // Try PascalCase: e.g. "hard-hat" -> "HardHat", "shield_check" -> "ShieldCheck", "clock" -> "Clock"
    const pascal = cleanName
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
      .replace(/^\w/, (c) => c.toUpperCase())

    if (pascal in LucideIcons) {
      targetIconName = pascal
    }
  }

  const IconComponent = targetIconName
    ? (LucideIcons as Record<string, any>)[targetIconName]
    : null

  if (IconComponent && (typeof IconComponent === 'function' || typeof IconComponent === 'object')) {
    return <IconComponent className={className} />
  }

  return <>{fallback || <LucideIcons.Sparkles className={className} />}</>
}

export default DynamicIcon


