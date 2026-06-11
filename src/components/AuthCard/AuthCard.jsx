import './AuthCard.css'

export default function AuthCard({ children, subtitle = 'Secure access to satellite telemetry infrastructure' }) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-card__signal" aria-hidden="true" />
      <div className="auth-card__header">
        <div className="auth-card__logo" aria-label="SCORPIO logo placeholder">
          <span className="auth-card__logo-orbit" />
          <span className="auth-card__logo-core">S</span>
        </div>
        <div>
          <p className="auth-card__eyebrow">Mission Control Access</p>
          <h1 id="auth-title">SCORPIO Ground Station Network</h1>
          <p className="auth-card__subtitle">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
