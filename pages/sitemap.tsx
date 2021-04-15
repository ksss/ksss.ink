import { GetServerSideProps } from 'next'
import { sitemap } from '../lib/api'

const Sitemap = () => null
export default Sitemap

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('content-type', 'application/xml');
  res.write(sitemap());
  res.end();
  return { props: {} }
}

