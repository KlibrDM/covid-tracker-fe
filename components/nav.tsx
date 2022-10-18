import styles from '../styles/Nav.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router';
import Login from './login';
import {withCookies} from 'react-cookie';
import Register from './register';
import SignOut from './sign-out';
import { useEffect, useState } from 'react';
import { IUser } from '../models/user';

const Nav = (props: any) => {
  const {cookies} = props;
  const [user, setuser] = useState<IUser | undefined>(undefined);
  const [cookiesLoaded, setcookiesLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    setuser(cookies.get('user'));
    setcookiesLoaded(true);
  }, []);

  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <div className={styles.nav}>
      <div className={styles.nav_header}>
        <h2 className={styles.nav_header_title}>CovidTracker</h2>
        <p className={styles.nav_header_subtitle}>Statistics Dashboard</p>
      </div>
      <div className={styles.nav_items}>
        <Link href="/">
          <a className={currentRoute === '/' ? styles.active : ''}>Home</a>
        </Link>
        <Link href="/cases">
          <a className={currentRoute === '/cases' ? styles.active : ''}>Cases</a>
        </Link>
        <Link href="/about">
          <a className={currentRoute === '/about' ? styles.active : ''}>About</a>
        </Link>
      </div>
      <div className={styles.nav_user}>
        {
          cookiesLoaded ? !user
          ?
          <>
            <Login />
            <Register />
          </>
          :
          <>
            <SignOut />
          </> : <></>
        }
      </div>
    </div>
  )
}

export default withCookies(Nav);
