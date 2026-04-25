<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 16:22:30
         compiled from "../includes/templates/user/update-character-energy-max.tpl" */ ?>
<?php /*%%SmartyHeaderCode:11819355165d8633c5b18e17-92792604%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd598ec5f6e8be4840cc005bc0c3cea0022267e75' => 
    array (
      0 => '../includes/templates/user/update-character-energy-max.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '11819355165d8633c5b18e17-92792604',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5d8633c5b5b649_90894338',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5d8633c5b5b649_90894338')) {function content_5d8633c5b5b649_90894338($_smarty_tpl) {?><h2>Modification de l'énergie</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Energie : <input type="number" name="energy-max-points" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->energyMax;?>
" min="0">

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="energy-max">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>