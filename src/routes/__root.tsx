import { Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { BackgroundParticles } from '@/components/layout/background-particles'
import { PageTransition } from '@/components/layout/page-transition'

export const RootLayout = () => (
  <>
    <BackgroundParticles />
    <AppShell>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </AppShell>
  </>
)
