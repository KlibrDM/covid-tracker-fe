import { useCookies } from "react-cookie";
import Router from 'next/router';
import styles from '../styles/Signout.module.css'

const SignOut = () => {
  const [cookie, setCookie, removeCookie] = useCookies(["user"])

  const handleSignOut = async () => {
    try {
      removeCookie("user");
      if(Router.pathname === "/"){
        Router.reload();
      }
      else{
        Router.push("/");
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <button onClick={handleSignOut} className={styles.signout_button}>
        Sign Out
      </button>
    </>
  )
}

export default SignOut
