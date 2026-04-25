<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 15:13:37
         compiled from "../includes/templates/user/update-character-vitality-max.tpl" */ ?>
<?php /*%%SmartyHeaderCode:18274452685c626e60ae5145-07759923%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a2da464e684e34ba7bfc39ead8ecf59bf4858070' => 
    array (
      0 => '../includes/templates/user/update-character-vitality-max.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18274452685c626e60ae5145-07759923',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c626e60b12537_52776633',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c626e60b12537_52776633')) {function content_5c626e60b12537_52776633($_smarty_tpl) {?><h2>Modification de la vitalité</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Vitalité : <input type="number" name="vitality-max-points" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->vitalityMax;?>
" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="vitality-max">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>