import Link from 'next/link'
import { getAllPosts } from '../../lib/api'
import Layout from '../../components/layout'

const BlogIndex = ({ allPosts }) => {
  return (
    <Layout>
      <ul className="text-2xl m-10">
        {allPosts.map(post => {
          return (
            <li key={post.slug} className="my-6">
              {post.preview
                ? <>comming soon...</>
                :
                <Link href={`/blog/posts/${post.slug}`}>
                  {post.date + ' : ' + post.title}
                </Link>
              }
            </li>
          )
        })}
      </ul>
    </Layout>)
}
export default BlogIndex

export const getStaticProps = async () => {
  const allPosts = getAllPosts()

  return {
    props: { allPosts },
  }
}
