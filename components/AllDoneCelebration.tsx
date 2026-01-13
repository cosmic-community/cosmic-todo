'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '@/components/ThemeProvider'
import { StyleTheme } from '@/types'

interface AllDoneCelebrationProps {
  onComplete: () => void
}

// Individual spark in a firework burst
function Spark({ 
  color, 
  angle,
  delay,
  distance
}: { 
  color: string
  angle: number
  delay: number
  distance: number
}) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-firework-spark"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 6px 2px ${color}`,
        animationDelay: `${delay}ms`,
        '--spark-angle': `${angle}deg`,
        '--spark-distance': `${distance}px`,
      } as React.CSSProperties}
    />
  )
}

// A single firework burst
function FireworkBurst({ 
  x, 
  y, 
  colors, 
  delay,
  size = 'medium'
}: { 
  x: number
  y: number
  colors: string[]
  delay: number
  size?: 'small' | 'medium' | 'large'
}) {
  const sparkCount = size === 'large' ? 24 : size === 'medium' ? 18 : 12
  const baseDistance = size === 'large' ? 120 : size === 'medium' ? 90 : 60
  
  // Generate sparks in a circular pattern
  const sparks = Array.from({ length: sparkCount }, (_, i) => {
    const angle = (i / sparkCount) * 360
    const distance = baseDistance + (Math.random() * 30 - 15)
    const color = colors[i % colors.length]
    return { angle, distance, color, id: i }
  })
  
  // Add some inner sparks for depth
  const innerSparks = Array.from({ length: Math.floor(sparkCount / 2) }, (_, i) => {
    const angle = (i / (sparkCount / 2)) * 360 + 15
    const distance = baseDistance * 0.5 + (Math.random() * 20 - 10)
    const color = colors[(i + 2) % colors.length]
    return { angle, distance, color, id: i + sparkCount }
  })
  
  return (
    <div 
      className="absolute animate-firework-launch"
      style={{ 
        left: `${x}%`, 
        bottom: '-50px',
        '--launch-height': `${y}vh`,
        animationDelay: `${delay}ms`
      } as React.CSSProperties}
    >
      {/* Burst container - appears after launch */}
      <div 
        className="relative animate-firework-burst"
        style={{ animationDelay: `${delay + 400}ms` }}
      >
        {sparks.map((spark) => (
          <Spark
            key={spark.id}
            color={spark.color}
            angle={spark.angle}
            distance={spark.distance}
            delay={delay + 400}
          />
        ))}
        {innerSparks.map((spark) => (
          <Spark
            key={spark.id}
            color={spark.color}
            angle={spark.angle}
            distance={spark.distance}
            delay={delay + 450}
          />
        ))}
        {/* Center flash */}
        <div 
          className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full animate-firework-flash"
          style={{ 
            backgroundColor: colors[0],
            boxShadow: `0 0 20px 10px ${colors[0]}`,
            animationDelay: `${delay + 400}ms`
          }}
        />
      </div>
    </div>
  )
}

// Trail/rocket going up
function FireworkTrail({
  x,
  y,
  color,
  delay
}: {
  x: number
  y: number
  color: string
  delay: number
}) {
  return (
    <div
      className="absolute w-1 h-3 rounded-full animate-firework-trail"
      style={{
        left: `${x}%`,
        bottom: '-50px',
        backgroundColor: color,
        boxShadow: `0 0 4px 2px ${color}`,
        '--launch-height': `${y}vh`,
        animationDelay: `${delay}ms`
      } as React.CSSProperties}
    />
  )
}

export default function AllDoneCelebration({ onComplete }: AllDoneCelebrationProps) {
  const { styleTheme } = useTheme()
  const [isVisible, setIsVisible] = useState(true)
  const [showText, setShowText] = useState(false)
  
  // Theme-aware firework colors
  const getFireworkColors = (): string[][] => {
    const themeColors: Record<StyleTheme, string[][]> = {
      'ocean': [
        ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],
        ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'],
        ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
      ],
      'forest': [
        ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
        ['#84cc16', '#a3e635', '#bef264', '#d9f99d'],
        ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      ],
      'sunset': [
        ['#f97316', '#fb923c', '#fdba74', '#fed7aa'],
        ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
        ['#eab308', '#facc15', '#fde047', '#fef08a'],
      ],
      'rose': [
        ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'],
        ['#e879f9', '#d946ef', '#c026d3', '#a855f7'],
        ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
      ],
      'lavender': [
        ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
        ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
      ],
      'peach': [
        ['#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
        ['#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
        ['#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'],
      ],
      'mint': [
        ['#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
        ['#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'],
        ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      ],
      'default': [
        ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
        ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8'],
        ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
      ]
    }
    return themeColors[styleTheme] || themeColors['default']
  }
  
  const colorSets = getFireworkColors()
  
  // Generate multiple firework bursts at different positions and times
  const fireworks = [
    { x: 20, y: 60, colors: colorSets[0], delay: 0, size: 'large' as const },
    { x: 50, y: 70, colors: colorSets[1 % colorSets.length], delay: 200, size: 'large' as const },
    { x: 80, y: 55, colors: colorSets[2 % colorSets.length], delay: 400, size: 'large' as const },
    { x: 35, y: 75, colors: colorSets[0], delay: 600, size: 'medium' as const },
    { x: 65, y: 65, colors: colorSets[1 % colorSets.length], delay: 800, size: 'medium' as const },
    { x: 15, y: 50, colors: colorSets[2 % colorSets.length], delay: 1000, size: 'medium' as const },
    { x: 85, y: 70, colors: colorSets[0], delay: 1100, size: 'medium' as const },
    { x: 50, y: 80, colors: colorSets[1 % colorSets.length], delay: 1300, size: 'large' as const },
    { x: 30, y: 60, colors: colorSets[2 % colorSets.length], delay: 1500, size: 'small' as const },
    { x: 70, y: 55, colors: colorSets[0], delay: 1600, size: 'small' as const },
  ]
  
  useEffect(() => {
    // Show text after fireworks start
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 600)
    
    // Hide celebration after animation completes
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 4000)
    
    return () => {
      clearTimeout(textTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete])
  
  if (!isVisible || typeof document === 'undefined') {
    return null
  }
  
  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden bg-black/20">
      {/* Firework trails and bursts */}
      {fireworks.map((fw, i) => (
        <div key={i}>
          <FireworkTrail
            x={fw.x}
            y={fw.y}
            color={fw.colors[0]}
            delay={fw.delay}
          />
          <FireworkBurst
            x={fw.x}
            y={fw.y}
            colors={fw.colors}
            delay={fw.delay}
            size={fw.size}
          />
        </div>
      ))}
      
      {/* Celebration text */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-celebration-text text-center px-4">
            <div className="text-6xl md:text-8xl mb-4">🎆</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              All Done!
            </h2>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              You completed all your tasks!
            </p>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
