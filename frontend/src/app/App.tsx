import styles from './App.module.css'
import { Header } from './Header'
import { AppRoutes } from './routes'

// Layout raiz: cabeçalho com a marca + área principal com as rotas.
function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
