import { createLazyFileRoute, Link } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="text-gray-800">

      {/* Hero Section */}
      <main className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl font-extrabold leading-tight mb-4">
            Your Professional Ride to Work
          </h2>
          <p className="text-xl mb-8">
            Reliable, comfortable, and timely rides for your daily commute.
          </p>
          <Link
            to="/"
            className="bg-white text-blue-600 font-bold rounded-full py-4 px-8 shadow-lg uppercase tracking-wider hover:bg-gray-100"
          >
            Find a Ride
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-12">
            Why Choose Car-Safar?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-2xl font-bold mb-4">Reliable Rides</h4>
              <p>
                Never be late for a meeting again. Our drivers are punctual and
                professional.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-2xl font-bold mb-4">Easy Booking</h4>
              <p>
                Book your ride in seconds with our simple and intuitive app.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-2xl font-bold mb-4">Cash Payments</h4>
              <p>
                No need for online payments. Pay for your ride with cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">1</span>
              </div>
              <h4 className="text-2xl font-bold">Find a Ride</h4>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">2</span>
              </div>
              <h4 className="text-2xl font-bold">Book a Seat</h4>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">3</span>
              </div>
              <h4 className="text-2xl font-bold">Enjoy your Safar</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Car-Safar</h3>
              <p className="text-gray-400">
                Your Professional Ride to Work.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">About</Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/delete-data" className="text-gray-400 hover:text-white">Delete My Data</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.494v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.44-.645 1.44-1.44-.645-1.44-1.44-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.418 0-6.191 2.773-6.191 6.193 0 .486.055.959.162 1.418-5.149-.258-9.715-2.724-12.784-6.484-.533.918-.83 1.979-.83 3.103 0 2.148 1.094 4.042 2.758 5.154-.998-.031-1.936-.305-2.758-.76v.077c0 3.004 2.138 5.508 4.978 6.079-.52.142-1.067.218-1.63.218-.399 0-.785-.039-1.165-.114.79 2.463 3.082 4.258 5.803 4.311-2.123 1.664-4.803 2.655-7.712 2.655-.501 0-.995-.029-1.481-.086 2.745 1.76 6.002 2.788 9.492 2.788 11.386 0 17.614-9.435 17.614-17.614 0-.269 0-.537-.018-.804.12-.088.237-.18.35-.276z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Car-Safar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
