import { defineConfig } from '@prisma/config'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is required for prisma migrate dev')
}

export default defineConfig({
  datasource: {
    url,
  },
})


