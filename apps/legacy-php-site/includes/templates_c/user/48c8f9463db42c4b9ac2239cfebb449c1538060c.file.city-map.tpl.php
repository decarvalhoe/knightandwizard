<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:28:02
         compiled from "../includes/templates/user/city-map.tpl" */ ?>
<?php /*%%SmartyHeaderCode:19932643255c605aae514e51-93517978%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '48c8f9463db42c4b9ac2239cfebb449c1538060c' => 
    array (
      0 => '../includes/templates/user/city-map.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '19932643255c605aae514e51-93517978',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605aae547cd4_61414780',
  'variables' => 
  array (
    'City' => 0,
    'PlacesArray' => 0,
    'Place' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605aae547cd4_61414780')) {function content_5c605aae547cd4_61414780($_smarty_tpl) {?><h1><?php echo $_smarty_tpl->tpl_vars['City']->value->name;?>
</h1>

<h2>Lieux</h2>

<?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['PlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
?>
    <a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</a><?php if ($_smarty_tpl->tpl_vars['Place']->value->isCapital==1){?> (Capitale)<?php }?>

    <br />
<?php } ?>
<?php }} ?>