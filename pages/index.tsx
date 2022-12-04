import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../shared-components/layout'

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Home</title>
        <meta name="description" content="CovidTracker Home" />
      </Head>

      <section>
        Home
      </section>
    </Layout>
  )
}

export default Home
