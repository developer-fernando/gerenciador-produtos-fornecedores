import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkAtivo : ''}`

// Ponto único para trocar pela logo real quando o arquivo for fornecido:
// basta importar o asset e atribuir a `logoSrc`. Enquanto null, usa o
// fallback textual "Horizon" (preto sobre amarelo — regras do docs/05).
const logoSrc: string | null = null

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/empresas" className={styles.brand} aria-label="Horizon — início">
          {logoSrc ? (
            <img src={logoSrc} alt="Horizon" className={styles.logo} />
          ) : (
            <>
              <span className={styles.brandMark} aria-hidden="true">
                H
              </span>
              <span className={styles.brandName}>Horizon</span>
            </>
          )}
        </Link>
        <nav className={styles.nav} aria-label="Seções">
          <NavLink to="/empresas" className={navItemClass}>
            Empresas
          </NavLink>
          <NavLink to="/produtos" className={navItemClass}>
            Produtos
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
