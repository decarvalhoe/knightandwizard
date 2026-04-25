<?php
	class RulesMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renoi l ensemble des regles contenues dans une Array
		public function getAllRules(){
			$allRulesArray = array();

			$ruleArray = array('title' => 'Description des Feuilles de Personnages',
								'content' => FALSE,
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Races',
								'content' => 'Il existe diverses races, toutes jouables par les joueurs. Pour connaître les races actuellement disponibles, référez-vous au "Bestiaire". Ce document nous donne la catégorie, les atouts et handicaps de chaque race ainsi qu’une description.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Catégories',
								'content' => 'La catégorie, est proportionnellement liée au passage des niveaux. Autrement dit, plus une catégorie est basse (et donc la créature est petite), plus vous évoluerez rapidement dans les niveaux. Par contre, plus une catégorie est élevée, plus la créature sera puissante à la base et évoluera lentement dans ses niveaux.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Atouts et Handicaps de Race',
								'content' => 'Les atouts et handicaps de races (que vous trouverez de dans le "Bestiaire") sont octroyés à tous les personnages sans exception (du joueur, au non-joueur le plus insignifiant).
Sachez encore que l\'on ne peut se débarrasser des handicaps de race.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Capacités et Facteurs',
								'content' => 'Pourquoi dans ce fichu jeu existe-t-il des facteurs et des "non-facteurs"? C\'est tout simplement car dans ces deux zones, des points seront attribués aux personnages, mais que si l\'important est toujours d\'avoir le plus de points possible (il n\'existe aucune limite), les facteurs eux au contraire devraient être minimes pour bien faire et atteindre leur limite à 1.
De toute manière, les deux seuls facteurs dont vous aurez à vous rappeler sont : le facteur de volonté et de vitesse. Hormis ces deux exceptions qui doivent être minimales, tout le reste doit être maximal.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Facteur de volonté',
								'content' => 'Un facteur! Donc tout de suite, on sait qu\'il doit être le plus petit possible.
La volonté est considérée sur une échelle de 1 à 20. Donc, plus un personnage s\'approche de 1 dans son facteur de volonté, plus il sera maître de lui-même.
Le facteur de volonté est un nombre fixé à la base, en fonction de la race.
Vous le trouverez dans "Le Bestiaire".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Test de Volonté',
								'content' => 'Vous serez amené au cours du jeu à vous demander si le personnage ne serait pas effrayé ou charmé par les circonstances. Intervient alors le test de volonté. Celui-ci consiste simplement à jeter un D20 et à espérer obtenir son facteur ou plus afin de "réussir" son test.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un humain (12 de volonté) se retrouve soudainement nez-à-nez avec un troll (ça fait peur un troll). Comment savoir comment réagit le personnage? Le joueur aimerait probablement qu\'il garde son sang froid, mais peut-être son personnage n\'est pas aussi courageux qu\'il l\'aimerait... Du coup, le MJ demande un test de volonté.
Ce jet n\'existe qu\'à but indicatif, pour vous aiguiller dans la réaction que vous déciderez d\'adopter avec votre personnage. Il est donc intimement lié à celui-ci. Mais rappelez vous, que vous, et vous seul déciderez de ce que votre personnage fera.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Imaginons (pour l\'exemple précédent) que nous obtenions un 8 (test de volonté échoué) et que notre humain de tout à l\'heure, est reconnu comme étant un vil poltron. La réaction d\'un bon joueur devrait normalement être de fuir en hurlant de peur.
Si au contraire, il s\'agit d\'un preux chevalier qui cours au secours de la dame de ses pensées, le joueur aguerrit pourra alors adopter une réaction tel qu\'un sursaut et un petit cri de surprise qui lui échappe (et ce juste avant de pourfendre cette créature).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Remarque probable du lecteur :',
								'content' => 'Les héro tels que les justiciers sont avantagé par rapports aux voleurs alors!',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Réponse :',
								'content' => 'Pour ce qui est de la volonté, oui. Mais ces héros sont aussi ceux qui combattent en première ligne. Le risque encouru contrebalance cet avantage. La psychologie de votre personnage prend donc ici une grande importance. Et c\'est, mêlé aux circonstances (l\'humeur du personnage à ce moment, l\'intérêt qu\'il porte à la réussite de la mission,...) que le joueur doit lui-même décider de la réaction la mieux adaptée pour son personnage.
C\'est un peu compliqué convenons-en, mais le D20 est là pour vous aider.
Le joueur peut parfois décider de ne pas jeter le dé s\'il pense savoir exactement comment réagirait son personnage (sauf si le MJ le lui impose).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Remarque probable du lecteur :',
								'content' => 'Mais alors c\'est nul, on n\'a qu\'à tous décider de ne pas jeter le dé et de faire comme bon nous semble à chaque fois!',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Réponse :',
								'content' => 'Cela peut arriver, mais dans ce cas, le MJ devrait réduire les points d\'expérience attribués aux joueurs qui abusent. Et puis c\'est vraiment nul de la part des joueurs, non?',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Malus de Volonté',
								'content' => 'Le MJ peut décider d\'augmenter la difficulté d\'un test de volonté. "Parce que ce troll là est plus moches que les autres", "parce que l\'ambiance était tendue depuis un moment", "parce que ça lui chante d\'en faire ainsi",...
Mais, des malus peuvent aussi être entraînés part un autre personnage.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Une demoiselle fait un jet de séduction (avec des D10, on le verra après) sur un humain (toujours 12 de volonté). Admettons qu\'elle fasse 3 réussites. Le nombre à atteindre sur le D20 sera donc de 15 (12 + 3) pour réagir comme il l\'entend.
Ce qui ne veut pas dire que s\'il fait 20, il n\'as pas le droit d\'être charmé (il fait ce qu\'il veut, il a réussi). Par contre s\'il fait un 1, il ne pourra pas prétendre être insensible à cette jeune dame (a moins que ce soit une trollope qui essais de charmer un homme). Là encore, c\'est au joueur de d\'ajuster sa réaction en fonction de son personnage et des circonstances, l\'elfe restera très courtois alors qu\'un orc, lui... beaucoup moins.
Sachez encore qu\'un 1 est toujours considéré comme un échec alors que le 20 est toujours considéré comme une réussite quelque soit les malus de volonté.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Facteur de Vitesse',
								'content' => 'Voici le second facteur, lui aussi doit donc être le plus bas possible pour être optimum. Celui-ci est également fixé en fonction de la race et se traduit par un nombre compris entre 1 et l\'infini. Ce facteur représente le temps qu\'il vous est nécessaire pour accomplir une action comme dégainer votre arme, charger votre arc, frapper votre ennemi,... chaque point représentant 0,2 seconde.
C\'est donc principalement dans les combats que celui-ci devient primordial. Vous le trouverez dans "Le Bestiaire".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Vitalité',
								'content' => 'La vitalité est définie par la race à la base. C\'est une quantité de point qui définissent le nombre de blessures que les personnages peuvent subir avant de succomber (il est donc préférable d’en avoir beaucoup).
Vous la trouverez dans "Le Bestiaire".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Orientations et classes',
								'content' => 'Les orientations et classes sont synonymes de secteurs et métiers.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un peintre travaille dans le secteur artistique, c\'est donc un artiste. Mais plus précisément, il est peintre. Dans ce cas, l\'orientation est "artiste" et la classe est "peintre".
La logique du jeu veut faire plusieurs ensembles assez larges composés de sous ensembles plus précis (comme c\'est le cas pour les compétences et spécialisations que nous verrons plus tard) Chaque orientation donne droit à un atout d\'orientation et chaque classe, à un atout de classe.
Pour connaître la liste détaillée des orientations et classes, ainsi que leurs atouts, référez-vous à la liste "Orientations et Classes".
La description de tous les atouts se trouve dans "Le Lexique".',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Psychologie',
								'content' => 'La psychologie est un aspect important de votre personnage (surtout pour les joueurs), car dans Knight and Wizard, les points d\'expérience sont principalement distribués en fonction de la qualité d\'interprétation du personnage, et non en fonction du nombre d\'ennemis tués. Ce qui signifie qu\'un joueur qui interprète magnifiquement un voleur couard qui ne fait que de fuir, recevra plus de points d\'expérience que celui qui joue un gros guerrier qui se contente de tuer tous ceux qui le gênent.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Exemples de psychologies :',
								'content' => 'Positiviste, ténébreux, jovial, amical, antipathique, vengeur, chevaleresque, timide,... Vous en trouverez bien d\'autres j\'en suis sur...
Vous pouvez en cours de jeu changer de psychologie, mais essayez de faire en sorte qu\'il y ait un minimum de logique dans vos changements, l\'histoire ne s\'en portera que mieux.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Divinités',
								'content' => 'Chaque personnage peut avoir une divinité qu\'il prie, à qui il fait ses demandes, vers qui il va se plaindre quand ça va mal,... Pour choisir la divinité qui correspond le mieux au personnage, reportez-vous au dosument "Cultes et Religions".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Atouts',
								'content' => 'Les atouts sont un point important du jeu, car ils relèvent l\'importance du personnage et le personnalise plus encore. C\'est notamment grâce à eux que deux personnages de même classe et de même niveau peuvent être totalement différents.
Tout d\'abord, il faut savoir que les atouts ne sont accordés qu\'aux personnages importants (sauf pour les atouts de race), soit ceux des joueurs, et les acteurs principaux de l\'histoire. Le gamin qui mendie sur la place du marché et que l\'ont ne rencontrera qu\'une fois n\'y a donc pas droit.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Atouts Permanents et Ephémères',
								'content' => 'Nous pouvons distinguer deux formes d\'atouts, les atouts permanents et les atouts éphémères. Le terme "permanent" signifie que l\'atout s\'applique toujours et automatiquement, sans que le personnage n\'ait à faire quoi que se soit. Ce sont par exemples les atouts de classe.
Les atouts éphémères quant à eux, sont limités, et ce, par journée. Une fois les atouts éphémères tous utilisés, il faut alors dormir pour les récupérer et pouvoir s\'en servir à nouveau.<br />
Il existe 4 types d\'atouts :<br />
1) Les atouts de race<br />
2) Les atouts d\'orientation (toujours éphémères)<br />
3) Les atouts de classe (toujours permanents)<br />
4) Les atouts de niveaux',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Atouts de Niveaux',
								'content' => 'Les atouts de niveaux s\'obtiennent en cours de jeu, à chaque passage de niveau. Ils sont propres et proportionnels au niveau évidement, (les atouts de niveau 5 sont plus puissants que les atouts de niveau 2). Ils sont aussi généralement propres à la classe (les atouts de niveaux d\'un poète ne sont pas les mêmes que ceux d\'un barbare). Mais, ils peuvent également être liés à la race, au sexe, à d\'autres atouts, à une aptitude ou même au vécu du personnage.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => '"Grand amour", atout niveau 2 qui permet de protéger l\'être aimé, n\'est accessible uniquement que si le personnage est amoureux.
