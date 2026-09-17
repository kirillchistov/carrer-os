import styles from "./word-field.module.css"

const WATERMARK = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 420">
    <text x="20" y="260" fill="#e8c547" font-family="ui-sans-serif,system-ui,sans-serif" font-size="128" font-weight="800" letter-spacing="-6">ДОКАЗАТЬ  FIT  ФАКТЫ</text>
  </svg>`
)

export function WordField() {
  return (
    <div className={styles.clip} aria-hidden>
      <div
        className={styles.field}
        style={{ backgroundImage: `url("data:image/svg+xml,${WATERMARK}")` }}
      />
    </div>
  )
}
