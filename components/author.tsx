import Image from 'next/image'

export default function Author() {
  return (
    <div className="flex py-3">
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

  )
}