Il faut encore savoir qu\'un atout de niveau éphémère peut être choisi plusieurs fois.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un atout de niveau 2 peut être choisi une fois arrivé au niveau 2, puis au niveau 3, puis 4 et ainsi de suite autant de fois qu\'il vous plaira. L’intérêt réside dans le fait de pouvoir ainsi utiliser votre atout plusieurs fois par jour.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Handicaps',
								'content' => 'Les handicaps peuvent être liés à la race ou au vécu des personnages. Un maître de jeu pourra par exemple, donner la phobie des requins à un personnage ayant été attaqué par ceux-ci, s\'il estime qu\'il y a eu lieu d\'être choqué à vie.
Ces handicaps sont très difficiles à perdre mais peuvent néanmoins êtres combattu à l\'aide de la volonté. C\'est aussi le maître de jeu qui décide de retirer ces handicaps dans le cas ou le personnage aurait sut vaincre sa peur de manière définitive.
Par contre, les handicaps de race demeurent à jamais.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Magie',
								'content' => 'La magie consiste à canaliser les énergies pour les rediriger de telle manière à créer un effet que l\'on appelle "sort". Les seules personnes capables de les lancer, se nomment les magiciens. Ce qui ne signifie pas que ce sont les seuls à pouvoir faire des rituels, comme pour construire un objet magique par exemple.
Attention, un personnage qui n\'est pas magicien à la base, ne peut en aucun cas le devenir par après. Alors qu\'un magicien lui peut décider d\'abandonner la magie. Un lanceur de sorts ayant tourné le dos aux énergies, ne peut décider de redevenir magicien par la suite.
Il existe 11 sources d\'énergie qui donnent lieu à 11 types de magies, avec chacune leurs couleurs et leurs magiciens.<br /><br />
L\'abjuration => Jaune => Abjurateur<br />
L\'altération => Rouge => Altérateur<br />
La magie blanche => Blanc => Clerc<br />
La divination => Brun => Devin<br />
L\'enchantement => Turquoise => Enchanteur<br />
L\'élémentaire => Bleu => Elémentariste<br />
L\'illusion => Violet => Illusionniste<br />
L\'invocation => Orange => Invocateur<br />
La magie naturelle => Vert => Druide ou Chaman<br />
La magie noire => Noir => Sorcier<br />
La nécromancie => Gris => Nécromancien<br /><br />

Chacun de ces magiciens est capable de lancer n’importe quel sort, il aura simplement plus de facilité à lancer ceux de sa couleur. Tous les sorts connus à ce jour sont répertoriés dans "Le Grand Grimoire". Cet ouvrage informe sur la couleur du sort, la difficulté convenue (diff.), le temps d\'incantation (TI), l\'énergie que celui-ci nécessite (éner.) et donne également un petit descriptif de l\'effet produit.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Energie',
								'content' => 'Chaque sort peut être considéré comme un modelage d\'énergie. Celle-ci peut se trouver autant dans des réceptacles physiques, tels que les éléments, les végétaux,... qu\'immatériels comme le temps, la mort, les vibrations positives,...
Le fait de transformer ces énergies est très éprouvant, ainsi, chaque magicien ne peut en déplacer qu\'une certaine quantité par jour. Celle-ci est représentée par les points d’énergie. Un sommeil a pour effet de restaurer ces points.
Il est aussi important de savoir qu\'un lanceur de sort n\'utilise pas la même quantité d\'énergie selon l\'effet qu\'il désire produire. Ce qui signifie que certains sorts coûtent plus cher en points d\'énergie que d\'autres.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Parler aux oiseaux ne demande pas beaucoup d\'énergie, alors que déclencher une tornade de feu coûte beaucoup plus cher.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Temps d\'Incantation',
								'content' => 'Abrévié TI, le temps d’incantation représente le temps nécessaire à l\'incantation d\'un sort, en DT (division de temps, nous verrons cela plus en détail par la suite). Il s\'agit donc d\'un laps de temps durant lequel le magicien récitera une formule magique et effectuera un mouvement de la main qui lui permettra de jeter un sort.
Pendant cette période, la concentration du personnage ne doit pas être perturbée. Ce qui signifie que si quelqu\'un d\'autre le bouscule ou le fait taire, le sort sera annulé avant même d\'avoir été lancé. Dans ce cas, les points d\'énergies dépensés sont perdus.
Pour relancer un sort annulé, il faut reprendre celui-ci depuis le début.
Pour avoir plus de chances de réussir à lancer son sort (voir en être certain), le magicien a la possibilité de diminuer son temps d\'incantation. Pour se faire, le lanceur devra dépenser 2 points d\'énergie supplémentaires par division de temps (DT) en moins. Une incantation ne peut être descendue en dessous du facteur de vitesse du personnage.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un magicien qui souhaite lancer le sort "Flèche de foudre" (avec un TI de 10, et un coût d\'énergie de 10) et qui aimerait diminuer son incantation à 7, pourra le faire en dépensant 16 points d\'énergie (10 + 2 x 3). Notez que pour lancer un sort en 7 DT, le lanceur doit avoir un facteur de vitesse de 7 maximum car il ne peut incanter plus vite que son facteur ne le lui autorise.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Familier',
								'content' => 'Chaque magicien peut décider de posséder un familier qui l\'aidera au quotidien. Ceux ceux- ci peuvent prendre n\'importe quelle forme, c’est au choix du magicien.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un chat, un rat, un hibou, un crapaud, mais aussi des formes plus originales telles qu\'un livre sur patte ou un oeil ailé.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Les points de vitalité des familiers sont limités par le niveau du magicien qui les contrôle. Ils sont égaux au niveau de leur maître multiplié par 5. Ce qui limite également la taille des familiers.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un magicien de niveau 3 aura un familier avec 15 (3 x 5) points de vie. Pour être précis, il faudrait que le volume qu\'occupe le familier ne dépasse pas le volume d\'une bête ayant le même nombre de points de
vie que celui-ci.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Pour un magicien de niveau 1, qui à donc un familier de 5 points de vitalité (1 x 5), on observe les bêtes possédant environ 5 de vitalité. On se rend compte que cela correspond assez bien au chat. Le magicien pourra donc avoir un chat comme familier, mais aussi (pourquoi pas) un petit chien ou un autre animal, du moment que cela ne dépasse pas la taille du chat.
S\'il décide de prendre autre chose qu\'un animal à quatre pattes (une sphère par exemple), on ne peut pas réellement parler de taille (car la forme est tout à fait différente) on parlera donc de volume, ce qui équivaudra à environ un ballon de handball.
Attention, si le personnage préfère avoir un familier de plus petite taille, rien ne l\'en empêche. Le magicien peut changer la forme de son familier à chaque passage de niveau. C\'est aussi au passage de niveau que le personnage peut récupérer un familier dans le cas ou l\'ancien serait mort ou s\'il n\'en avait pas avant.
Un des plus grands intérêts du familier est de lui ajouter des atouts de niveaux accessibles avec le passage de niveau du lanceur de sort.
Les familiers sont considérés comme des personnages secondaires. Cela signifie qu\'ils peuvent évoluer avec l\'expérience du magicien (nous verrons cela plus tard).
Si un familier vient à mourir, touts les points supplémentaires acquis sont perdus, le magicien devra donc reprendre l\'évolution du suivant depuis le début. Par contre, les atouts de niveaux que ceux-ci ont placés en leurs familiers seront reportés sur le prochain.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Repos',
								'content' => 'Le sommeil permet de récupérer les atouts éphémères ainsi que les points d\'énergie. La durée de base d\'un repos est de 8 heures. Ce qui signifie qu\'un personnage qui dormirait seulement 4 heures pourrait récupérer la moitié de ses points.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Aptitudes',
								'content' => 'Les aptitudes sont les capacités que toute personne équilibrée possède quelle que soit sa race ou sa classe. Elles sont au nombre de 9 (listées ci-après). Chacune de ces aptitudes peut se révéler être la plus importante, cela dépend principalement du joueur et du personnage.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Force',
								'content' => 'La force (physique dans ce cas) vous permet notamment de faire plus de dégâts lorsque vos coups atteignent leurs cibles. Vous pouvez aussi grâce à elle porter une charger d\'équipement plus importante sans être pénalisé.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Dextérité',
								'content' => 'La dextérité représente votre habileté et votre précision dans vos mouvements. C\'est probablement l\'aptitude la plus usitée, car elle permet de réaliser toutes les actions physiques.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Endurance',
								'content' => 'Que se soit contre de l\'alcool, du poison, la fatigue ou bien directement des coups portés, l\'endurance est le dernier rempart qui vous protègera.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Réflexes',
								'content' => 'Réagir rapidement et savoir s\'adapter à une situation inattendue vous permet entre autre d\'éviter de mauvais coups.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Perception',
								'content' => 'Aiguiser ses sens et développer son observation vous donne un avantage considérable sur les autres, de par les informations que vous obtenez.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Intelligence',
								'content' => 'Un raisonnement puissant et une capacité mentale supérieure vous permettent d\'accéder au savoir, de développer votre connaissance et surtout de canaliser les énergies qui vous permettent de lancer des sorts.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Charisme',
								'content' => 'Ce que vous dégagez, que se soit de la peur, de la fraternité ou du respect, influence la manière dont les autres vous perçoivent et réagissent par rapport à vous.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Empathie',
								'content' => 'La facilité de comprendre autrui, de se mettre à sa place et de ressentir ses sentiments, est le fondement de toute relation sociale et vous permet entre autre de savoir en qui avoir confiance.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Esthétique',
								'content' => 'Le charme physique peut être très important selon votre méthode de jeu. Parfois, la séduction peut s’avérer être plus puissante que n’importe quelle arme.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Limites Physiques',
								'content' => 'Imaginons l\'homme le plus fort du monde. Doublons encore sa force histoire de faire bien fantastique. Cet homme, jamais, ne pourra soulever la tour d\'un château. Et pour cause, l\'être humain n\'est pas fait pour cela. Un titan pourra peut être se le permettre, mais l\'homme, lui, n\'as pas un physique adapté. C\'est donc qu\'il existe des limites liées au physique des races. Les limites physiques existent dans le jeu notamment pour éviter le ridicule d\'Obélix qui soulève le Sphinx ou d\'un gnome qui bat un minotaure au bras de fer.
