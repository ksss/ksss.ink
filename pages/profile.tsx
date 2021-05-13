import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/layout'
import style from '../styles/Profile.module.css'

export default function Profile() {
  return (
    <Layout>
      <div className="flex py-3">
        <Image
          height={100}
          width={100}
          src="/icon.jpg"
          className="rounded-full"
        />
        <div className="mx-3 text-4xl flex items-center justify-center">
          ksss
        </div>
      </div>

      <ul className={style.list}>
        <li>
          twitter: <a href="https://twitter.com/_ksss_">@_ksss_</a>
        </li>
        <li>
          github: <a href="https://github.com/ksss">ksss</a>
        </li>
        <li>
          hatena blog: <a href="https://ksss9.hatenablog.com/">ksss9.hatenablog.com</a>
        </li>
      </ul>
    </Layout>
  )
}
