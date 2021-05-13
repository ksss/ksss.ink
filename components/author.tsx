import Image from 'next/image'
import Link from 'next/link'

export default function Author() {
  return (
    <Link href="/profile">
      <div className="flex py-3 cursor-pointer">
        <Image
          height={50}
          width={50}
          src="/icon.jpg"
          className="rounded-full"
        />
        <div className="mx-3 flex items-center justify-center">
          ksss
        </div>
      </div>
    </Link>
  )
}
