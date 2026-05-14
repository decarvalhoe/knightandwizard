import { CharacterSheet } from '@/features/character-sheet/CharacterSheet';
import { getCharacterSheetReadModel } from '@/features/character-sheet/read-models';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CharacterPage() {
  const sheet = await getCharacterSheetReadModel();

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white/78 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">Personnage</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Fiche active</h1>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/88"
          href="/character/create"
        >
          <UserPlus aria-hidden="true" className="size-4" />
          Créer
        </Link>
      </section>

      <CharacterSheet
        attributeLabels={sheet.attributeLabels}
        attributeOrder={sheet.attributeOrder}
        character={sheet.character}
        initialInventory={sheet.initialInventory}
        skillCatalog={sheet.skillCatalog}
        skillLabels={sheet.skillLabels}
        spells={sheet.spells}
      />
    </div>
  );
}
