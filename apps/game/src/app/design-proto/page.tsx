'use client';

import { useState, type CSSProperties } from 'react';

// Proto « design lab » : un Tracker DT rendu via les tokens du design system
// (packages/tokens). Sélecteur de skin (7) + bascule Jour/Veillée prouvent le
// moteur ré-skinnable en live. Tout est stylé via les variables CSS --color-*,
// --shadow-*, --font-*, --border-* posées par [data-skin] / [data-theme].

const SKINS: { id: string; label: string }[] = [
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

const card: CSSProperties = {
  background: 'var(--color-bg-surface)',
  color: 'var(--color-text-ink)',
  border: 'var(--border-hairline) solid var(--color-border-rule)',
  borderRadius: 'var(--radius-rect)',
  boxShadow: 'var(--shadow-card) color-mix(in oklab, var(--color-text-ink) 18%, transparent)',
  padding: '20px'
};

const eyebrow: CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: 'var(--text-label-sm)',
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)'
};

function Die({ kind, value }: { kind: 's' | 't' | 'o'; value: number }) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    border: 'var(--border-hairline) solid var(--color-text-ink)',
    fontFamily: 'var(--font-display)',
    fontSize: 18
  };
  if (kind === 's')
    return (
      <span
        style={{ ...base, background: 'var(--color-text-ink)', color: 'var(--color-bg-canvas)' }}
      >
        {value}
      </span>
    );
  if (kind === 't')
    return (
      <span style={{ ...base, background: 'var(--color-accent)', color: 'var(--color-bg-canvas)' }}>
        {value}
      </span>
    );
  return (
    <span style={{ ...base, color: 'var(--color-fb-danger)', fontStyle: 'italic' }}>{value}</span>
  );
}

export default function DesignProtoPage() {
  const [skin, setSkin] = useState('registre');
  const [night, setNight] = useState(false);

  return (
    <div style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Design Lab — Tracker DT</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Le même composant, rendu via les tokens du design system. Change le skin / le mode : seuls
        couleurs, polices et ornements bougent — l’ossature reste identique.
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
          border: 'var(--border-strong) solid var(--color-border-rule)'
        }}
      >
        <div style={eyebrow}>Carnet de campagne · le commandant consigne</div>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0 16px' }}>
          Round courant · DT {NOW}
        </h2>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={eyebrow}>Timeline · Divisions de Temps (0,2 s)</div>
          {ACTORS.map((a) => {
            const left = ((a.dt - DT_START) / (DT_END - DT_START)) * 100;
            const width = (a.vitesse / (DT_END - DT_START)) * 100;
            const isEnemy = a.camp === 'ennemi';
            return (
              <div key={a.nom} style={{ margin: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <strong>{a.nom}</strong>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    DT {a.dt} · F.Vit {a.vitesse} · {a.action}
                  </span>
                </div>
                <div
                  style={{
                    position: 'relative',
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
                      background: isEnemy ? 'var(--color-accent-2)' : 'var(--color-accent)'
                    }}
                  />
                </div>
              </div>
            );
          })}
          <div style={{ ...eyebrow, marginTop: 8 }}>↳ « maintenant » = DT {NOW}</div>
        </div>

        <div style={card}>
          <div style={eyebrow}>Jet de pool D10 — Aveline décoche</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
            <Die kind="s" value={10} />
            <span style={{ fontFamily: 'var(--font-display)' }}>↪</span>
            <Die kind="s" value={8} />
            <Die kind="t" value={9} />
            <Die kind="o" value={1} />
            <span style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 28 }}>
              2 réussites
            </span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            « La flèche file droit… trouve la gorge. » Le moteur arbitre ; le destin tire au cent.
          </div>
        </div>
      </div>
    </div>
  );
}
