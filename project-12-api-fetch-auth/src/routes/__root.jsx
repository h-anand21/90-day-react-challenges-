import { Outlet, createRootRoute } from '@tanstack/react-router';
import './routes.css';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
