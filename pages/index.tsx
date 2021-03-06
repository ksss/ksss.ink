import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>ksss.ink</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to ksss.ink
        </h1>

        <Image
          height={200}
          width={200}
          src="/icon.jpg"
          className={styles.borderCircle}
        />

        <div className={styles.grid}>
          <Link href="/blog">
            <a className={styles.card}>
              <h3>Blog &rarr;</h3>
            </a>
          </Link>
          <Link href="/profile">
            <a className={styles.card}>
              <h3>Profile &rarr;</h3>
            </a>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
