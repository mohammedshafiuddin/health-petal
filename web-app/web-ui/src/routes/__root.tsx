import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">Car-Safar</h1>
          <nav className="space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-500">About</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-blue-500">Privacy Policy</Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  ),
})
