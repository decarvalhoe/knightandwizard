import { UserPlus } from 'lucide-react';
import Link from 'next/link';

import { Card, Label } from '@knightandwizard/ui';

import { CharacterSheet } from '@/features/character-sheet/CharacterSheet';
import { getCharacterSheetReadModel } from '@/features/character-sheet/read-models';

export const dynamic = 'force-dynamic';

export default async function CharacterPage() {
  const sheet = await getCharacterSheetReadModel();

  return (
    <div className="kw-character-page">
      <Card className="kw-character-page__header">
        <div>
          <Label>Personnage</Label>
          <h1>Fiche active</h1>
        </div>
        <Link
          className="kw-btn kw-btn--secondary kw-character-page__create-link"
          href="/character/create"
        >
          <UserPlus aria-hidden="true" className="kw-character-page__icon" />
          Créer
        </Link>
      </Card>

      <CharacterSheet
        attributeLabels={sheet.attributeLabels}
        attributeOrder={sheet.attributeOrder}
        character={sheet.character}
        equipmentCatalog={sheet.equipmentCatalog}
        initialInventory={sheet.initialInventory}
        skillCatalog={sheet.skillCatalog}
        skillLabels={sheet.skillLabels}
        spells={sheet.spells}
      />
    </div>
  );
}
