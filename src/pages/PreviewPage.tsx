import './PreviewPage.css'

export function PreviewPage() {
  return (
    <main className="preview-page">
      <header className="preview-header">
        <h1>Component Preview</h1>
      </header>
      <section className="preview-content">
        <p className="preview-empty">
          No components have been added yet. Export components from{' '}
          <code>src/components/index.ts</code> to see them here.
        </p>
      </section>
    </main>
  )
}
