<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 15:38:35
         compiled from "../includes/templates/admin/add-class.tpl" */ ?>
<?php /*%%SmartyHeaderCode:21415656165b269dd57d2225-95104198%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a5ad441c5a22516d232eee076ebaff7c3c42bc89' => 
    array (
      0 => '../includes/templates/admin/add-class.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '21415656165b269dd57d2225-95104198',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b269dd583a8b8_44447341',
  'variables' => 
  array (
    'orientationsArray' => 0,
    'orientation' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b269dd583a8b8_44447341')) {function content_5b269dd583a8b8_44447341($_smarty_tpl) {?><h1>Ajouter une classe</h1>

<form action="add-class.php" method="post" class="form">
    Orientation :
    <select name="orientation-id">
        <?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['orientationsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['orientation']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />

    Nom : <input type="text" name="name">

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>