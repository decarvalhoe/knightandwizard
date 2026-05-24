import { describe, expect, it } from 'vitest';

import {
  DiceCluster,
  Dialog,
  Field,
  ProgressBar,
  SelectField,
  Table,
  Tabs,
  TimelineDT,
  Toast
} from '../index';

describe('surface component exports', () => {
  it('exports all F3 surface primitives as functions', () => {
    expect(Field).toBeTypeOf('function');
    expect(SelectField).toBeTypeOf('function');
    expect(Tabs).toBeTypeOf('function');
    expect(Dialog).toBeTypeOf('function');
    expect(Table).toBeTypeOf('function');
    expect(Toast).toBeTypeOf('function');
    expect(ProgressBar).toBeTypeOf('function');
    expect(TimelineDT).toBeTypeOf('function');
    expect(DiceCluster).toBeTypeOf('function');
  });
});
