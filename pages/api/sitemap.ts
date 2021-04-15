import { NextApiRequest, NextApiResponse } from 'next'
import { sitemap } from '../../lib/api'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.statusCode = 200
  res.setHeader('content-type', 'application/xml')
  res.write(sitemap())
  res.end()
}
