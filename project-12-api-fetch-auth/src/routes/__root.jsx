import { Outlet, Link, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Login</Link> | {' '}
        <Link to="/register">Register</Link> |{' '}
        <Link to="/profile">Profile</Link>
      </nav>
      <hr />

      <Outlet />
    </div>
  );
}
