import { describe, expect, it } from 'vitest';

import type { EffectModel } from './effect-model.js';
import { describeFidelity, renderEffect } from './effect-renderer.js';

function effectModel(spec: EffectModel['spec'], prose = 'Prose canonique.'): EffectModel {
  return {
    source: {
      prose,
      ref: 'fixture:effect-renderer'
    },
    spec,
    fidelity: 'covered'
  };
}

describe('renderEffect', () => {
  it('renders pool additions from a variable value with all_of conditions', () => {
    const model = effectModel({
      target: 'pool',
      scope: 'abordage',
      op: 'add',
      value: 'level',
      condition: {
        all_of: [{ context: 'combat' }, { env: 'naval' }]
      },
      activation: 'passive',
      duration: 'permanent'
    });

    expect(renderEffect(model)).toBe('Ajoute niveau au pool de dés en combat naval');
  });

  it('renders difficulty reductions with any_of target conditions', () => {
    const model = effectModel({
      target: 'difficulty',
      op: 'sub',
      value: 5,
      condition: {
        any_of: [{ target_tag: 'undead' }, { target_tag: 'demon' }]
      },
      activation: 'active',
      duration: 'ephemeral'
    });

    expect(renderEffect(model)).toBe(
      'Réduit la difficulté de 5 contre les morts-vivants ou contre les démons'
    );
  });

  it('renders aptitude and status templates with scoped labels', () => {
    const aptitude = effectModel({
      target: 'aptitude',
      scope: 'force',
      op: 'add',
      value: 2,
      condition: { action_type: 'attaque' },
      activation: 'triggered',
      duration: { dt: 10 }
    });
    const status = effectModel({
      target: 'status',
      scope: 'effrayé',
      op: 'grant',
      value: 1,
      activation: 'triggered',
      duration: 'ephemeral'
    });

    expect(renderEffect(aptitude)).toBe('+2 en Force lors d’une attaque');
    expect(renderEffect(status)).toBe("Inflige l'état effrayé");
  });

  it('renders vitality, energy and factor numeric templates', () => {
    const vitality = effectModel({
      target: 'vitality',
      op: 'add',
      value: { table: 'soins_par_niveau', key: 'level' },
      activation: 'active',
      duration: 'ephemeral'
    });
    const energy = effectModel({
      target: 'energy',
      op: 'add',
      value: 'level * 2',
      activation: 'active',
      duration: 'ephemeral'
    });
    const factor = effectModel({
      target: 'factor',
      scope: 'volonté',
      op: 'sub',
      value: 1,
      activation: 'active',
      duration: { dt: 5 }
    });

    expect(renderEffect(vitality)).toBe(
      'Restaure la valeur de la table soins_par_niveau selon niveau points de vitalité'
    );
    expect(renderEffect(energy)).toBe("Restaure niveau x 2 points d'énergie");
    expect(renderEffect(factor)).toBe('Réduit le facteur volonté de 1');
  });

  it('uses a readable generic fallback for uncovered target-operation pairs', () => {
    const model = effectModel({
      target: 'status',
      scope: 'confusion',
      op: 'multiply',
      value: 2,
      activation: 'active',
      duration: 'ephemeral'
    });

    expect(renderEffect(model)).toBe('Applique multiply 2 sur état (confusion)');
  });
});

describe('describeFidelity', () => {
  it('exposes source prose next to the current generated render without semantic claims', () => {
    const model: EffectModel = {
      ...effectModel(
        {
          target: 'pool',
          op: 'add',
          value: 1,
          activation: 'passive',
          duration: 'permanent'
        },
        'Le personnage gagne un dé.'
      ),
      render: 'ancien rendu',
      fidelity: 'ambiguous'
    };

    expect(describeFidelity(model)).toEqual({
      prose: 'Le personnage gagne un dé.',
      render: 'Ajoute 1 au pool de dés',
      fidelity: 'ambiguous'
    });
  });
});
