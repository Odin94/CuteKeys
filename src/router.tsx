import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { appsById } from "@/data/apps";
import { trainSearchSchema } from "@/types/schemas";
import { RootLayout } from "@/routes/__root";
import { HomePage } from "@/routes/index";
import { SettingsPage } from "@/routes/settings";
import { SetSelectionPage } from "@/routes/app/$appId/index";
import { DashboardPage } from "@/routes/app/$appId/dashboard";
import { TrainPage } from "@/routes/app/$appId/train";
import { ResultsPage } from "@/routes/app/$appId/results";

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const appIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/$appId",
  beforeLoad({ params }) {
    if (!appsById[params.appId]) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});

const appIdIndexRoute = createRoute({
  getParentRoute: () => appIdRoute,
  path: "/",
  component: SetSelectionPage,
});

const appIdDashboardRoute = createRoute({
  getParentRoute: () => appIdRoute,
  path: "dashboard",
  component: DashboardPage,
});

const appIdTrainRoute = createRoute({
  getParentRoute: () => appIdRoute,
  path: "train",
  validateSearch: trainSearchSchema,
  component: TrainPage,
});

const appIdResultsRoute = createRoute({
  getParentRoute: () => appIdRoute,
  path: "results",
  component: ResultsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  settingsRoute,
  appIdRoute.addChildren([
    appIdIndexRoute,
    appIdDashboardRoute,
    appIdTrainRoute,
    appIdResultsRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
