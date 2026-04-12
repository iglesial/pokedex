import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Hero,
  Input,
  Modal,
  ProgressBar,
  Select,
  Spinner,
  Textarea,
} from '../components'
import './PreviewPage.css'

export function PreviewPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main className="preview-page">
      <header className="preview-header">
        <h1>Component Preview</h1>
      </header>

      <section aria-labelledby="preview-feedback" className="preview-section">
        <h2 id="preview-feedback">Feedback &amp; Status</h2>
        <div className="preview-grid">
          <Alert severity="info" title="Info">
            Informational message.
          </Alert>
          <Alert severity="success" title="Success">
            Operation succeeded.
          </Alert>
          <Alert severity="warning" title="Warning">
            Something needs attention.
          </Alert>
          <Alert severity="error" title="Error">
            Something went wrong.
          </Alert>
          <div className="preview-item-row">
            <Badge>Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
          <div className="preview-item-row">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="preview-item-stack">
            <ProgressBar value={0} label="Empty" />
            <ProgressBar value={50} label="Half" />
            <ProgressBar value={100} label="Full" />
          </div>
        </div>
      </section>

      <section aria-labelledby="preview-forms" className="preview-section">
        <h2 id="preview-forms">Form Inputs</h2>
        <div className="preview-grid">
          <FormField label="Name" help="Trainer name">
            {(ids) => <Input {...ids} placeholder="Ash Ketchum" />}
          </FormField>
          <FormField label="Starter" help="Pick one">
            {(ids) => (
              <Select {...ids} defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                <option value="bulbasaur">Bulbasaur</option>
                <option value="charmander">Charmander</option>
                <option value="squirtle">Squirtle</option>
              </Select>
            )}
          </FormField>
          <FormField label="Notes">
            {(ids) => <Textarea {...ids} rows={3} />}
          </FormField>
          <FormField label="Email" error="Please enter a valid email">
            {(ids) => (
              <Input {...ids} type="email" defaultValue="not-an-email" />
            )}
          </FormField>
          <div className="preview-item-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="preview-item-row">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="preview-layout" className="preview-section">
        <h2 id="preview-layout">Layout &amp; Overlays</h2>
        <div className="preview-grid">
          <Card
            heading={<h3>Bulbasaur</h3>}
            footer={<Button variant="ghost">Details</Button>}
          >
            <p>Grass / Poison type starter Pokémon from Kanto.</p>
          </Card>
          <Card>
            <p>A simple card with no heading or footer.</p>
          </Card>
          <div style={{ gridColumn: '1 / -1' }}>
            <Hero
              heading={<h2>Pokédex</h2>}
              subheading="Catch them all."
              action={<Button variant="secondary">Get started</Button>}
            />
          </div>
          <div>
            <Button
              onClick={() => {
                setModalOpen(true)
              }}
            >
              Open modal
            </Button>
            <Modal
              open={modalOpen}
              onClose={() => {
                setModalOpen(false)
              }}
              heading={<h3>Example Modal</h3>}
            >
              <p>
                Focus is trapped here. Press Escape or click the close button.
              </p>
              <Button
                onClick={() => {
                  setModalOpen(false)
                }}
              >
                Close
              </Button>
            </Modal>
          </div>
        </div>
      </section>
    </main>
  )
}
