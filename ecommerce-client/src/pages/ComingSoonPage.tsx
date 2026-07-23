interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <section className="page">
      <div className="empty-state">
        <p className="eyebrow">Coming soon</p>
        <h1>{title}</h1>
        <p className="muted">This area will be implemented in a future update.</p>
      </div>
    </section>
  )
}
