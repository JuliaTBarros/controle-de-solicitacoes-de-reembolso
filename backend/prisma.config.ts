import { defineConfig } from 'prisma/config'
import 'dotenv/config'

const config = defineConfig({
  migrations: {
    seed: 'tsx prisma/seeds/index.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})

export default config
