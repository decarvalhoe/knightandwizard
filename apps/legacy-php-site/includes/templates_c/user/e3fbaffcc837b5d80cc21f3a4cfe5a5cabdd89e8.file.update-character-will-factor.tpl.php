<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 15:15:09
         compiled from "../includes/templates/user/update-character-will-factor.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8174499815c626e54d79545-94611414%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e3fbaffcc837b5d80cc21f3a4cfe5a5cabdd89e8' => 
    array (
      0 => '../includes/templates/user/update-character-will-factor.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8174499815c626e54d79545-94611414',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c626e54da1507_71162760',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c626e54da1507_71162760')) {function content_5c626e54da1507_71162760($_smarty_tpl) {?><h2>Modification du facteur de volonté</h2>

<form action="update-character.php?update=done" method="post" class="form">
    Facteur de volonté : <input type="number" name="will-factor-points" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->willFactor;?>
" min="1">

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="will-factor">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>