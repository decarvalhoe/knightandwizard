<?php /* Smarty version Smarty-3.1.14, created on 2020-05-26 20:15:07
         compiled from "../includes/templates/admin/add-place.tpl" */ ?>
<?php /*%%SmartyHeaderCode:18428691465c6000fa488959-70755264%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c2f4d6713de0555085fb189f9619ac065f8d64ce' => 
    array (
      0 => '../includes/templates/admin/add-place.tpl',
      1 => 1590516468,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '18428691465c6000fa488959-70755264',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6000fa4c5277_90515873',
  'variables' => 
  array (
    'PlacesArray' => 0,
    'Place' => 0,
    'placesStatusArray' => 0,
    'status' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6000fa4c5277_90515873')) {function content_5c6000fa4c5277_90515873($_smarty_tpl) {?><h1>Ajouter un lieu</h1>

<form action="add-place.php" method="post" class="form">
    Nom : <input type="text" name="name">

    <br /><br />

    Contenu dans :
    <select name="place-id">s
        <?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['PlacesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
 - <?php echo $_smarty_tpl->tpl_vars['Place']->value->status['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    Status:
    <select name="status-id">
        <?php  $_smarty_tpl->tpl_vars['status'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['status']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['placesStatusArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['status']->key => $_smarty_tpl->tpl_vars['status']->value){
$_smarty_tpl->tpl_vars['status']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['status']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['status']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    <input type="checkbox" name="is-capital" value="1"> est une capitale

    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>