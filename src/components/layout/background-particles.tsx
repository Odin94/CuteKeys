import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function BackgroundParticles() {
  const [engineReady, setEngineReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => setEngineReady(true))
  }, [])

  if (!engineReady) return null

  return (
    <Particles
      id="cutekey-particles"
      className="fixed inset-0 -z-10 pointer-events-none"
      options={{
        fpsLimit: 60,
        particles: {
          number: { value: 35, density: { enable: true } },
          color: {
            value: ['#F43F5E', '#8B5CF6', '#22C55E', '#FB923C', '#F9A8D4', '#C4B5FD'],
          },
          shape: { type: ['circle', 'star'] },
          opacity: {
            value: { min: 0.15, max: 0.35 },
            animation: { enable: true, speed: 0.5, sync: false },
          },
          size: {
            value: { min: 3, max: 8 },
            animation: { enable: true, speed: 1, sync: false },
          },
          move: {
            enable: true,
            speed: { min: 0.3, max: 0.8 },
            direction: 'top',
            random: true,
            straight: false,
            outModes: { default: 'out', top: 'destroy', bottom: 'none' },
          },
          links: { enable: false },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
          },
          modes: {
            repulse: { distance: 80, duration: 0.4 },
          },
        },
        detectRetina: true,
        emitters: {
          direction: 'top',
          rate: { delay: 0.5, quantity: 1 },
          position: { x: 50, y: 110 },
          size: { width: 100, height: 10 },
        },
      }}
    />
  )
}
