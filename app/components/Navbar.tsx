import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <i className="fa-brands fa-facebook text-2xl" />
          <span>FbaLens</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <i className="fa-solid fa-house" />
            Accueil
          </Link>
          <Link href="/app" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <i className="fa-solid fa-magnifying-glass" />
            Recherche
          </Link>
          <Link
            href="/app"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-rocket" />
            Démarrer
          </Link>
        </div>
      </div>
    </nav>
  );
}
