import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import PostHeader from '../../../components/post-header'
import PostBody from '../../../components/post-body'
import PostFooter from '../../../components/post-footer'
import { getAllPosts, getPostBySlug } from '../../../lib/api'
import markdownToHtml from '../../../lib/markdownToHtml'
import Layout from '../../../components/layout'

const Post = ({ post }) => {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  if (router.isFallback) {
    return <>Loading…</>
  }
  return (
    <Layout>
      <article className="mb-32 max-w-2xl mx-auto">
        <Head>
          <title>
            {post.title}
          </title>
          <meta property="og:image" content={post.ogImage || die} />
        </Head>
        {post.preview ? <h1 className="bg-yellow-400">preview</h1> : ''}
        <PostHeader
          title={post.title}
          date={post.date}
        />
        <PostBody content={post.content} />
        <PostFooter />
      </article>
    </Layout>
  )
}

export default Post

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug)
  const content = await markdownToHtml(post.content || '')
  const images = 'https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg'
  const ogImage = `https://og-image.now.sh/${encodeURIComponent(post.title)
    }.png?theme=light&md=1&fontSize=100px&images=${images}`

  return {
    props: {
      post: {
        ...post,
        content,
        ogImage,
      }
    }
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts()

  return {
    paths: posts.map(posts => {
      return {
        params: {
          slug: posts.slug,
        }
      }
    }),
    fallback: false,
  }
}
