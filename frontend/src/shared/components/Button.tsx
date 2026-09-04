import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variante =
  | 'primario'
  | 'secundario'
  | 'fantasma'
  | 'perigo'
  | 'perigoFantasma'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  pequeno?: boolean
}

export function Button({
  variante = 'secundario',
  pequeno = false,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[variante], pequeno ? styles.pequeno : '', className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...rest} />
}
