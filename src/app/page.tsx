import styles from './page.module.css'
import { Demo } from './Demo'

export default function Home() {
  return (
    <div className={styles.page}>
      <Demo />
    </div>
  )
}
