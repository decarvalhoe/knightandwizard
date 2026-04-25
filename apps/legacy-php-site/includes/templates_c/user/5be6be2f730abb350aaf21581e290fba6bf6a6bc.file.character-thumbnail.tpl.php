<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:38:01
         compiled from "../includes/templates/user/character-thumbnail.tpl" */ ?>
<?php /*%%SmartyHeaderCode:15714376615c6d252c4391b2-64165778%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '5be6be2f730abb350aaf21581e290fba6bf6a6bc' => 
    array (
      0 => '../includes/templates/user/character-thumbnail.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '15714376615c6d252c4391b2-64165778',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6d252c4443e3_05782653',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6d252c4443e3_05782653')) {function content_5c6d252c4443e3_05782653($_smarty_tpl) {?><div class="character-thumbnail">
    <a href="character-detail.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
        <img src="<?php echo $_smarty_tpl->tpl_vars['Character']->value->profilImg;?>
" alt="<?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
" style="width:100%">
    </a>

    <br />

    <a href="character-detail.php?id=<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
</a>
</div>
<?php }} ?>