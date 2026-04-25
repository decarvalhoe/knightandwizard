<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 18:10:39
         compiled from "../includes/templates/user/main-menu.tpl" */ ?>
<?php /*%%SmartyHeaderCode:16237445665c6008c411deb2-49039351%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '36fab1785c1449a9686ab21d5a2fe646cd6bdfc6' => 
    array (
      0 => '../includes/templates/user/main-menu.tpl',
      1 => 1730653833,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '16237445665c6008c411deb2-49039351',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6008c4124f00_55380856',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6008c4124f00_55380856')) {function content_5c6008c4124f00_55380856($_smarty_tpl) {?><div id="main-menu">
    <div class="main-menu-element">
        <a href="index.php">Accueil</a>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Documents</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="weapons-list.php">Armes</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="assets-list.php">Atouts</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="races-list.php">Bestiaire</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="download.php">Cartes</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="classes-list.php">Classes</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="skills-list.php">Compétences</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="spells-list.php">Grand Grimoire</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="potions-list.php">Potions</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="rules.php">Règles</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Aide de soirée</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="dice-roller.php">Lanceur de d&egrave;s</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="fight-assistant.php">Assistant de combat</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Personnages</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="characters.php">Mes personnages</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="all-characters.php">Tout les personnages</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Forum</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="world-map.php">Carte du monde</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="map.php">Tout les lieux</a>
                </div>
            </div>
        </div>
    </div>

<!--
    <div class="main-menu-element">
        <a href="fight.php?arena-id=1">Combat</a>
    </div>
-->    

    <div class="main-menu-element">
        <a href="my-account.php">Mon compte</a>
    </div>
</div>
<?php }} ?>