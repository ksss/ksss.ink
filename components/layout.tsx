import Link from 'next/link'
import Meta from "./meta"

export default function Layout({ children }) {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <header className="px-5 text-white" style={{ background: "linear-gradient(270deg, #FFF, #000)" }}>
          <Link href="/">
            ksss.ink
          </Link>
        </header>
        <main className="container mx-auto px-5">
          {children}
        </main>
      </div>
    </>
  )
}
