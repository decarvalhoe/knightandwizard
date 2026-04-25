<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 10:31:12
         compiled from "../includes/templates/admin/main-menu.tpl" */ ?>
<?php /*%%SmartyHeaderCode:20698379125a9ae9c6006af5-74452286%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '35480f4c33eecfe14d8c4f7ad6ef8953e71cd7b9' => 
    array (
      0 => '../includes/templates/admin/main-menu.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '20698379125a9ae9c6006af5-74452286',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5a9ae9c6009b45_72030880',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5a9ae9c6009b45_72030880')) {function content_5a9ae9c6009b45_72030880($_smarty_tpl) {?><div id="main-menu">
    <div class="main-menu-element">
        <div class="dropdown">
            <span>Armes</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="weapons-list.php">Liste des armes</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-weapon.php">Ajouter une arme</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Atouts</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="assets-list.php">Liste d'atouts</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="levels-assets-list.php">Atouts de niveaux</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-asset.php">Ajouter un atout</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Classes</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="classes-list.php">Liste des classes</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-class.php">Ajouter une classe</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Compétences</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="skill-list.php">Liste de compétences</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-skill.php">Ajouter une compétence</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Races</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="races-list.php">Liste de races</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-race.php">Ajouter une race</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Sorts</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="spells-list.php">Liste des sorts</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-spell.php">Ajouter un sort</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Potions</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="">Liste des potions</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-potion.php">Ajouter une potion</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <div class="dropdown">
            <span>Lieux</span>

            <div class="dropdown-content">
                <div class="sub-menu-element">
                    <a href="places-list.php">Liste des lieux</a>
                </div>

                <br />

                <div class="sub-menu-element">
                    <a href="add-place.php">Ajouter un lieux</a>
                </div>
            </div>
        </div>
    </div>

    <div class="main-menu-element">
        <a href="update-email.php">E-mail</a>
    </div>
</div>
<?php }} ?>