import {createClient} from '@sanity/client'
import {apiVersion, dataset, projectId} from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false, // Set to false to always get fresh data
})
