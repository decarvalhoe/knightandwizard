<?php
	class _PrintManager{
		// Constructeur de la classe
		public function __construct(){
		}

		/*
		*	PRIVATES
		*/

		// Formate un texte afin d'assurer l impression des characteres speciaux
		private function formatText($text){
			$text = stripslashes($text);
			$text = iconv('UTF-8', 'windows-1252', $text);

			return $text;
		}

		/*
		*	PUBLICS
		*/

		// Ajoute une nouvelle feuille de personnage en fonction d un personnage donne
		public function addNewCharacterPage($pdf, $Character){
			// Ajout d une page
			$pdf->AddPage();

			// Impression du nom
			$this->printCharacterName($pdf, $Character);
		}

		// Imprime une feuille de personnage en focntion d un personnage donne
		public function printCharacter($Character){
			// Creation de l objet FPDF
			$pdf = new FPDF();

			// Ajout d une page
			$this->addNewCharacterPage($pdf, $Character);

			// Impresion des Informations
			$this->printCharacterInformations($pdf, $Character);

			// Impression des attributs
			$this->printCharacterAttributes($pdf, $Character);

			// Impression des competences
			$this->printCharacterSkills($pdf, $Character);

			// Impression des atouts
			$this->printCharacterAssets($pdf, $Character);

			// Si le personnage possede des sorts...
			if(count($Character->spells) > 0){
				// Impression des sorts
				$this->printCharacterSpells($pdf, $Character);
			}

			// Enregistrement du fichier cote client
			$pdf->Output($Character->name . '.pdf', 'I');
		}

		// Imprime les atouts d un personnage
		public function printCharacterAssets($pdf, $Character){
			// Si le personnage a moins de 10 atouts => impression standard
			if(count($Character->assets) < 10){
				// Definition de la hauteur de l impression
			    $height = CHAR_ASSETS_HEIGHT;
			}else{	// Sinon on ajoute une page pour les atouts
				// Ajout d une page
			    $this->addNewCharacterPage($pdf, $Character);

				// Definition de la hauteur de l impression
				$height = CHAR_ASSETS_NEW_PAGE_HEIGHT;
			}

			// Impression du titre
			$pdf->SetXY(10, $height);
			$pdf->SetFont('Arial','',14);
			$pdf->Cell(60, 5, 'Atouts', 0, 2);

			// Set de la font
			$pdf->SetFont('Arial','',10);

			// Impression de la colonne de gauche d atouts
			$pdf->SetXY(CHAR_2_COL_LEFT, ($height + 6));

			$i = 1;

			foreach ($Character->assets as $asset) {
				if($i == 3){
					// Impression de la colonne de droite d atouts
					$pdf->SetXY(CHAR_2_COL_RIGHT, ($height + 6));
				}

				if($asset['points'] != 0){
					if($asset['unitId'] == 3){ 	// Print des atouts %
						$pdf->Cell(60, 4, $this->formatText($asset['name'] . ' : ' . $asset['points'] . '%'), 0, 2);
					}else{						// Print des atouts points
						$pdf->Cell(60, 4, $this->formatText($asset['name'] . ' : ' . $asset['points']), 0, 2);
					}
				}else{							// Print des atouts absolu
					$pdf->Cell(60, 4, $this->formatText($asset['name']), 0, 2);
				}

				$i++;
			}
		}

		// Imprime les attributs d un personnage
		public function printCharacterAttributes($pdf, $Character){
			// Impression du titre
			$pdf->SetXY(10, CHAR_ATTRIBUTE_HEIGHT);
			$pdf->SetFont('Arial','',14);
			$pdf->Cell(60, 5, 'Attributs', 0, 2);

			// Set de la font
			$pdf->SetFont('Arial','',10);

			// Impression de la colonne de gauche d attributs
			$pdf->SetXY(CHAR_3_COL_LEFT, (CHAR_ATTRIBUTE_HEIGHT + 6));

			$pdf->Cell(60, 4, $this->formatText('Force : ' . $Character->strength), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Dextérité : ' . $Character->dexterity), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Endurance : ' . $Character->stamina), 0, 2);

			// Impression de la colonne du milieu d attributs
			$pdf->SetXY(CHAR_3_COL_CENTER, (CHAR_ATTRIBUTE_HEIGHT + 6));

			$pdf->Cell(60, 4, $this->formatText('Esthétisme : ' . $Character->aestheticism), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Charisme : ' . $Character->charisma), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Empathie : ' . $Character->empathy), 0, 2);

			// Impression de la colonne de droite d attributs
			$pdf->SetXY(CHAR_3_COL_RIGHT, (CHAR_ATTRIBUTE_HEIGHT + 6));

			$pdf->Cell(60, 4, $this->formatText('Intelligence : ' . $Character->intelligence), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Perception : ' . $Character->perception), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Réflexes : ' . $Character->reflexes), 0, 2);
		}

		// Imprime les informations d un personnage
		public function printCharacterInformations($pdf, $Character){
			$pdf->SetFont('Arial','',10);

			// Impression de la colonne de gauche
			$pdf->SetXY(CHAR_2_COL_LEFT, 20);

			$pdf->Cell(60, 4, $this->formatText('Sexe : ' . $Character->gender['name']), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Race : ' . $Character->race['name']), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Orientation : ' . $Character->orientation['name']), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Classe : ' . $Character->class['name']), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Niveau : ' . $Character->level), 0, 2);

			// Impression de la colonne de droite
			$pdf->SetXY(CHAR_2_COL_RIGHT, 20);

			$pdf->Cell(60, 4, $this->formatText('Vitalité : '  . $Character->vitalityMax), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('F. vitesse : ' . $Character->speedFactor), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('F. volonté : ' . $Character->willFactor), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Points : ' . $Character->levelPoints), 0, 2);
			$pdf->Cell(60, 4, $this->formatText('Expérience : '), 0, 2);
		}

		// Imprime le nom d un personnage
		public function printCharacterName($pdf, $Character){
			$pdf->SetXY(10, 10);
			$pdf->SetFont('Arial','',25);

			$pdf->Cell(60, 4, $this->formatText($Character->name), 0, 2);
		}

		// Imprime les competences d un personnage
		public function printCharacterSkills($pdf, $Character){
			// Impression du titre
			$pdf->SetXY(10, CHAR_SKILLS_HEIGHT);
			$pdf->SetFont('Arial','',14);
			$pdf->Cell(60, 5, $this->formatText('Compétences'), 0, 2);

			// Set du curseur d impression pour le contenu
			$pdf->SetXY(CHAR_2_COL_LEFT, (CHAR_SKILLS_HEIGHT + 6));

			$maxSkillsOnFirstPage = 90;
			$maxSkillsOnFullPage = 120;

			// Si le personnage a moins de $maxSkills competences => impression standard
			if(count($Character->skills) < $maxSkillsOnFirstPage){
				// Impression de l Array de skills
				$this->printCharacterSkillsArray($pdf, $Character->skills, TRUE);
			}else{	// Sinon...
				// Definition des atouts qu il reste a imprimer
				$skillsLeftArray = $Character->skills;

				// Definition de l array de skills a imprimer
				$skillsToBePrintedArray = array_slice($skillsLeftArray, 0, $maxSkillsOnFirstPage);

				// Impression de l Array de skills
				$this->printCharacterSkillsArray($pdf, $skillsToBePrintedArray, TRUE);

				// Update des competences restantes a imprimer
				$skillsLeftArray = array_slice($skillsLeftArray, $maxSkillsOnFirstPage);

				do {
					if(count($skillsLeftArray) > 0){
						$this->addNewCharacterPage($pdf, $Character);

						// Impression du titre
						$pdf->SetXY(10, CHAR_SKILLS_NEW_PAGE_HEIGHT);
						$pdf->SetFont('Arial','',14);
						$pdf->Cell(60, 5, $this->formatText('Compétences'), 0, 2);

						// Set du curseur d impression pour le contenu
						$pdf->SetXY(CHAR_2_COL_LEFT, CHAR_SKILLS_NEW_PAGE_HEIGHT + 6);
					}

					// Definition de l array de skills a imprimer
					$skillsToBePrintedArray = array_slice($skillsLeftArray, 0, $maxSkillsOnFullPage);

					// Impression de l Array de skills
					$this->printCharacterSkillsArray($pdf, $skillsToBePrintedArray, FALSE);

					// Update des competences restantes a imprimer
					$skillsLeftArray = array_slice($skillsLeftArray, $maxSkillsOnFullPage);
				} while (count($skillsLeftArray) > 0);
			}
		}

		// Imprime une Array de skills de personnage
		public function printCharacterSkillsArray($pdf, $skillsArray, $firstPage){
		    $totalSkillOnLeftColumn = round(count($skillsArray) / 2, 0, PHP_ROUND_HALF_UP) - 1;

			$i = 0;
			$switchCol = FALSE;

		    foreach ($skillsArray as $skill) {
				// Positionnement du curseur
				if($i > $totalSkillOnLeftColumn && $skill['level'] == 0 && $switchCol == TRUE){
					if($firstPage == TRUE){
						$pdf->SetXY(CHAR_2_COL_RIGHT, (CHAR_SKILLS_HEIGHT + 6));
					}else{
						$pdf->SetXY(CHAR_2_COL_RIGHT, (CHAR_SKILLS_NEW_PAGE_HEIGHT + 6));
					}

					$switchCol = FALSE;
		        }

		        // Seletion de la font de la competence
		        if($skill['isMain'] == 1){
		            // Mise en gras des competences primaires
		            $pdf->SetFont('Arial', 'B', 10);
		        }else{
		            // Ecriture standard pour les competences standard
		            $pdf->SetFont('Arial', '', 10);
		        }

		        if($skill['level'] == 0){
		            $pdf->Cell(60, 4, $this->formatText($skill['name'] . ' : ' . $skill['points']), 0, 2);
		        }else{
		            // Definition de l espacement en fonction de la couche de specialisation
		            $k = 0;

		            $space = '';

		            do {
		                $space = $space . '    ';

		                $k++;
		            } while ($k < $skill['level']);

		            $pdf->Cell(60, 4, $this->formatText($space . $skill['name'] . ' : ' . $skill['points']), 0, 2);
		        }

				if($i == $totalSkillOnLeftColumn){
					$switchCol = TRUE;
		        }

		        $i++;
		    }
		}

		// Imprime les sorts d un personnage
		public function printCharacterSpells($pdf, $Character){
			// Ajout d une page
			$this->addNewCharacterPage($pdf, $Character);

			// Definition des position X des elements du tableau
			$xType = 90;
			$xEnergy = ($xType + 13);
			$xCastingTime = ($xEnergy + 12);
			$xDifficulty = ($xCastingTime + 12);
			$xEffect = ($xDifficulty + 10);

			// Impression du titre
			$pdf->SetXY(10, CHAR_SPELLS_HEIGHT);
			$pdf->SetFont('Arial', '', 14);
			$pdf->Cell(60, 5, $this->formatText('Sorts'), 0, 2);

			// Impression des intitules
			$pdf->SetFont('Arial', 'B', 10);
			$pdf->SetXY(10, (CHAR_SPELLS_HEIGHT + 1));

			$pdf->SetX($xType - 2);
			$pdf->Cell(60, 4, $this->formatText('Type'), 0, 0);

			$pdf->SetX($xEnergy - 2);
			$pdf->Cell(60, 4, $this->formatText('Ener.'), 0, 0);

			$pdf->SetX($xCastingTime);
			$pdf->Cell(60, 4, $this->formatText('TI'), 0, 0);

			$pdf->SetX($xDifficulty - 2);
			$pdf->Cell(60, 4, $this->formatText('Diff.'), 0, 0);

			$pdf->SetX($xEffect);
			$pdf->Cell(60, 4, $this->formatText('Effet'), 0, 0);

			// Impression des sorts
			$pdf->SetFont('Arial','',10);
			$pdf->SetY(CHAR_SPELLS_HEIGHT + 7);

			foreach ($Character->spells as $spell) {
				$pdf->SetX(CHAR_2_COL_LEFT);

				// Nom : points
				$pdf->Cell(60, 4, $this->formatText($spell['name'] . ' : ' . $spell['points']), 0, 0);

				// Type
				switch ($spell['typeId']) {
					case '1':
						$type = 'Abj.';
						break;

					case '2':
						$type = 'Alt.';
						break;

					case '3':
						$type = 'Bla.';
						break;

					case '4':
						$type = 'Div.';
						break;

					case '5':
						$type = 'Elé.';
						break;

					case '6':
						$type = 'Enc.';
						break;

					case '7':
						$type = 'Ill.';
						break;

					case '8':
						$type = 'Inv.';
						break;

					case '9':
						$type = 'Nat.';
						break;

					case '10':
						$type = 'Néc.';
						break;

					case '11':
						$type = 'Noi.';
						break;
				}

				$pdf->SetX($xType);
				$pdf->Cell(60, 4, $this->formatText($type), 0, 0);

				// Energie
				$pdf->SetX($xEnergy);
				$pdf->Cell(60, 4, $this->formatText($spell['energy']), 0, 0);

				// TI
				$pdf->SetX($xCastingTime);
				$pdf->Cell(60, 4, $this->formatText($spell['castingTime']), 0, 0);

				// Difficulte
				$pdf->SetX($xDifficulty);
				$pdf->Cell(60, 4, $this->formatText($spell['difficulty']), 0, 0);

				// Effet
				$pdf->SetX($xEffect);
				$pdf->Cell(60, 4, $this->formatText($spell['effect']), 0, 2);
			}
		}
	}
?>