Pour prendre connaissance de celles-ci, reportez-vous au "Bestiaire".
Ces maximums dans les aptitudes sont quasiment indépassables, à cause des points d\'expérience à dépenser pour cela. Nous y reviendrons plus tard.
Pour vous faire une idée de la moyenne de point de d\'une race dans une aptitude, divisez la limite physique de celle-ci par 2.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'On peut estimer la force moyenne d\'un humain (5 de limite physique en force) à 2,5 (5:2).
Lorsque l\'ont ne tombe pas sur un nombre entier, on considère qu\'il y a autant de personne en dessus que de personne au dessus. Pour vous aider, regardez le métier pratiqué par la personne, un soldat aura plutôt 3 et un artiste plutôt 2.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Attributs Nuls',
								'content' => 'Les attributs nuls ou inexistants ne peuvent être modifiés (ou passer à plus de 0). Attention toutefois, un personnage qui possédait des points et qui les a, par la suite, perdus (par exemple quelqu\'un de très beau brûlé au troisième degré sur tout le corps), peut toujours évoluer dans cette aptitude.
Avoir un attribut nul signifie entre autre que chaque jet de dés basé sur cette aptitude est un échec total. Nous verrons cela dans le chapitre qui leurs est consacré.
Retenez qu\'avoir 0 dans un attribut, signifie avoir un grave problème.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => '0 en empathie, pour les sociopathes.<br />
								0 en charisme, en cas de renfermement sur vous-même, voir d\'autisme.<br />
								0 en apparence, pour les défigurés.<br />
								0 en force, vous êtes une éponge (c\'est nul niveau force une éponge).<br />
								...',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Compétences et Spécialisations',
								'content' => 'Ce point du jeu est essentiel, car celui-ci ne vous propose pas de liste exhaustive. L\'idée étant bel et bien de considérer une infinité de compétences avec pour chacune d\'entre elles, une infinité de spécialisations, ce qui aura pour effet de vous permettre d\'utiliser le même personnage indéfiniment sans que celui-ci jamais ne plafonne, n\'ai plus rien à apprendre ou devienne trop puissant pour être intéressant à jouer.<br />
								Tout d\'abord, prenons conscience de la définition de ces deux mots.<br />
								Compétence : Savoir et technique de base, dans un secteur donné.<br />
								Spécialisation : Développement et perfectionnement d\'un secteur précis d\'une compétence.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemples :',
								'content' => 'Compétence => Spécialisation<br />
								Danse => Tango<br />
								Course => Sprint<br />
								...',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Bref, vous avez compris, la compétence est générale et la spécialisation est précise. Pour vous aidez, vous pouvez vous poser la question : Serait-il possible de prendre un cours de ...?
Si la réponse est oui, il est fort probable que la chose en question soit une compétence. Si au contraire, vous vous dîtes non, que cela serait un chapitre d’un cours de ..., alors il y a fort à parier que vous faîtes référence à une spécialisation.
Evidement, des petits malins diront qu\'il existe des cours de perfectionnements (en informatique notamment). Mais bon, vous tomberez de toute manière sur des cas qui pourront vous sembler litigieux. Ce sera alors à vous de prendre une décision.
Vous devrez par la suite distribuer des points dans vos compétences et spécialisations, l\'avantage est que ces deux secteurs ne souffrent d\'aucunes limites. Ce qui signifie que vous pouvez monter votre score en furtivité à 4012 si vous le voulez. La seule chose qui vous freinera sera l\'expérience.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Cette échelle vous aidera à vous faire une idée de la pondération de ces points :<br />
								0 points - Vous ne connaissez rien à la chose.<br />
								1 point - Vous avez de vague notions.<br />
								2 points - Vous êtes débutant.<br />
								3 points - Vous êtes initié.<br />
								4 points - Vous avez un niveau professionnel.<br />
								5 points - Vous êtes expert dans votre domaine.<br />
								6 points - Vous êtes connu de là d’où vous venez.<br />
								7 points - On connaît votre nom dans le métier.<br />
								8 points - On parle de vous dans votre pays.<br />
								9 points - Votre nom est cité lorsqu\'on parle de votre branche.<br />
								10 points - Vous êtes connu dans le monde entier.<br />
								11 points - On vous reconnaît dans la rue.<br />
								12 points - Vous entrez dans la légende.<br />
								13 points - Vous comptez maintenant parmi les atouts de la nation.<br />
								14 points - Votre avis et vos actes influencent sur les puissants de ce monde.<br />
								15 points - Vous êtes devenu un mythe, les gens ne vous croient plus mortel.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Niveaux',
								'content' => 'Les points de niveau se comptent de la manière suivante :
Chaque point dans une compétence ou spécialisation donne 1 point de niveau sauf pour la compétence primaire ainsi que toute ses spécialisations qui octroient 2 points.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Compétence Primaire',
								'content' => 'La compétence primaire représente la fonction première de la classe.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Classe => Compétence primaire<br />
								Bûcheron => Bûcheronnage<br />
								Cuisinier => Cuisine<br />
								Forgeron => Forge<br />
								Soldat => Son arme (épée à une main, hache, etc)<br />
								Dessinateur => Dessin<br />
								...',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Certaines classes (comme les pirates) ne trouveront pas de compétence primaire qui coule de source. Dès lors, c’est au joueur de choisir quelle sera sa compétence primaire pour autant qu’un rapport direct et évident puisse être fait entre elle et la classe (un rôdeur qui choisit comme compétence primaire l’humour, ne peut être envisageable).
Souvenez-vous encore que toutes les spécialisations de ses compétences primaires donnent également 2 points de niveau.
Un personnage ne peut avoir qu’une seule compétence primaire.
Attention, les magiciens n’ont pas de compétence primaire. Ils comptent normalement les points des compétences et spécialisations comme 1, et les points qu’ils possèdent dans leurs sorts comme 2. Ce qui veut dire qu’au début, les lanceurs de sorts sont un peut plus faible mais aussi qu’à long terme, ils deviennent plus fort que les non-magiciens.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Passages de niveaux',
								'content' => 'Une fois vos points cumulés, vous pourrez situer votre niveau grâce à votre catégorie.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un humain (catégorie 20) passera les niveaux en atteignant avec ses points de niveau, les seuils suivants :<br />
								Niveau 1 = 20 (Niveau X Catégorie)<br />
								Niveau 2 = 40 (2 X 20)<br />
								Niveau 3 = 60 (3 X 20) Niveau 4 = 80 (4 X 20)<br />
								...',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'A chaque passage de niveau, le personnage acquière un atout de niveau. Pour obtenir la liste de ces atouts, référez-vous à la liste "Atouts de Niveaux".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Evolution',
								'content' => 'L\'évolution des personnages est ce qui rend le jeu de rôle intéressant, autant par la progression technique que physique et mentale. Tous personnages devraient pouvoir évoluer avec le temps, mais il est plus simple de considérer que seuls les joueurs bénéficient de cet avantage.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Expérience',
								'content' => 'A la fin de chaque session de jeu, le maître de jeu distribue des points d\'expériences aux joueurs. Ces points permettent de faire évoluer leurs personnages. Les coûts d\'amélioration ou d\'apprentissage des diverses parties qui composent un personnage sont répertoriés sur la feuille "L\'Expérience".
La mort du personnage implique la perte de tous les points d\'expérience que le joueur avait acquis avec celui-ci.
Les points d\'expérience se gagnent principalement sur la qualité d\'interprétation du personnage par le joueur. Ce qui signifie qu\'un voleur peureux, qui s\'enfuie à chaque claquement de porte, obtiendra normalement plus de points qu\'un berseker qui ne pipe mot et se contente juste de tuer ceux qui se mettent en travers de son chemin. Il est évident que le premier vivra des aventures beaucoup plus intéressantes et qu\'avec lui, vous passerez de bien meilleurs moments qu\'en compagnie du second qui réduira en quelque sorte la trame de l\'histoire au profit de jets de dés.
Pour une évolution harmonieuse, il est conseiller de distribuer entre 1 et 8 points d\'expériences, plus 1 point de quête. L\'échelle suivante pourra vous aider.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Distribuez :',
								'content' => '1 point pour la présence.<br />
											1 point pour la concentration du joueur sur l\'histoire et se qui se dit.<br />
											1 point pour le respect de la parole des autres.<br />
											1 point pour le respect de la psychologie du personnage.<br />
											1 point si le personnage a atteint un objectif.<br />
											0 à 3 points pour l\'interprétation du personnage.<br />
											1 point de quête.
											',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Ce tableau se base sur une session d\'environ 4 à 5 heures de jeu. Si vous jouez plus ou moins longtemps, adaptez celui-ci à vos sessions. Il est important de ne pas comparer les joueurs entre eux, mais de le faire par rapport à eux-mêmes de manière à ne pas avantager celui ou celle qui à de la facilité ou qui fait du théâtre. Le jeu est ouvert à tous et chacun est libre de s\'améliorer à son rythme.
Le point de quête ne se mélange pas aux points d\'expériences, mais se note à part et se cumule à chaque session de jeu. Ces points ne sont accessibles aux personnages qu\'une fois l\'histoire terminée, si le personnage y survit.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Personnages Secondaires',
								'content' => 'Les personnages secondaires sont souvent les familiers des magiciens mais peuvent également être des animaux qui suivent les personnages ou encore leurs compagnons. Ceux-ci ont également la possibilité d\'évoluer avec l\'expérience que son personnage primaire lui cède.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un cavalier peut décider de donner une partie de ses points d\'expérience à son cheval pour augmenter la vitesse de course de sa monture.
Si un personnage secondaire possède une classe (donc non pas un animal, mais plutôt un partenaire) celui-ci passe également les niveaux.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Equipement',
								'content' => 'L\'équipement se note sur la "Feuille d\'Equipement". Celle-ci se divise en 5 parties. La première est la fortune, vous y mettrez vos pièces entre autre. Puis vous avez les armes, les armures, les boucliers et pour finir, les autres objets.
Dans la colonne poids, mettez le poids estimé, en kilo (au 100g. près, on n\'est pas non plus en train de vendre du safran). Pour vous aider, la "Tables des Armes" et la "Table des Protections" donne les poids des objets mentionnés. Et pour ce qui est des pièces d\'or, d\'argent, etc., ne vous compliquez pas la tâche. Comptez simplement 100g par tranche de 10 pièces.<br />
Faîtes pour finir le total du poids de votre équipement. Cela prendra de l\'importance dans les combats notamment. Vous devez néanmoins savoir que vous pouvez porter jusqu\'à 5kg d\'équipement sur vous par point en force, sans avoir de pénalité de vitesse. Au dessus de votre maximum, votre facteur de vitesse augmente de 1 par tranche de 5 kg supérieurs à votre maximum.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un personnage qui possède 3 de force pourra porter au maximum 15 kg (3X5) sans être pénalisé. Mais imaginons qu\'il en porte 15.1 kg. Son facteur de vitesse sera alors augmenté de 1, il sera donc ralentit. Ce malus s\'appliquerait jusqu\'à un maximum de 20 kg, après quoi, son malus sera de 2 (à partir de 20,1 kg), puis de 3 (à partir de 25,1 kg) et ainsi de suite par tranche de 5kg.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Création de Personnages',
								'content' => 'Pour jouer, vous allez avoir besoin de personnages qui animeront vos histoires. Ceux-ci sont appeler PJ (Personnage Joueur) s\'ils sont incarnés par des joueurs, et PNJ (Personnage Non Joueur) si c\'est le maître de jeu (MJ) qui les dirige. Pour créer un personnage intéressant, il est grandement suggéré de prendre un petit moment afin de se l\'imaginer, cela vous aidera beaucoup. Maintenant procédons pas à pas, vous devez choisir et/ou noter...',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Le Genre',
								'content' => 'Il vous faut choisir un sexe à votre personnage. Pour un nouveau joueur il est conseillé de commencer par un personnage de son propre sexe (ce qui est souvent plus facile à jouer). Précisons tout de même que le médiéval fantastique donne souvent les mêmes droits aux femmes qu\'aux hommes (ce qui n\'était malheureusement pas toujours le cas dans le simple âge médiéval).',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'La Race',
								'content' => 'Attention, noter bien votre catégorie, nous en aurons besoin pour la suite. Pour vous aider, reportez vous à la table "Les Races". "Le Bestiaire" vous donnera des informations supplémentaires quant aux races, ainsi qu\'une description qui pourra vous aider à faire votre choix.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Atouts et Handicaps de Race',
								'content' => 'Vous pouvez tout de suite après, noter sous "Atouts" et éventuellement "Handicaps" (en bas de la feuille) vos atouts ainsi que vos handicaps de race (si vous en avez). Ceux-ci sont définis en fonction de votre race. Pour vous aider, reportez vous à la table "Les Races". La description des atouts et handicaps se trouve dans "Le lexique".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Facteurs et la Vitalité',
								'content' => 'Notez votre facteur de vitesse, de volonté ainsi que votre vitalité. Ceux-ci sont définis en fonction de votre race. Pour vous aider, reportez vous à la table "Facteurs et Vitalité".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'L\'Orientation et la Classe',
								'content' => 'Parce que vous êtes bien sympathique, mais il va falloir qu\'on vous trouve un métier ! La première question que vous devriez vous poser est : Vais-je donc jouer un magicien?
En effet, vous avez bien raison de vous la poser, car ce choix est crucial. Un magicien peut par la suite abandonner la magie (mais s\'il le fait il ne pourra jamais la retrouver), alors qu\'un non magicien ne peut en aucun cas devenir magicien.
Une fois ce choix fait, noter votre classe. Pour vous aider à choisir, reportez vous à la table : "Orientations et Classes".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Atouts d\'Orientation et de Classe',
								'content' => 'Notez vos atouts d\'orientation et de classe au bas de votre feuille (sous "Atouts"). Pour vous aider, reportez-vous à la table : "Orientations et Classes". La description des atouts se trouve dans "Le lexique".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Sorts et Energie',
								'content' => 'Si vous n\'êtes pas en train de créer un magicien, passer votre chemin! Les magiciens ont droit à deux points de sort pour commencer. Vous pouvez donc choisir d\'avoir 1 point dans deux sorts ou 2 points dans un seul sort. Pour choisir ceux-ci, référez vous au "Grand Grimoire" et noter leurs caractéristiques dans votre tableau de sorts (en bas de la feuille). Ils ont également droit à 60 points d\'énergie (à noter dans "Energie").',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'La Psychologie',
								'content' => 'Utilisez un mot pour définir la manière dont vous jouerez votre personnage. Par exemple, calme, sérieux, extraverti, brutal,... puis notez-le sous "Psychologie".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'La Divinité',
								'content' => 'Pour vous aider à choisir la divinité qui vous convient le mieux, reportez-vous à la table : "Les Divinités". Puis, noter son nom sous "Divinité".
Vous pouvez décider d\'être athée, mais à long terme, cela risque de devenir moins intéressant pour le jeu.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'La Citation',
								'content' => 'Utilisez une phrase qui représente votre personnage. Par exemple, "Si je meurs, que se soit en combattant", "Respecte la nature et elle te le rendra", "L\'ombre est frère de lumière",... Notez-la sous "Citation". Cela animera vos personnages.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Aptitudes',
								'content' => 'Nous voilà entré dans le vif du sujet : la distribution des points. Vous possédez sur votre feuille de personnage neuf aptitudes dans lesquelles vous pourrez dépenser un nombre de points égal à votre catégorie.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un hobbit (catégorie 16) pourra dépenser 16 points.
Sauf que ce n\'est pas si simple, vous ne pouvez pas mettre vos points n\'importe où comme vous le voulez. Tout d\'abord, sachez qu\'un minimum de 1 point est vigoureusement conseillé.
Il se peut que vous jouiez tout de même une créature avec 0 dans une aptitude (notamment pour ce qui est des petites créatures et des animaux), mais cela indiquerait qu\'aucune évolution ne sera possible dans cette même aptitude.
A l\'inverse, vous ne pouvez pas non plus mettre trop de points dans une aptitude. Alors un dernier petit effort, au commencement, vous avez droit à votre limite physique (en fonction de votre race et de l\'attribut en question) - 1, au maximum.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un elfe (6 de limite physique d\'apparence) ne pourra se mettre au-delà de 5 points (5 - 1) dans cette aptitude lors de la création de son personnage. Un hobbit (3 de limite physique de force) ne pourra s\'attribuer plus de 2 points (3 - 1) dans cet aptitude dés le départ. C\'est là probablement, la partie la plus technique de la création d\'un personnage.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Compétences et Spécialisations',
								'content' => 'Maintenant passons à la partie la plus libre, la plus créative, celle qui personnalisera votre personnage, mais aussi très probablement la plus compliquée. Nous allons définir ce que votre personnage a appris tout au long de sa vie.
Le nombre de points que vous pouvez dépenser est à nouveau égal à votre catégorie (comme précédemment pour les aptitudes).
Le minimum de points est de zéro (dans ce cas ne notez pas la compétence sur votre feuille). Le maximum est points est de 4 (pour un nouveau personnage).',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'L\'Equipement',
								'content' => 'Pour ce qui est de l\'équipement, c\'est à vous de choisir vos avoirs. Pour un nouveau personnage essayez tout de même d\'être raisonnable, car celui qui possède tout à la base n\'a plus d\'objectif, ou tout du moins, plus d\'objectif à sa portée.
C\'est le MJ qui doit décider de ce qui est acceptable ou ne l\'est pas.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Les Touches Finales',
								'content' => 'Voilà votre personnage est presque terminé, il ne vous reste plus qu\'à lui trouver un nom et vous serez prêts pour partir à l\'aventure !
Toutefois si l\'envie vous en prend, il est agréable et donc conseillé d\'imaginer une petite histoire du passé de votre héros et pourquoi pas tant que nous y sommes, une motivation. Dans le jargon rôliste, ceci s\'appel un background et cela aide beaucoup le maître de jeu dans l’élaboration de ses histoires.
Félicitations, vous venez de créer un personnage Knight and Wizard. Alors? Fût-ce si terrible?',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Divisions de Temps',
								'content' => 'Lors d\'un combat (ou d\'une scène qui a besoin d\'être très précise), le MJ peut s\'aider des divisions de temps (DT). Chacune d\'entre elles représentes 0.2 seconde.
Pour les utiliser correctement, le MJ compte les DT (1, 2, 3,... il est conseillé de repartir à 0 une fois arrivé à 50, ce qui représente 10 secondes) et les joueurs lui font signe de s\'arrêter lorsqu\'ils effectuent des actions. Chaque action effectuée par un personnage prend le facteur de vitesse de celui-ci en DT avant d\'être terminée. Après quoi, le joueur jette éventuellement les dés pour savoir s\'il a réussi l\'action ou non.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel (un elfe des bois avec un facteur de vitesse de 7) souhaite tirer une flèche sur un orc, il en informe le MJ (chaque joueur en fait de même) et celui-ci se met alors à compter les DT.
1, 2, 3, 4, 5, 6, 7, Salogel fait signe de la main, le MJ s\'arrête de compter et le joueur informe qu\'il vient d\'armer son arc (pas de jet pour ce genre d\'action ridicule SVP).
Personne d\'autre? Non... Le MJ reprend donc, 8, 9, 10, ...
Arrivé à 14 (7 + 7) Salogel fait une seconde fois signe au MJ pour l\'informer qu\'il a tiré sur son ennemi (là un petit jet de dés n\'est pas à négliger).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Après chaque action, on reprend le compte des DT là ou il était resté, et ce, jusqu\'à ce que le combat se finisse ou que le MJ arrive à le gérer seul (se qui n\'est pas toujours facile, selon le nombre de personnage impliqué).
L\'intérêt de se système est que chaque joueur gère son propre personnage et est quasiment autonome (une fois le système compris), ce qui permet au MJ de se concentrer d\'avantage sur les PNJ et autres éléments de l\'histoire.
Attention de bien compter la charge des armes balistiques comme étant une action.
Vous vous rendrez vite compte que les combats prennent très vite beaucoup de temps. Et ce, simplement pour gérer ce qui en réalité correspond à quelques secondes de combat.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'A titre informatif :',
								'content' => 'Les combats à l’époque duraient en moyenne entre 2 et 7 secondes.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions et Jet de Dés',
								'content' => 'Lorsque vous utiliserez les DT, vous aurez à gérer des actions. Voyons ici les différents types d\'actions, leurs conséquences et comment les gérer.
Il est important de savoir qu\'à tout moment, une action peut être interrompue (souvent pour en recommencer une autre, mais parfois aussi pour attendre).
Toutes les actions se jouent à l\'aide des D10.',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Le Nombre de Dés',
								'content' => 'Pour connaître le nombre de dés que vous devrez lancer, il vous faut tout d\'abord trouver quelle aptitude, compétence et spécialisation(s) sont adaptées à l\'action que vous voulez jouer aux dés. Vous devez ensuite additionner le nombre de points que vous possédez dans chaque secteur. Si vous ne possédez pas de compétence ou/et de spécialisation(s) adéquates, considérez que votre score est donc de 0 dans celles-ci. Lancez ensuite ce nombre en D10.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel qui aimerais toujours tirer sa flèche, regarde ses aptitudes et détermine très rapidement et avec certitude que son empathie ne l\'aidera en rien dans son entreprise. Son apparence non plus. Sa force, pas trop... Son charisme, en tout cas pas. Ses réflexes, mmmmm...bof. Bon ok, j\'arrête. Tirer à l\'arc, est bien évidement une question de dextérité. Par chance notre ami est doué dans ce secteur, il possède 4 points.
Puis la compétence la mieux adaptée, pour tirer avec son arc long, semble être : "Arc long" (donc là, si cela ne vous semble pas logique, plus personne ne peux rien pour vous). Il possède 5 points dans cette compétence (ce qui est bien, mais bon c\'est son boulot aussi).
Aucune spécialisation ne sera tenue en compte, puisque le Salogel ne fait pas de tir précis.
C\'est donc un total de 9 qu\'il obtient en additionnant les 3 secteurs (4 + 5 + 0). Il prendra donc 9 D10 pour faire son tir à l\'arc.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Attention, pour lancer un sort, la sélection à faire est simplement l’intelligence + le sort désiré.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Imaginons un magicien avec 4 d’intelligence et 3 points en Boule de Feu. Lorsque celui-ci jettera son sort, il lancera donc 7 dés (4 + 3).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Difficulté et Réussites',
								'content' => 'La difficulté est le nombre minimum à obtenir sur vos dés lorsque vous les lancerez. Si un moins 1 dé correspond ou est supérieur à la difficulté du jet, vous obtenez alors 1 réussite et l\'action est considérée comme réussie. Si 2 dés sont supérieurs à cette difficulté, vous avez alors 2 réussites et ainsi de suite.
L\'intérêt de faire plusieurs réussites, est d\'influer sur la qualité des actions.
On estime qu\'un professionnel, dans son domaine, devrait faire en moyenne 4 réussites.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Difficultés Standards et Convenues',
								'content' => '
Une difficulté standard (c\'est-à-dire pour des actions qui demandent de se concentrer, mais pas d\'être un professionnel, comme sauté, courir, pêcher,...) est de 7.
Lorsque par contre nous effectuons des actions spéciales (par opposé à l\'action standard), qui requièrent donc une difficulté spéciale, nous parlerons de difficulté convenue. C\'est en général le MJ qui la fixe. Des tables sont à sa disposition pour l\'aider (notamment pour l\'utilisation des armes, voir "La Table des Armes" et "Le grand Grimoire" pour les sorts).',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Maintenant que Salogel sait exactement combien de dés il devra lancer, fixons la difficulté de son action. Dans l\'exemple choisi il s\'agit d\'une difficulté convenue (puisque l\'action fait référence à l\'utilisation d\'une arme) qui se trouve être de 7 également. Si en lançant ses 9 dés, Salogel réussi à faire au moins un 7 (ou plus que 7), il aura touché sa cible. S\'il en fait plusieurs, il l\'aura mieux touché et donc fait un plus beau tir.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateurs de Difficulté et Types d\'Actions',
								'content' => 'Il existe différents types d\'actions. Certaines d\'entre elles entraînent une modification de la difficulté. Ce chapitre pouvant être un peu compliqué, un résume vous est fourni par le tableau ci-dessous.<br /><br />
								Le perso possède la compétence => Difficulté - 1<br/>
								Le perso possède une/des spécialisation(s) => Difficulté - 1 /spécialisation<br />
								Circonstances spéciales => Difficulté augmentée ou diminuée par le MJ<br />
								Actions simple => Pas de modificateur<br />
								Actions précises => Difficulté augmenté par le MJ<br />
								Actions improvisées => Difficulté + 1<br />
								Actions multiples => Toutes les difficultés + 1 / action supplémentaire<br />
								Contre action => Pas de modificateur<br />
								Action conservée => Difficulté + 1 / point de dégât subit<br />
								<br />
								Attention, une action peut tout à fait être un mélange de plusieurs types d\'actions. Par exemple, une multiple action précise.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateur de Compétence',
								'content' => 'La difficulté doit être diminuée de 1 par le joueur si son personnage possède une compétence adéquate à l\'action qu\'il entreprend.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Etant donné que Salogel possède la compétence "Arc long" (qui est adéquate pour le tir qu\'il veut effectuer), la difficulté sera diminuée de 1. La difficulté sera alors de 6 (7-1).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateur de Spécialisation',
								'content' => 'Une diminution de 1 de la difficulté peut aussi avoir lieu par spécialisation adéquate de l\'action que le personnage utilise.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Sur la feuille de Salogel, on peut lire que celui-ci possède 3 points dans la spécialisation "Tir dans la gorge (arc long)". L\'arme entre parenthèse nous indique que cette spécialisation ne s\'applique pas pour une arbalète par exemple.
On admet qu’il souhaite tirer dans la gorge de son adversaire pour faire plus de dégât.
Etant donné qu\'il possède une spécialisation adéquate, la difficulté passera alors à 5 (6 - 1). Son nombre de dés passera lui à 12 (4 d\'aptitude + 5 de compétence + 3 de spécialisation).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Vous pouvez également posséder plusieurs spécialisations qui sont pertinentes à l\'action que vous entreprenez. Celles-ci se cumulent ainsi que leur diminution de difficulté.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel ne veut plus simplement tirer dans la gorge, mais dans la carotide, car il possède également 2 points dans la spécialisation "Tir dans la carotide (Arc long)".
Dans ce cas, il pourra utiliser sa spécialisation "Tir dans la gorge (Arc long)" ainsi que "Tir dans la carotide (Arc long)", ce qui diminuera la difficulté non pas seulement de 1, mais de 2 étant donné que ces deux spécialisations sont pertinentes pour l\'action désirée. La difficulté passe donc à 4 (6 - 2). L\'ennui est que souvent (et c\'est le cas ici), ce genre de manœuvre entraîne une hausse de la difficulté qui annule ce bonus (nous verrons cela plus tard).
Reste alors au final un plus grand nombre de dés, car les 2 points de "Tir dans la carotide (Arc long)" se cumulent aux autres et donnent un total de 14 dés (12 + 2) pour une action plus complexe (et donc forcément plus intéressante).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Cette manière de procéder pousse les joueurs à être plus précis dans leurs descriptions d\'actions et à plus personnaliser les spécialisations de leurs personnages.
Par contre, une seule aptitude et une seule compétence peuvent être utilisées lors d\'un jet.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Pour plaquer son adversaire au sol une fois celui-ci agrippé. Les sections adaptées pourraient être Dextérité + Bagarre + toutes les spécialisations adéquates.
Mais elles pourraient aussi bien être : Force + Bagarre + ...
Crédible non?
Ou alors : Force + Lutte + ...
Mais jamais un groupe de dés ne pourra être composé de plusieurs aptitudes (genre : Force + Dextérité + ...+ ...) ou de plusieurs compétences (comme : Force + Bagarre + Lutte + ...).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Le choix de l\'aptitude et de la compétence à utiliser peut être imposé par le MJ, mais il est souvent préférable que se soit le joueur qui décide pour tout ce qui touche à son personnage. C\'est donc à lui d\'être en harmonie avec son personnage et avec la manière dont celui-ci entreprendra ses actions.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateur d\'Actions de Circonstance',
								'content' => 'La difficulté peut être modifiée directement par le MJ. Elle peut par exemple être élevée à cause de conditions météorologiques mauvaises, parce que le personnage est affamé, pour des raisons de timidité (rappelez vous le chapitre sur la volonté et le D20), ... Ou alors être diminué, par exemple parce que le personnage connaît bien les lieux, parce que la cible qu\'il veut atteindre est énorme, parce qu\'il est encouragé,... C\'est au MJ de déterminer le degré de l\'influence des circonstances sur les actions jouées aux dés, et donc, de fixer le modificateur de circonstances.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un personnage droitier veut faire un dessin de la main gauche. La difficulté peut alors être élevée de mmmm... 3 par exemple.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Encore un exemple :',
								'content' => 'Un homme, veut faire un discours quelconque, mais il est absorbé par une demoiselle d\'une beauté incroyable (7 point en "Esthétique"). Sur ce, un petit test de volonté, et la difficulté du jet de discours sera augmentée ou non en fonction de celui-ci pour ne pas bredouiller et avoir l\'air ridicule. Les humains ont 12 de volonté, la modification de sa volonté sa volonté sera de... disons 7 (après tout, c\'est l\'esthétique de cette femme qui agît sur l\'orateur). Nous avons donc un test de volonté à difficulté de 19 (12+7). Allez, sur le dé, il obtient 15. Il a donc raté son test de 4 point (19-15). Sa difficulté pourra donc être élevée de 4, ce qui est désagréable, mais il aurait pu avoir une pénalité allant jusqu\'à 7. Le malus n\'aurait pas dépassé l\'esthétique de la dame, c\'est déjà bien assez contraignant comme cela.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Allez, un autre exemple, c\'est la fête des exemples :',
								'content' => 'Un barde entame un chant guerrier lors d\'un combat. Imaginons qu\'il fasse 2 réussites. Ses compagnons auront alors une difficulté diminuée de 2 pour se battre. Cet effet prendra fin lorsque le chanteur s\'arrêtera de pousser la chansonnette.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Et pour les derniers qui ne comprennent jamais rien :',
								'content' => 'Un humain combat seul contre une vingtaine d\'orcs. On imagine donc une situation relativement stressante. Le maître de jeu pourra alors augmenter la difficulté de mmmm, réfléchissons, c\'est une question de psychologie, donc pourquoi pas faire un petit test de volonté. Le facteur de volonté d\'un humain est de 12. Imaginons qu\'il ait fait 9 (il a donc raté de 3). Eh bien voilà! Augmentons-lui sa difficulté de 3 !',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'En résumé, le MJ fait comme il veut, et s\'il ne sait pas trop quoi faire, il peut s\'aider du test de volonté.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions Simples',
								'content' => 'Les actions simples représentent la plupart des actions qui seront effectuées. Elles sont utilisées lorsqu\'une action ne fait partie d\'aucune autre catégorie ou lorsqu\'un personnage effectue une (et une seule) action qu\'il à lui-même décider d\'entreprendre.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un personnage escalade un mur, frappe son adversaire, joue de la flûte, ... Attention, cette liste est non exhaustive.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions Précises et Modificateurs d\'Actions Précises',
								'content' => 'Les actions précises permettent de faire valoir les spécialisations, et la diminution de difficulté qui les accompagne. Mais attention, celles-ci sont souvent cause d’une hausse de la difficulté. Ce qui signifie que dans la plupart des cas, la difficulté ne changera pas, mais que se sera plutôt le nombre de dés qui sera augmenté.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Le principe => L\'application<br />
									Action (difficulté standard ou convenue) => Coup de poing (difficulté convenue = 5)<br />
									Action précise (difficulté + 1) => Coup de poing dans la tête (difficulté = 6)<br />
									Action très précise (difficulté + 2) => Coup de poing dans les dents (difficulté = 7)<br />
									Action très très précise (difficulté + 3) => Coup de poing sur la canine droite(difficulté = 8)',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Puisque Salogel vise maintenant précisément la carotide de son ennemi, la difficulté sera alors augmentée par le MJ. Dans ce cas, elle s\'accroîtra de 3. La difficulté passe donc à 7 (4 + 3).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions Improvisées et Modificateurs d\'Actions Improvisées',
								'content' => 'Les actions improvisées sont toutes celles qui n\'étaient pas prévues sur le moment. Dans ce cas, augmenter la difficulté de 1. Ce modificateur est principalement utilisé dans les combats pour les esquives. Noter aussi que si vous venez à effectuer une action improvisée, vous utiliserez de toute manière l\'aptitude "Réflexe".',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Scrogneugneu l\'orc qui se fait tirer dessus par notre ami Salogel décide d\'essayer d\'esquiver la flèche. Les secteurs qu\'il utilisera seront : Réflexes : 3, Gymnastique : 1, Esquive : 0. Au total 4D10.
La difficulté étant standard (donc 7) sera diminuée de 1, car il possède une compétence adéquate (nous sommes à 6) et augmentée de 1 car c\'est bien là une action improvisée (il est rare que l\'ont soit réellement prêt a recevoir un coup même si, lors d\'un combat cela peut ne pas nous étonner). La difficulté finale sera donc de 7 (7 - 1 + 1).
Attention, une action improvisée ne peut pas être multiple (faut pas pousser mémé dans les orties).
Si vous avez tout compris jusqu\'ici, alors vous possédez le 95% des actions du jeu. Les autres types d\'actions sont utilisés dans des cas spéciaux et leur utilisation est conseillée aux joueurs qui ont déjà un peu d\'expérience.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions Multiples et Modificateurs d\'Actions Multiples',
								'content' => 'Lorsqu\'un personnage souhaite faire plusieurs actions en même temps, il effectue alors une action multiple. La difficulté de toutes ses actions est alors augmentée de 1 par action supplémentaire à celle de base.
',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel qui tire toujours sa flèche, le fait maintenant en courant pour fuir une horde de gobelins. La difficulté de ses deux jets sera augmentée de 1, soit 8 (7 + 1) pour son tir à l\'arc, et 8 pour sa course (standard + 1). Le(s) jets de dés auxiliaire(s) ne sont pas tout le temps nécessaires. Souvent, le maître de jeu se contentera simplement de d\'augmenter la difficulté du/des jet principal/principaux sans réclamer un jet pour des choses ridicules comme marcher, siffler, ou même des choses que tout le monde sait pertinemment que le personnage maîtrise et qu\'il ne ratera pas.
Un problème se pose alors lorsque les actions nécessitent la même aptitude. Il faut alors répartir ses points d\'aptitude dans les diverses actions. La répartition de ces points est libre et au choix du joueur. Pour notre exemple, imaginons qu\'il s\'agisse d\'un sprint (qui utiliserait également la dextérité) et non d\'une course de longue distance (qui utiliserait l\'endurance). Pour son tir Solagel aura donc minimum 10D10 (5 + 3 + 2), et pour sa course, il aura minimum 2D10. Mais il dispose également de ses 4D10 de dextérité qu\'il peut répartir comme il l\'entend. Il pourra donc par exemple obtenir 11D10 pour son tir (avec 1 dé de dextérité) et 5D10 pour s\'enfuir (avec 3 dés de dextérité). Ou alors, il peut décider de mettre tous ses dés de dextérité dans son jet de fuite se qui lui donnerai alors 6D10 (4 + 2) et 10D10 (5 + 3 + 2) pour son tir.
Il vous faut juste garder à l\'esprit que les actions multiples s\'opèrent au même moment. Vous ne pourrez donc pas donner deux coups de la même hache en action multiple, étant donné que les deux coups s\'effectuent l\'un après l\'autre.
Pour les rares cas où vous devrez utiliser la même compétence, voir la même spécialisation, dans des actions différentes (ce qui arrive notamment lorsqu\'un personnage utilise plusieurs armes identiques en même temps mais dans des mains différentes, par exemple les nagas et leurs six bras armés de lames), sachez que vous pouvez les utiliser autant de fois que vous en aurez besoin. Il faut les voir comme de la connaissance, et celle-ci ne diminue pas lorsqu’on entreprend plusieurs choses à la fois. Il n\'y a donc que les aptitudes qui se divisent.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Notez encore qu\'une action multiple peut parfois signifier le fait de faire plusieurs fois la même action en une fois.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un alchimiste aimerait faire une potion (disons que sa difficulté de 6). Il rassemble suffisamment d\'ingrédients pour faire 4 potions et décide de les préparer toutes en une fois. La difficulté est alors augmentée de 1 par potion supplémentaire, ce qui lui donne une difficulté finale de 9 (6 + 3).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Contres Actions',
								'content' => 'Une contre action est le fait de faire des réussites afin de diminuer le nombre de réussites, d’une action que l\'ont souhaite contrer. Ceci s\'utilise surtout dans les combats avec les esquives.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Imaginons que Salogel eu fait 3 réussites dans son jet pour toucher. Scrogneugneu devra alors à son tour faire 3 réussites (ou plus) à son jet d\'esquive pour éviter la flèche. Ce jet d\'esquive sera alors une contre action improvisée, comme c\'est bien souvent le cas lors d\'une esquive. Dans le cas où une contre action obtient plus de réussites que l\'action à contrer, celle-ci ne se transforme bien évidement pas en échec total.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Si Scrogneugneu parvient à faire 4 réussites à son jet d\'esquive, le nombre de réussites du tir de Salogel passe alors à -1 (3 - 4), mais l\'elfe n\'aura pas fait un échec total, car n\'est pas parce que quelqu\'un évite une de vos flèches que vous casserez forcément votre corde.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Actions Conservées et Modificateurs de d\'Actions Conservées',
								'content' => 'Lorsqu\'une action est entreprise, et que pendant que celle-ci s\'opère, le personnage reçoit des points de dégâts, la difficulté de cette même action se voit augmentée du nombre de dégâts reçus.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Scrogneugneu souhaite charger Salogel. Mais malheureusement, alors qu\'il courait dans la direction de son ennemi, celui-ci l’a touché d\'une flèche. Le coup n\'est pas mortel et ne le fait pas s\'évanouir. Il décide donc de continuer dans sa charge et donc de faire une action conservée. Imaginons qu\'il frappe avec un cimeterre (difficulté convenue de 7), qu\'il en possède la compétence (la difficulté passe à 6) et la spécialisation "Charge (cimeterre)" (la difficulté est maintenant de 5).
Disons que la flèche qui l\'a touché lui a fait 4 points de dégâts. La difficulté de sa charge sera alors augmentée à 9 (5 + 4).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Règle du 10 et de la Réussite Critique',
								'content' => 'A chaque fois qu\'un dé vous indique un 10, en plus de le compter parmi les réussites, vous pourrez le relancer et donc avoir une nouvelle chance de faire une réussite ou même un autre 10 qui sera à son tour comptabilisé et relancer. Ce qui veut dire qu\'avec un seul dé, il est théoriquement possible de faire une infinité de réussites, en faisant à chaque fois 10.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Si la difficulté est de 7, que vous possédez 4 dés et que vous obtenez un résultat de 4, 6, 7, 10. Vous avez deux dés qui comptent comme réussite pour l\'action, mais l\'un d\'entre eux étant un 10, vous le relancez et obtenez 10. Vous êtes maintenant à trois réussites. Vous le relancez encore et cette fois le dé indique 7. Vous aurez alors fait quatre réussites. Une réussite critique se dit d\'un jet comportant autant, ou plus, de réussites que de dés lancé à la base.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Règle du 1 et de l\'Echec Critique',
								'content' => 'Chaque 1 obtenu sur un dé annule une réussite, de la plus élevée à la plus petite.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Si vous faîte 5 réussites plus un 1, votre nombre de réussite passe à 4 (5-1). Si vous aviez fait cinq 1, vos réussites auraient été aux nombre de 0 (5-5) et vous auriez échoué dans votre action. Il vous arrivera aussi (et ça, c\'est rigolo) de faire plus de 1 que de réussites. Vous auriez donc un nombre de réussite en négatif. Nous appelons ceci, l\'échec critique.
Dans ce cas, quel que soient le nombre de 1 obtenus, lancer un D100 (un D10 pour la dizaine et un autre pour l\'unité) qui jugera de la gravité de votre échec. Plus le nombre sera élevé, plus votre action sera catastrophique.
On peut imaginez qu\'à 1, vous ratez lamentablement en ayant l\'air bien ridicule, et qu\'à 100, votre erreur devient mortelle.
Attention, les 1 obtenus après la relance des 10 ne sont pas pris en compte.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Augmentation et Adaptation de la Difficulté',
								'content' => 'Il vous faut encore savoir que l\'on ne peut demander un 10 pour réussir une action (étant donné que l\'on a autant de chance de faire un 10 qu\'un 1). Lorsque qu\'une difficulté dépassera 9, le joueur devra alors obtenir un 9 sur un dé, plus encore un autre chiffre sur un autre dé en partant de 5 jusqu\'à 9 et ainsi de suite. Le tableau ci-dessous vous aidera',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Difficulté :',
								'content' => '10 => 95 (le joueur doit obtenir un 9 et un 5)<br />
												11 => 96 (le joueur doit obtenir un 9 et un 6)<br />
												12 => 97 (...)<br />
												13 => 98<br />
												14 => 99<br />
												15 => 995 (le joueur doit obtenir deux 9 et un 5)<br />
												16 => 996<br />
												17 => 997<br />
												18 => 998<br />
												19 => 999<br />
												20 => 9995 (le joueur doit obtenir trois 9 et un 5)<br />
												...',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Ce qui signifie qu\'avec un seul dé et une difficulté de 13, un joueur devra faire d\'abord un 10, qu\'il pourra relancer pour ensuite obtenir un 8 minimum.
Une fois la difficulté obtenue sur les dés, les réussites supplémentaires sont comptabilisées sur chaque 9 ou plus qui viennent s\'y ajouter.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Imaginons un sort demandant une difficulté de 998. Une fois ces trois chiffres obtenus, le sort (ou l\'action) est considéré comme réussi, mais la deuxième réussite sera considéré seulement si le jet possède un 9 supplémentaire, soit 3X9 et 1X8 minimum.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Pour vous aider à fixer la difficulté lors de vos soirées, vous pouvez soit compter vos doigts, soit vous référer au tableau plus haut, ou alors :
Diviser la difficulté par 5. Cela vous donne le nombre de chiffre à obtenir.
Le reste + 5 étant le denier chiffre après les 9.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Chance',
								'content' => 'La chance qu\'un évènement se produise est toujours représentée en pourcentage. Pour que l\'effet en question se manifeste, un nombre égal ou inférieur à ce pourcentage doit être obtenu sur un D100 (un D10 pour la dizaine et un autre pour l\'unité, le 00 représentant le 100). Lorsqu\'un dé de chance est lancé, il faut donc espérer faire un résultat minime.',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Boucliers',
								'content' => 'Les boucliers peuvent vous protéger des coups pour autant que celui-ci se trouve dans la trajectoire de l\'arme de votre adversaire, entre son arme et vous. Pour se retrouver dans cette circonstance, il existe deux méthodes.
Vous pouvez décidez de vous protéger d\'un coup volontairement en faisant un jet de bouclier (Dextérité + Bouclier + ...) comme nous l\'avons vu avant.
Ou alors vous pouvez vous en balancer comme de la dernière pluie, et espérer que les coups de vos adversaires tombent sur votre bouclier par hasard.
Tout le monde m\'accordera que ce "hasard" est proportionnel à la grandeur du bouclier.
Or, chaque boulier possède un pourcentage de chance de vous protéger qui augmente avec la taille de celui-ci.
Le pourcentage des boucliers est répertorié dans la "Table des Protections". Pour vérifier si un coup atterrit dans un bouclier, lancer donc un D100, si vous faite le facteur de votre bouclier ou moins, le coup est dévié.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel qui est maintenant attaqué par Scrogneugneu possède une rondache (c\'est un petit bouclier rond qui s\'accroche au bras). Plutôt occupé par sa fuite, il n\'avait pas vraiment prévu arrêter le coup de son adversaire. Se rendant compte que celui-ci porte un coup effectif (qui touche donc), il jette un dé de chance (on ne va pas non plus le lancer si on n’est pas sur que l\'autre nous touche, il y a bien assez de jet comme cela). La rondache à un pourcentage de chance d\'arrêter un coup de 5%. Salogel obtient un 43... Le coup n\'est donc pas évité.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Résistances',
								'content' => 'Les résistances, que se soit à la magie, au froid ou à l\'alcool se gèrent toutes à l\'aide du dé de chance.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un hobbit (20% de résistance à la magie) doit faire un jet de résistance à la magie pour contrer les effets maléfiques d\'un anneau maudit. Pour ne pas être affecté par la magie, le hobbit devra obtenir un nombre compris entre 1 et 20 en lançant un D100.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Attention toutefois avec la résistance magique qui protège uniquement de la magie directe. C\'est-à- dire un sort qui agit directement sur la cible (comme un contrôle mental, une transformation en grenouille, une illusion, ...) et ne protège en rien de se qui à été crée, transformé ou invoquer magiquement (comme une boule de feu, un enchantement des statues, un sort de lumière, une invocation, divination, ...).
Ce qui signifie que cette résistance peut se révéler être un fardeau lors d\'un sort bénéfique comme les soins, les bénédictions, ...',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Zones Touchées Aléatoirement',
								'content' => 'Lorsqu\'un coup est donné sans précision sur la zone visée, vous pouvez lancer un D100 et vous référer aux «"Tables des touches". Plus le nombre sera élevé, plus la zone touchée sera vitale. Ceux-ci sont de simples tableaux qui aideront le MJ à décider de la zone touchée par le coup en divisant le corps en plusieurs parties et en les numérotant de 1 à 100. Il existe plusieurs tableaux de touches (le tableau de touche général, de touche au corps à corps, ...)',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Scrogneugneu, n\'as pas précisé où il voulait frapper son ennemi au moment où il a jeté les dés. Il ne visait donc pas précisément (ce qui lui assurait une difficulté moindre). Etant donné que son coup a atteint sa cible, il lance D100. Il obtient 95! Aïe. Son cimeterre fini sa course dans la tête de Salogel selon le tableau de touches au corps à corps.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Résolution des dégâts',
								'content' => 'Maintenant que l\'on connaît tout ce qu\'il y a à savoir sur l\'art et la manière d\'effectuer des actions et plus particulièrement de nuire à son prochain, voyons encore la portée des dégâts qu\'il nous est possible de disperser.
Lorsqu\'un coup est effectif, reste encore à savoir si l\'on a juste effleuré son adversaire, ou si celui-ci est transpercé de part en part.
Pour se faire, le personnage ayant touché fait un jet de force (il n\'existe pas vraiment de compétence pour appuyer ses coups), donc les seul dés qui seront lancé seront ceux de la force.
La difficulté sera toujours de 7 moins le nombre de réussites obtenues au toucher, mais n\'oubliez pas qu\'un 1 est toujours un échec.',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Admettons que Scrogneugneu ait touché notre ami Salogel avec 3 réussites. La difficulté de son jet de force sera alors de 4 (7 - 3).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Le nombre de dégâts infligé sera égal au nombre de réussites faites sur le jet de force additionné aux dégâts de l\'arme utilisé.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'L\'orc fait 2 réussites en force, auxquelles on ajoute les 4 dégâts que dispense son cimeterre, nous obtenons que ce pauvre Salogel subit 6 points de dégâts (2 + 4).
Bien évidement, la force n\'agit pas sur des armes telles que l\'arc, l\'arbalète,...
Pour connaître les dégâts occasionnés par les différentes armes, référez-vous à "La Table des Armes". Celle-ci vous indique les dégâts à additionner à la force sous la forme "F + ...".',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Types de dégâts',
								'content' => 'Chaque blessure possède un ou plusieurs Types de Dégât (abrévié TD). Il en existe quatre, ceux-ci sont :<br /><br />
								Perforant (P) => lance, pique, épieux, flèches, ...<br />
								Energétique (E) => feu, froid, acide, lave, ...<br />
								Contendant (C) => pierre, marteau, poing, bâton, ...<br />
								Tranchant (T) => épée, couteau, hache, dague, ...',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Le cimeterre de Scrogneugneu est une arme tranchante, il fera donc des dégâts de type tranchant. T: 4 dans notre cas.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Certaine armes peuvent faire des dégâts dans plusieurs domaines.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'La torche fait des dégâts contendant et énergétique (C: Force + 2, E: 1)',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Tous les types de dégâts sont donnés à la "Table des armes".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateurs de dégâts',
								'content' => 'Les dégâts peuvent être modifiés pour plein de raisons par le MJ ou les personnages. Là encore chaque joueur doit gérer son propre personnage pendant que le MJ se concentre sur tout le reste. Il est conseillé, pour la modification des dégâts, de procéder toujours dans cet ordre :<br /><br />
- Modificateur de circonstance -<br />
- Armures -<br />
- Modificateur de zone de touche -<br />
- Endurance -',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateurs de circonstances',
								'content' => 'Les modificateurs de circonstances s\'appliquent lorsque certaines circonstances sont présentes. Ce petit tableau aide à vous en faire une idée en vous présentant les plus célèbres.<br /><br />
								Circonstances => Conséquence<br />
								Charge (humanoïde) => Dégâts + 1<br />
								Chute (humanoïde) => Dégâts + 2<br />
								Charge (cheval) => Dégâts + 3',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Les 6 points de dégât qu\'a reçu notre pauvre ami Salogel passe à 7 car l\'orc chargeait (6 + 1). Imaginons que Salogel, qui courait pour échapper à des gobelins rappelez vous, le faisait contre Scrogneugneu. C\'est donc également considéré comme une charge et les dégâts passent à 8 (7 + 1) (il y a double charge).
Au final, c\'est au MJ de fixer les modificateurs de dégâts qui s\'appliqueront.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Armures',
								'content' => 'Vous pouvez ensuite diminuer les dégâts reçus grâce à toutes sortes de protections. Celles- ci possèdent des caractéristiques qui sont souvent liées à la matière qui les compose. Ainsi chacune possède un poids (qui constitue bien souvent le gros du pois porter par ceux qui s\'en servent, autrement dit, c\'est très lourd), ainsi qu\'une protection contre les dégâts perforants (P), énergétiques (E), contendants (C) et tranchants
(T). Soit P E C T.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Une casque de fer possède les compétences suivantes : P: 5 E : 4 C: 2 T: 5.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Pour connaître les caractéristiques des protections, référez-vous à la "Table des Protections".',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'En imaginant que Salogel porte un casque en fer. Etant donné que les dégâts sont tranchants et que la protection de son casque à ce niveau est de 5, les 8 points de dégât qu\'il a reçu dans la tête passent donc à 3 (8 - 5). Il est très important de signaler que la diminution des dégâts due aux protections s\'opère avant le modificateur de zone de touche.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Modificateurs de zones de touches',
								'content' => 'Et pour finir, comme certaines parties du corps sont plus sensibles que d\'autres, ce petit tableau est appliqué en règle générale.<br /><br />
								Zones touchée => Modificateur<br />
								Dégât dans la tête => Dégâts doublés<br />
								Dégât dans la gorge => Dégâts doublés, pas d\'endurance possible<br />
								Dégât dans les yeux => Dégâts doublés, pas d\'endurance possible<br />
								Dégât dans parties génitales masculines => Pas d\'endurance possible<br />',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'A tout les malheurs de Salogel, s\'ajoute le fait les dégâts sont doublés dans la tête ce qui les fait passer à 6 (3 x 2)! Eh oui, on fait le malin quand on tire des flèches, mais pour se prendre des citernes il n\'y a plus personne.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Endurer',
								'content' => 'Lorsqu\'un personnage subit des dégâts, celui-ci peut en règle générale les endurer. Pour ce faire, il effectue un simple jet d\'endurance. Là encore il n\'y a pas de compétence existante. Nous lançons donc simplement les dés de l’aptitude : Endurance.
Chaque réussite diminue le nombre de dégât de 1 (celui-ci ne peut évidement pas aller en négatif).
La difficulté sera normalement toujours de 7.',
								'level' => 3);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel qui subit 6 points de dégât et qui possède 2 points d\'endurance devra essayer d\'obtenir le plus de réussites possible avec ses deux pauvres petits dés afin de diminuer ses points de dégâts. Imaginons qu\'il fasse 3 et 10. Il relance le 10 et fait 1. Comme le 1 ne compte pas pour la relance, il a fait 1 seule réussite, ses dégâts passent donc à 5 (6 - 1).',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Réactions suite aux Dégâts',
								'content' => 'Lorsque des dégâts sont effectués, on peut observer moult réactions que nous pouvons mettre sous forme de règles pour le besoin du jeu. Voici les plus utilisées.<br /><br />
								Si, en un coup les dégâts sont de => Réaction<br/>
								Plus de la moitié de la vitalité restante => Evanouissement<br />
								Plus du quart de la vitalité maximum, dans la tête => Evanouissement<br />
								Plus de la moitié de la vitalité de base, dans la tête/gorge => Mort',
								'level' => 1);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Salogel a reçu 6 point de dégâts dans la tête. Etant donné que ses points de vie de base étaient de 15, il reçoit donc plus du quart de sa vitalité de base dans la tête. Notre malheureux elfe s\'évanouira donc. Eh oui, le monde est dangereux et la mort naît bien souvent d\'une perte de connaissance lors de circonstances périlleuses ou de l\'aggravation de blessures.
Il ne reste plus à notre ami qu\'à espérer que ses compagnons lui viendront en aide sans quoi, il est peu probable que ses ennemis retiennent leurs coups.
Il est important de souligner que ces règles ne s\'appliquent que si les dégâts sont fournis dans un seul coup (ou alors plusieurs coups subits exactement au même moment).
La vitalité de base est le nombre de points de vie maximum que le personnage pourrait posséder au début du combat. Autrement dis, si un personnage a augmenté ses points de vitalité, ceux-ci sont considérés.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Malus d\'Affaiblissement',
								'content' => '1 point de malus d\'affaiblissement est distribué pour chaque point de vitalité en moins, lorsque la moitié de celle-ci est perdue (arrondie au supérieur pour ceux qui n\'ont pas un nombre de points de vitalité pair).
Ces malus diminuent de 1 les aptitudes concernées jusqu\'à ce que le personnage ait soigné ses blessures (ce qui peut parfois prendre un moment) ou que le MJ le lui ait accordé.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Ilmig le nain, souhaite secourir Salogel tombé au combat. Dans sa course pour le rejoindre, imaginons qu\'il se reçoive plusieurs petites flèches de gobelin (ce qui n\'arrête pas un nain, un vrai). Sa vitalité de base est de 25. La moitié donnera 12,5 (25 : 2), que nous arrondissons au supérieur pour obtenir 13. Imaginons qu\'il ait reçu au total 15 points de dégât. Ses dégâts dépassent alors la moitié de sa vitalité de 2 (15 - 13). Il aura alors 2 points de malus d\'affaiblissement, qui lui retirent 2 en Force, Dextérité, Endurance, mmmm... allez Réflexes pourquoi pas, disons que c\'est tout pour les aptitudes concernées dans ce cas présent.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Les aptitudes concernées sont celles à qui les circonstances actuelles peuvent nuire.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'La fatigue ou la faim n\'agit en règle générale que sur la force et l\'endurance, peut être la dextérité... alors qu\'une brûlure agit sur toutes les aptitudes (on est tout de suite moins emphatique lorsqu\'on brûle). Dans ce cas, même si après avoir soigné ses blessures, le personnage peut retrouver certaines de ses aptitudes comme la force, il mettra beaucoup plus de temps à retrouver ses points d\'esthétique (il devra par exemple allez chez un magicien qui effacera ses blessures).
Les points d\'aptitude perdus de manière permanente (par exemple, la dextérité pour un bras atrophier) peuvent être remontés à l\'aide des points d\'expérience, même si le nombre de points dans l\'aptitude a atteint 0.
Lorsqu\'un personnage possède plus ou autant de points d\'affaiblissement que d\'endurance (soit que cette aptitude est réduite à 0), le personnage s\'évanouit.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => FALSE,
								'content' => 'Si ses points de force sont réduits à 0 ou qu\'ils deviennent inférieurs à ce qu\'il nécessite pour porter son équipement, il tombe à terre. Si ses points ne sont pas encore à 0 il peut décider de lester du matériel, mais cela lui prendra (comme pour tout) une action à moins qu\'il lâche simplement son arme.',
								'level' => 2);
			array_push($allRulesArray, $ruleArray);

			$ruleArray = array('title' => 'Par exemple :',
								'content' => 'Un personnage avec 4 en endurance et 3 de force reçoit 3 points de malus d\'affaiblissement. Il tombe alors à terre mais reste conscient. Lorsqu\'il passe à 4 points de malus d\'affaiblissement, il perdra connaissance étant donné que son endurance est réduite à 0. Les réactions aux dégâts et plus particulièrement les malus d\'affaiblissement ont pour effet de calmer les joueurs et de les faire réfléchir avant de se lancer tête baissée dans un combat, ce qui ne peut être que bénéfique pour l\'histoire.',
								'level' => 'notice');
			array_push($allRulesArray, $ruleArray);

			return $allRulesArray;
		}
	}
?>
