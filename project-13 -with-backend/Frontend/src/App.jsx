import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import NotFoundPage from './pages/NotFound';
import TripDetailPage from './pages/TripDetail';
import ItineraryPage from './pages/Itinerary';
import MembersPage from './pages/Members';
import ChecklistPage from './pages/Checklist';
import BudgetPage from './pages/Budget';
import ReservationsPage from './pages/Reservations';
import SettingsPage from './pages/Settings';
import AppShell from './components/AppShell';

// ─── Query Client ──────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// ─── Root Route ────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

// ─── Public Routes ─────────────────────────────────────────────────────────
const landingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage });

// ─── Protected Layout ──────────────────────────────────────────────────────
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  return <AppShell><Outlet /></AppShell>;
}

const protectedRoute = createRoute({ getParentRoute: () => rootRoute, id: 'protected', component: ProtectedLayout });

// ─── Protected Child Routes ────────────────────────────────────────────────
const dashboardRoute    = createRoute({ getParentRoute: () => protectedRoute, path: '/dashboard',               component: DashboardPage });
const tripsRoute        = createRoute({ getParentRoute: () => protectedRoute, path: '/trips',                   component: DashboardPage });
const settingsRoute     = createRoute({ getParentRoute: () => protectedRoute, path: '/settings',                component: SettingsPage });
const tripDetailRoute   = createRoute({ getParentRoute: () => protectedRoute, path: '/trips/$tripId',           component: TripDetailPage });
const itineraryRoute    = createRoute({ getParentRoute: () => tripDetailRoute, path: 'itinerary', component: ItineraryPage });
const membersRoute      = createRoute({ getParentRoute: () => tripDetailRoute, path: 'members',   component: MembersPage });
const checklistRoute    = createRoute({ getParentRoute: () => tripDetailRoute, path: 'checklist', component: ChecklistPage });
const budgetRoute       = createRoute({ getParentRoute: () => tripDetailRoute, path: 'budget',    component: BudgetPage });
const reservationsRoute = createRoute({ getParentRoute: () => tripDetailRoute, path: 'reservations', component: ReservationsPage });

// ─── Router Tree ───────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    tripsRoute,
    settingsRoute,
    tripDetailRoute.addChildren([
      itineraryRoute,
      membersRoute,
      checklistRoute,
      budgetRoute,
      reservationsRoute,
    ]),
  ]),
]);

const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundPage });

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #2e2e2e',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#1a1a1a' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
