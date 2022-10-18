import { useState } from "react";
import { useCookies } from "react-cookie";
import Router from 'next/router';
import Dialog from "./dialog";
import styles from '../styles/Register.module.css';
import { loadLocations } from "../lib/load-locations";
import { register } from "../lib/register";

const Register = () => {
  const [cookie, setCookie] = useCookies(["user"]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<{message: string} | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ROU");
  const [locations, setLocations] = useState<{code: string, name: string}[]>([]);

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  }

  const handleLocationChange = (e: any) => {
    setSelectedLocation(e.target.value);
  }

  const handleDialogOpen = async () => {
    setShowDialog(true);
    setLocations(await loadLocations());
  }

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      const response = await register(email, password, selectedLocation);
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
      <button className={styles.register_button} onClick={handleDialogOpen}>Register</button>
      {
        showDialog &&
        <Dialog closeFunction={() => setShowDialog(false)} width={300}>
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.form_group}>
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" value={email} onChange={handleEmailChange} required/>
            </div>
            <div className={styles.form_group}>
              <label htmlFor="passsword">Password</label>
              <input type="password" name="password" id="password" value={password} onChange={handlePasswordChange} required/>
            </div>
            <div className={styles.form_group}>
              <label htmlFor="location">Location</label>
              <select name="location" id="location" value={selectedLocation} onChange={handleLocationChange}>
                {
                  locations.map((location, index) => (
                    <option key={index} value={location.code}>{location.name}</option>
                  ))
                }
              </select>
            </div>
            <input type="submit" value="Register"/>
            {errorMessage && <p className={styles.error_message}>{errorMessage.message}</p>}
          </form>
        </Dialog>
      }
    </>
  )
}

export default Register
