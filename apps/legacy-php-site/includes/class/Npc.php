<?php
	class Npc extends Character {
        //Constructeur de la classe
        public function __construct($name, $class, $race, $mainSkill) {			
			$this->setGender($class['name'], $race['name']);
			$this->name = $name;
			$this->race = $race['name'];
			$this->raceId = $race['id'];
			$this->class = $class['name'];
			$this->setAge($class['name'], $race['name']);
			$this->category = $race['category'];
			
			$this->setVitality($race['vitality']);
			$this->setSpeedFactor($race['speedFactor']);
            $this->setWillFactor($race['willFactor']);
			
			$this->setStrength($race['strengthMax']);
			$this->setDexterity($race['dexterityMax']);
			$this->setStamina($race['staminaMax']);
			
			$this->setAestheticism($race['aestheticismMax']);
			$this->setReflexes($race['reflexesMax']);
			$this->setPerception($race['perceptionMax']);
			
			$this->setCharisma($race['charismaMax']);
			$this->setIntelligence($race['intelligenceMax']);
			$this->setEmpathy($race['empathyMax']);
			
			$this->setMainSkillId($mainSkill);
			$this->setSkills($mainSkill);
        }
		
		// Setters
		private function setGender($class, $race){
			$classAndRace = $class . ' ' . $race;
			
			switch ($classAndRace) {
				case 'Garde Humain':
					$rand = rand(1, 10);
					
					if($rand != 1){
						$this->gender = 'male';
					}else{
						$this->gender = 'female';
					}
				break;
				
				case 'Fantassin Humain':
					$rand = rand(1, 10);
					
					if($rand != 1){
						$this->gender = 'male';
					}else{
						$this->gender = 'female';
					}
				break;	
				
				default:
					$this->gender = 'male';
				break;
			}
		}
		
		private function setAge($class, $race){
			$classAndRace = $class . ' ' . $race;
			
			switch ($classAndRace) {
				case 'Garde Humain':
					$mean = 25;
					$disparity = 5;
				break;
				
				case 'Fantassin Humain':
					$mean = 25;
					$disparity = 5;
				break;
				
				default:
					$this->age = 0;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->vitality = round($points);
		}
		
		private function setVitality($racevitality){
			$mean = $racevitality;
			
			switch ($this->class) {
				case 'Garde':
					$rand = rand(1, 100);
					
					if($rand >= 85){
						$mean = $mean + 1;
						
						if($rand >= 95){
							$mean = $mean + 1;
						}
					}
					
					$disparity = $racevitality / 10;
				break;
				
				case 'Fantassin':
					$rand = rand(1, 100);
					
					if($rand >= 70){
						$mean = $mean + 1;
						
						if($rand >= 85){
							$mean = $mean + 1;
							
							if($rand >= 95){
								$mean = $mean + 1;
							}
						}
					}
					
					$disparity = $racevitality / 10;
				break;
				
				default:
					$disparity = 1;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			
			$this->vitality = round($points);
			$this->vitalityMax = round($points);
		}
		
		private function setSpeedFactor($raceSpeedFactor){
			$mean = $raceSpeedFactor;
			$disparity = 0.3;
			
			switch ($this->class) {				
				case 'Fantassin':
					$rand = rand(1, 100);
					
					if($rand >= 90){
						$mean = $mean - 1;
						
						if($rand >= 100){
							$mean = $mean - 1;
						}
					}
				break;
				
				default:
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			
			$this->speedFactor = round($points);
		}
		
		private function setWillFactor($raceWillFactor){
			$mean = $raceWillFactor;
			$disparity = 1;
			
			switch ($this->class) {				
				case 'Fantassin':
					$rand = rand(1, 100);
					
					if($rand >= 85){
						$mean = $mean - 1;
						
						if($rand >= 95){
							$mean = $mean - 1;
						}
					}
				break;
				
				default:
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			
			$this->willFactor = round($points);
		}
		
		private function setStrength($strengthMax){
			switch ($this->class) {
				case 'Garde':
					$mean = $strengthMax / 1.5;
					$disparity = 0.7;
				break;
				
				case 'Fantassin':
					$mean = $strengthMax / 1.4;
					$disparity = 0.7;
				break;
				
				default:
					$mean = $strengthMax / 2;
					$disparity = 0.7;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->strength = round($points);
			
			if($this->strength < 1){
				$this->strength = 1;
			}
		}
		
		private function setDexterity($dexterityMax){
			switch ($this->class) {
				case 'Garde':
					$mean = $dexterityMax / 1.5;
					$disparity = 0.7;
				break;
				
				case 'Fantassin':
					$mean = $dexterityMax / 1.4;
					$disparity = 0.7;
				break;
				
				default:
					$mean = $dexterityMax / 2;
					$disparity = 0.7;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->dexterity = round($points);
		}
		
		private function setStamina($staminaMax){
			switch ($this->class) {
				case 'Garde':
					$mean = $staminaMax / 1.5;
					$disparity = 0.7;
				break;
				
				case 'Fantassin':
					$mean = $staminaMax / 1.5;
					$disparity = 0.7;
				break;
				
				default:
					$mean = $staminaMax / 2;
					$disparity = 0.7;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->stamina = round($points);
			
			if($this->stamina < 1){
				$this->stamina = 1;
			}
		}
		
		private function setAestheticism($aestheticisMax){
			switch ($this->class) {
				default:
					$mean = $aestheticisMax / 2;
					$disparity = 0.7;
					
					break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->aestheticism = round($points);
		}
		
		private function setReflexes($reflexesMax){
			switch ($this->class) {
				case 'Garde':
					$mean = $reflexesMax / 1.5;
					$disparity = 0.7;
				break;
				
				case 'Fantassin':
					$mean = $reflexesMax / 1.4;
					$disparity = 0.7;
				break;
				
				default:
					$mean = $reflexesMax / 2;
					$disparity = 0.7;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->reflexes = round($points);
		}
		
		private function setPerception($perceptionMax){
			switch ($this->class) {
				case 'Garde':
					$mean = $perceptionMax / 1.5;
					$disparity = 0.7;
				break;
				
				case 'Fantassin':
					$mean = $perceptionMax / 1.6;
					$disparity = 0.7;
				break;
				
				default:
					$mean = $perceptionMax / 2;
					$disparity = 0.7;
				break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			
			$this->perception = round($points);
		}
		
		private function setCharisma($charismaMax){
			switch ($this->class) {
				default:
					$mean = $charismaMax / 2;
					$disparity = 0.7;
					
					break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->charisma = round($points);
		}
		
		private function setIntelligence($intelligenceMax){
			switch ($this->class) {
				default:
					$mean = $intelligenceMax / 2;
					$disparity = 0.7;
					
					break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->intelligence = round($points);
		}
		
		private function setEmpathy($empathyMax){
			switch ($this->class) {
				default:
					$mean = $empathyMax / 2;
					$disparity = 0.7;
					
					break;
			}
			
			$points = $this->randGauss($mean, $disparity);
			$this->empathy = round($points);
		}
		
		private function setSkills($mainSkill){
			$points = $this->randGauss(4, 0.8);
			$points = round($points);
			
			$skillArray = $mainSkill;
			$skillArray['points'] = $points;
			
			$this->skills = array($skillArray);
		}
		
		private function setMainSkillId($mainSkill){
			$this->mainSkillId = $mainSkill['id'];
		}
    }
?>