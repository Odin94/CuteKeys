import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { appsById } from '@/data/apps'

export const Route = createFileRoute('/app/$appId')({
  beforeLoad({ params }) {
    if (!appsById[params.appId]) {
      throw redirect({ to: '/' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return <Outlet />
}
