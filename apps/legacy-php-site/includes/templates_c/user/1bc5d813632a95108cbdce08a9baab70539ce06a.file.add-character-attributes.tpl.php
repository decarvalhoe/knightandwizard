<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:18:26
         compiled from "../includes/templates/user/add-character-attributes.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14960302205c6985fa9c16c3-21956847%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '1bc5d813632a95108cbdce08a9baab70539ce06a' => 
    array (
      0 => '../includes/templates/user/add-character-attributes.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14960302205c6985fa9c16c3-21956847',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985fa9e3b62_04924755',
  'variables' => 
  array (
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985fa9e3b62_04924755')) {function content_5c6985fa9e3b62_04924755($_smarty_tpl) {?><form action="add-character.php" method="post" class="form">
    <h2>Attributs</h2>

    Force : <input type="number" name="strength" value="0" min="0"><br />
    Dextérité : <input type="number" name="dexterity" value="0" min="0"><br />
    Endurance : <input type="number" name="stamina" value="0" min="0"><br />

    <br />

    Esthétisme : <input type="number" name="aestheticism" value="0" min="0"><br />
    Charisme : <input type="number" name="charisma" value="0" min="0"><br />
    Empathie : <input type="number" name="empathy" value="0" min="0"><br />

    <br />

    Intelligence : <input type="number" name="intelligence" value="0" min="0"><br />
    Perception : <input type="number" name="perception" value="0" min="0"><br />
    Reflexes : <input type="number" name="reflexes" value="0" min="0"><br />

    <br />

    <input type="checkbox" name="random" value="TRUE"> Aléatoire | Niveau : <input type="number" name="level" value="1" min="1">

    <br /><br />

    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>