import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass ghost-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-heading font-bold text-2xl tracking-tight text-primary">
              InTUITMarket
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/products/featured" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Product Details
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Contact Us
            </Link>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <Link href="/studio" className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-surface-container-highest px-3 py-1 rounded-full">
              Client Login
            </Link>
            <Link
              href="/contact"
              className="gradient-primary text-primary-foreground hover:opacity-90 px-6 py-2 rounded-xl text-sm font-medium transition-opacity"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
