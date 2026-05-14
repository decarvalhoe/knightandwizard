import { CharacterCreationWizard } from '@/features/character-creation/CharacterCreationWizard';
import { getCharacterCreationReadModel } from '@/features/character-creation/read-models';

export const dynamic = 'force-dynamic';

export default async function CharacterCreatePage() {
  const readModel = await getCharacterCreationReadModel();

  return (
    <CharacterCreationWizard
      attributeLabels={readModel.attributeLabels}
      catalog={readModel.catalog}
    />
  );
}
