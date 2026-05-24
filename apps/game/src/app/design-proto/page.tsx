'use client';

import { useState } from 'react';

import { Badge, Button, Card, Die, Label } from '@knightandwizard/ui';

// Proto « design lab » : un Tracker DT composé avec les VRAIS composants
// (@knightandwizard/ui), branchés tokens. Le sélecteur de skin + la bascule
// Jour/Veillée prouvent le moteur ré-skinnable en live.

const SKINS = [
  { id: 'registre', label: 'Registre (combat)' },
  { id: 'grimoire', label: 'Grimoire (sorts)' },
  { id: 'tripot', label: 'Tripot (dés)' },
  { id: 'archives', label: 'Archives (règles)' },
  { id: 'bibliotheque', label: 'Bibliothèque (CMS)' },
  { id: 'gazette', label: 'Gazette (session)' },
  { id: 'armorial', label: 'Armorial (fiche)' },
  { id: 'moderne', label: '— Moderne (autre univers) —' }
];

type Actor = { nom: string; vitesse: number; dt: number; action: string; camp: 'allie' | 'ennemi' };

const ACTORS: Actor[] = [
  { nom: 'Aveline', vitesse: 6, dt: 142, action: 'décoche', camp: 'allie' },
  { nom: 'Brigand', vitesse: 9, dt: 145, action: 'charge', camp: 'ennemi' },
  { nom: 'Maître Orven', vitesse: 12, dt: 148, action: 'incante', camp: 'allie' },
  { nom: 'Squelette', vitesse: 7, dt: 151, action: 'frappe', camp: 'ennemi' }
];

const DT_START = 140;
const DT_END = 154;
const NOW = 142;

export default function DesignProtoPage() {
  const [skin, setSkin] = useState('registre');
  const [night, setNight] = useState(false);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Design Lab — Tracker DT</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Composé avec les vrais composants <code>@knightandwizard/ui</code> (Card, Button, Die,
        Badge, Label). Change le skin / le mode : seuls couleurs, polices et ornements bougent —
        composants et ossature restent identiques.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
        <label>
          Skin&nbsp;
          <select value={skin} onChange={(e) => setSkin(e.target.value)}>
            {SKINS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setNight((n) => !n)}>
          Mode : {night ? 'Veillée (nuit)' : 'Jour'}
        </button>
      </div>

      {/* Surface skinnée : data-skin + data-theme pilotent toutes les variables */}
      <div
        data-skin={skin}
        data-theme={night ? 'night' : undefined}
        style={{
          background: 'var(--color-bg-canvas)',
          color: 'var(--color-text-ink)',
          fontFamily: 'var(--font-body)',
          padding: 24,
          border: 'var(--border-strong) solid var(--color-border-rule)',
          display: 'grid',
          gap: 16
        }}
      >
        <div>
          <Label>Carnet de campagne · le commandant consigne</Label>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0' }}>
            Round courant · DT {NOW}
          </h2>
        </div>

        <Card>
          <Label>Timeline · Divisions de Temps (0,2 s)</Label>
          {ACTORS.map((a) => {
            const left = ((a.dt - DT_START) / (DT_END - DT_START)) * 100;
            const width = (a.vitesse / (DT_END - DT_START)) * 100;
            const enemy = a.camp === 'ennemi';
            return (
              <div key={a.nom} style={{ margin: '10px 0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13
                  }}
                >
                  <strong>{a.nom}</strong>
                  <span
                    style={{
                      display: 'inline-flex',
                      gap: 8,
                      alignItems: 'center',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    DT {a.dt} · F.Vit {a.vitesse} · {a.action}
                    <Badge tone={enemy ? 'danger' : 'success'}>{enemy ? 'ennemi' : 'allié'}</Badge>
                  </span>
                </div>
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: 14,
                    background: 'var(--color-bg-elevated)',
                    border: 'var(--border-hairline) solid var(--color-border-hairline)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${Math.max(width, 4)}%`,
                      top: 0,
                      bottom: 0,
                      background: enemy ? 'var(--color-accent-2)' : 'var(--color-accent)'
                    }}
                  />
                </div>
              </div>
            );
          })}
          <Label>↳ « maintenant » = DT {NOW}</Label>
        </Card>

        <Card>
          <Label>Jet de pool D10 — Aveline décoche</Label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
            <Die value={10} kind="success" />
            <span style={{ fontFamily: 'var(--font-display)' }}>↪</span>
            <Die value={8} kind="success" />
            <Die value={9} kind="critical" />
            <Die value={1} kind="one" />
            <span style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 28 }}>
              2 réussites
            </span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            « La flèche file droit… trouve la gorge. » Le moteur arbitre ; le destin tire au cent.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="primary">Résoudre</Button>
            <Button variant="secondary">Annuler l’ordre</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
