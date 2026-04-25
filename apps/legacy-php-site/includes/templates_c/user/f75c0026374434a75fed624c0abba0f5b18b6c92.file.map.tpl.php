<?php /* Smarty version Smarty-3.1.14, created on 2025-04-02 17:10:14
         compiled from "../includes/templates/user/map.tpl" */ ?>
<?php /*%%SmartyHeaderCode:13860465415c605a89b5abb5-66002889%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'f75c0026374434a75fed624c0abba0f5b18b6c92' => 
    array (
      0 => '../includes/templates/user/map.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '13860465415c605a89b5abb5-66002889',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605a89b8b1f6_15135934',
  'variables' => 
  array (
    'forumPlacesArray' => 0,
    'place' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605a89b8b1f6_15135934')) {function content_5c605a89b8b1f6_15135934($_smarty_tpl) {?><h1>Choisissez votre destination</h1>

<?php  $_smarty_tpl->tpl_vars['place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['place']->_loop = false;
 $_smarty_tpl->tpl_vars['i'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['forumPlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['place']->key => $_smarty_tpl->tpl_vars['place']->value){
$_smarty_tpl->tpl_vars['place']->_loop = true;
 $_smarty_tpl->tpl_vars['i']->value = $_smarty_tpl->tpl_vars['place']->key;
?>
    <a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['place']->value['id'];?>
">
        <div class="map-place-name">
            <?php echo $_smarty_tpl->tpl_vars['place']->value['name'];?>

        </div>
    </a>

    <br /><br />
<?php } ?>
<?php }} ?>