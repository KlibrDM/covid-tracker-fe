import styles from '../styles/Dialog.module.css'

const Dialog = ({ children, closeFunction, width }: any) => {
  const closeHandler = (e: any) => {
    if(e.target === e.currentTarget){
      closeFunction();
    }
  }

  return (
    <div className={styles.cover} onMouseDown={closeHandler}>
      <div className={styles.center}>
        <div className={styles.dialog_bar}></div>
        <div className={styles.dialog} style={{width}}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Dialog
