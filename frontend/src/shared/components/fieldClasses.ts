import styles from './FormField.module.css'

/** Classe do controle (input/select/textarea); pinta a borda de erro quando inválido. */
export function campoClasses(invalido: boolean): string {
  return `${styles.controle} ${invalido ? styles.invalido : ''}`.trim()
}

/** Id do parágrafo de erro, para amarrar via aria-describedby no controle. */
export function idErro(id: string): string {
  return `${id}-erro`
}
