import Head from 'next/head'
import styles from '../styles/Layout.module.css'
import Nav from './nav'

const Layout = ({ children }: any) => {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />

      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default Layout
