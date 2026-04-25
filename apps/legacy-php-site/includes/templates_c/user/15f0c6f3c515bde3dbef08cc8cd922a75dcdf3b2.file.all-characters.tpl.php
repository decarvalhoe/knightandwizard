<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:41:40
         compiled from "../includes/templates/user/all-characters.tpl" */ ?>
<?php /*%%SmartyHeaderCode:16619531755c6013393f5ea2-51241450%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '15f0c6f3c515bde3dbef08cc8cd922a75dcdf3b2' => 
    array (
      0 => '../includes/templates/user/all-characters.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '16619531755c6013393f5ea2-51241450',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6013394305a2_87369541',
  'variables' => 
  array (
    'CharactersArray' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6013394305a2_87369541')) {function content_5c6013394305a2_87369541($_smarty_tpl) {?><h1>Tout les personnages</h1>

<div class="characters-container">
    <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CharactersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
?>
        <?php echo $_smarty_tpl->getSubTemplate ('character-thumbnail.tpl', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

    <?php } ?>
</div>
<?php }} ?>