import { Link, NavLink } from 'react-router-dom'
import logoSrc from '../assets/horizon-logo.jpg'
import styles from './Header.module.css'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkAtivo : ''}`

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/empresas" className={styles.brand} aria-label="Horizon — início">
          <img src={logoSrc} alt="Horizon" className={styles.logo} />
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
