import DateFormatter from './date-formatter'

type Props = {
  title: string
  date: string
}

const PostHeader = ({ title, date }: Props) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-lg">
        {date
          ? <DateFormatter dateString={date} />
          : <h1 className="bg-red-500">no date!!!</h1>}
      </div>
      <h1 className="text-5xl font-bold tracking-tighter leading-tight md:leading-none my-6 text-center md:text-left">
        {title}
      </h1>
    </div>
  )
}

export default PostHeader
