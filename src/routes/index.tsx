import { HeroSection } from '@/components/home/hero-section'
import { AppCard } from '@/components/home/app-card'
import { apps } from '@/data/apps'

export const HomePage = () => (
  <div>
    <HeroSection />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
      {apps.map((app, i) => (
        <AppCard key={app.id} app={app} index={i} />
      ))}
    </div>
  </div>
)
