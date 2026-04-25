<?php
	class _DiceManager{
		// Constructeur de la classe
		public function __construct(){
		}
		
		// Lance des D10
		public function rollD10($numberOfDices, $difficulty){
			$dicesArray = array();
			
			// Set des compteurs
			$nbrOf10 = 0;
			$nbrOfSuccess = 0;
			$nbrOfLastDiceSuccess = 0;
			$nbrOf1 = 0;
			
			$i = 1;
			
			// Jet de des standard (pour les difficultes inferieure a 10)
			if($difficulty < 10){
				while ($i <= $numberOfDices){
					$diceArray = $this->rollD10Standard($difficulty);
					
					switch ($diceArray['success']) {
						case 'CRITICAL':
							$nbrOf10++;
							$nbrOfSuccess++;
							break;
							
						case 'YES':
							$nbrOfSuccess++;
							break;
							
						case 'FAIL':
							$nbrOf10--;
							$nbrOfSuccess--;
							break;
							
						default:
						break;
					}
					
					array_push($dicesArray, $diceArray);
					
					$i++;
				}
			}else{		// Jet speciaux (pour les difficulte de 10 ou plus)
				// Definition de la difficulte K&W
				$nbrOfDicesDifficulty = number_format($difficulty / 5, 0);
				$lastDiceDifficulty = ($difficulty % 5) + 5;
				
				while ($i <= $numberOfDices){
					$diceArray = $this->rollD10Standard(9);
					
					// Recuperation des reussite du dernier de
					if($diceArray['value'] >= $lastDiceDifficulty && $diceArray['success'] == 'NO'){
						$diceArray['success'] = 'LAST_DICE';
					}
					
					switch ($diceArray['success']) {
						case 'CRITICAL':
							$nbrOf10++;
						break;
						
						case 'YES':
							$nbrOfSuccess++;
						break;
						
						case 'LAST_DICE':
							$nbrOfLastDiceSuccess++;
						break;
						
						case 'FAIL':
							$nbrOf1++;
						break;
					}
					
					array_push($dicesArray, $diceArray);
					
					$i++;
				}
				
				// Soustraction des 1 au 10
				if($nbrOf1 > 0){
					// Soustraction des 1 aux 10
					if($nbrOf10 > 0 && $nbrOf1 > 0){
						$temp = $nbrOf10;
						$nbrOf10 = $nbrOf10 - $nbrOf1;
						$nbrOf1 = $nbrOf1 - $temp;
					}
					
					// Soustraction des 1 aux reussites
					if($nbrOfSuccess > 0 && $nbrOf1 > 0){
						$temp = $nbrOfSuccess;
						$nbrOfSuccess = $nbrOfSuccess - $nbrOf1;
						$nbrOf1 = $nbrOf1 - $temp;
					}
					
					if($nbrOf1 < 0){
						$nbrOf1 = 0;
					}
				}
				
				// Comptabilisation des 10 comme reussite et reussite de dernier de
				if($nbrOf10 > 0){
					$i = 1;
					
					while ($i <= $nbrOf10) {
						$nbrOfSuccess++;
						$nbrOfLastDiceSuccess++;
						$i++;
					}
				}
				
				// Comptabilisation des reussites comme reussite de dernier de
				if($nbrOfSuccess > 0){
					$i = 1;
					
					while ($i <= $nbrOfSuccess) {
						$nbrOfLastDiceSuccess++;
						$i++;
					}
				}
				
				// Calcul du nombre de reussites
				if($nbrOfSuccess > 0){
					if($nbrOfLastDiceSuccess > $nbrOfSuccess){
						$nbrOfSuccess = $nbrOfSuccess - ($nbrOfDicesDifficulty - 2);
					}else{
						$nbrOfSuccess = $nbrOfSuccess - ($nbrOfDicesDifficulty - 1);
					}
					
					if($nbrOfSuccess < 0){
						$nbrOfSuccess = 0;
					}
				}else{
					$nbrOfSuccess = $nbrOfSuccess - $nbrOf1;
				}
			}
			
			// Relance des 10
			if($difficulty > 9){
				$difficulty = 9;
			}
			
			$i = 1;
			
			while ($i <= $nbrOf10){
				$diceArray = $this->rollD10Standard($difficulty);
				
				switch ($diceArray['success']) {
					case 'CRITICAL':
						$nbrOfSuccess++;
						$nbrOf10++;
					break;
					
					case 'YES':
						$nbrOfSuccess++;
					break;
					
					default:
					break;
				}
				
				array_push($dicesArray, $diceArray);
				
				$i++;
			}
			
			// Lancement d un D100 en cas d echec critique
			if($nbrOfSuccess < 0){
				$D100 = rand(1, 100);
				$nbrOfSuccess = 'Echec critique (' . $D100 . ')';
			}
			
			$rollInfosArray = array('nbrOfSuccess' => $nbrOfSuccess);
			
			array_unshift($dicesArray, $rollInfosArray);
			
			return $dicesArray;
		}
		
		// Jet de des standard (difficulte inferieure a 10)
		public function rollD10Standard($difficulty){
			// Definition de la valeure du de
			$value = rand(1, 10);
			
			// Definition du succes du de
			if($value >= $difficulty){
				if($value == 10){
					$success = 'CRITICAL';
				}else{
					$success = 'YES';
				}
			}else{
				if($value == 1){
					$success = 'FAIL';
				}else{
					$success = 'NO';
				}
			}
			
			$diceArray = array('value' => $value,
								'success' => $success);
								
			return $diceArray;
		}
		
		// Lance des D20
		public function rollD20($numberOfDices, $difficulty){
			$dicesArray = array();
			
			$i = 1;
			$nbrOfSuccess = 0;
			
			while ($i <= $numberOfDices) {
				// Definition des attributs du de
				$value = rand(1, 20);
				
				if($value >= $difficulty){
					$success = 'YES';
					$nbrOfSuccess++;
				}else{
					$success = 'NO';
				}
				
				$diceArray = array('value' => $value,
									'success' => $success);
									
				array_push($dicesArray, $diceArray);
				
				$i++;
			}
			
			$rollInfosArray = array('nbrOfSuccess' => $nbrOfSuccess);
			
			array_unshift($dicesArray, $rollInfosArray);
			
			return $dicesArray;
		}
	}
?>
