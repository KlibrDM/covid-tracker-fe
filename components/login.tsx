import { useState } from "react";
import { useCookies } from "react-cookie";
import { login } from "../lib/login";
import Router from 'next/router';
import Dialog from "./dialog";
import styles from '../styles/Login.module.css';

const Login = () => {
  const [cookie, setCookie] = useCookies(["user"]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<{message: string} | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  }

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if(response.message){
        setErrorMessage(response);
      }
      else{
        setCookie("user", JSON.stringify(response), {
          path: "/",
          maxAge: 86400 * 30, // Expires after 30 days
          sameSite: true,
        });
        Router.reload();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <button className={styles.login_button} onClick={() => setShowDialog(true)}>Login</button>
      {
        showDialog &&
        <Dialog closeFunction={() => setShowDialog(false)}>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.form_group}>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" value={email} onChange={handleEmailChange} required/>
            </div>
            <div className={styles.form_group}>
              <label htmlFor="passsword">Password</label>
              <input type="password" name="password" id="password" value={password} onChange={handlePasswordChange} required/>
            </div>
            <input type="submit" value="Login"/>
            {errorMessage && <p className={styles.error_message}>{errorMessage.message}</p>}
          </form>
        </Dialog>
      }
    </>
  )
}

export default Login
