<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:14:35
         compiled from "../includes/templates/user/update-character-name.tpl" */ ?>
<?php /*%%SmartyHeaderCode:18821127045ca100a6b163e3-46284783%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'abcf06f83a183593fba074e38df4037512f9f3ad' => 
    array (
      0 => '../includes/templates/user/update-character-name.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18821127045ca100a6b163e3-46284783',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5ca100a6b7da49_52005025',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5ca100a6b7da49_52005025')) {function content_5ca100a6b7da49_52005025($_smarty_tpl) {?><h1>Modification le nom du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Nom <input type="text" name="newName" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
">

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="name">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>