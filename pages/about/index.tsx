import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../components/layout'

const About: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>About</title>
        <meta name="description" content="CovidTracker About" />
      </Head>

      <section>
        About
      </section>
    </Layout>
  )
}

export default About
