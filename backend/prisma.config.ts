import { defineConfig } from 'prisma/config'
import 'dotenv/config'

const config = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})

export default config
