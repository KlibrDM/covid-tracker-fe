import { useState } from "react";
import { useCookies } from "react-cookie";
import { login } from "../lib/user.service";
import Router from 'next/router';
import Dialog from "./dialog";
import styles from '../styles/Login.module.css';
import { Alert, TextField } from "@mui/material";

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
        <Dialog closeFunction={() => setShowDialog(false)} width={400}>
          <form onSubmit={handleLogin} className={styles.form}>
            <h2>Login</h2>
            <TextField
              type="email"
              name="email"
              id="email"
              label="Email"
              variant="standard"
              value={email}
              onChange={handleEmailChange}
              required
              fullWidth
            />
            <TextField
              type="password"
              name="password"
              id="password"
              label="Password"
              variant="standard"
              value={password}
              onChange={handlePasswordChange}
              required
              fullWidth
            />
            <input type="submit" value="Login"/>
            {errorMessage && <Alert severity="error" className={styles.error_message}>{errorMessage.message}</Alert>}
          </form>
        </Dialog>
      }
    </>
  )
}

export default Login
