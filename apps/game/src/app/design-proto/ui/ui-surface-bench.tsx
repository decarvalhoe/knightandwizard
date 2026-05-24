'use client';

import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  DiceCluster,
  Dialog,
  Field,
  Label,
  ProgressBar,
  SelectField,
  Table,
  Tabs,
  TimelineDT,
  Toast
} from '@knightandwizard/ui';

const rows = [
  { actor: 'Aveline', dt: 6, state: 'Prete' },
  { actor: 'Brigand', dt: 8, state: 'Saignement' },
  { actor: 'Mire', dt: 12, state: 'Incantation' }
] as const;

export function UiSurfaceBench() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ordre');

  return (
    <div className="kw-surface-page">
      <Card>
        <Label>UI</Label>
        <h1>Composants de surface</h1>
        <Badge tone="info">Skin moderne</Badge>
      </Card>

      <section className="kw-surface-grid" aria-label="Composants de formulaire et feedback">
        <Card className="kw-ui-demo-stack">
          <Field defaultValue="Aveline" hint="Nom consigne" label="Champ texte" />
          <SelectField
            defaultValue="registre"
            label="Select"
            options={[
              { label: 'Registre', value: 'registre' },
              { label: 'Armorial', value: 'armorial' },
              { label: 'Grimoire', value: 'grimoire' }
            ]}
          />
        </Card>

        <Card className="kw-ui-demo-stack">
          <ProgressBar label="Vitalite" max={24} tone="success" value={16} />
          <ProgressBar label="Fatigue" max={10} tone="warn" value={7} />
        </Card>

        <Card className="kw-ui-demo-stack">
          <DiceCluster
            dice={[
              { value: 10, kind: 'success' },
              { value: 7, kind: 'critical' },
              { value: 1, kind: 'one' }
            ]}
            label="Jet de reference"
          />
          <Toast title="Jet consigne" tone="success">
            2 succes, une remarque du destin.
          </Toast>
          <Button onClick={() => setDialogOpen(true)} variant="secondary">
            Ouvrir modal
          </Button>
        </Card>
      </section>

      <Tabs
        activeId={activeTab}
        items={[
          {
            id: 'ordre',
            label: 'Ordre',
            panel: (
              <TimelineDT
                items={rows.map((row) => ({
                  id: row.actor,
                  current: row.actor === 'Aveline',
                  description: row.state,
                  dt: row.dt,
                  label: row.actor
                }))}
              />
            )
          },
          {
            id: 'table',
            label: 'Table',
            panel: (
              <Table
                caption="Ordre de bataille"
                columns={[
                  { id: 'actor', header: 'Acteur', cell: (row) => row.actor },
                  { id: 'dt', header: 'DT', align: 'right', cell: (row) => row.dt },
                  { id: 'state', header: 'Etat', cell: (row) => row.state }
                ]}
                getRowKey={(row) => row.actor}
                rows={rows}
              />
            )
          }
        ]}
        label="Banc UI"
        onTabChange={setActiveTab}
      />

      <Card className="kw-ui-demo-stack">
        <Label>Modal</Label>
        <p className="kw-ui-demo-copy">
          La modale reste declenchee par action pour garder le banc lisible.
        </p>
        <Button onClick={() => setDialogOpen(true)}>Ouvrir minute</Button>
      </Card>

      <Dialog
        description="Fenetre modale sans portail pour le banc UI."
        id="ui-bench-dialog"
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="Minute du greffe"
      >
        <Toast title="Audience ouverte" tone="info">
          Le greffier consigne, le moteur tranche.
        </Toast>
      </Dialog>
    </div>
  );
}
