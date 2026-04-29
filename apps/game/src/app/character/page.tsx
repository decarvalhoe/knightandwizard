import { CharacterSheet } from '@/features/character-sheet/CharacterSheet';
import { sampleCharacter, sampleInventory, sampleSpells } from '@/features/character-sheet/sample';

export default function CharacterPage() {
  return (
    <CharacterSheet
      character={sampleCharacter}
      initialInventory={sampleInventory}
      spells={sampleSpells}
    />
  );
}
