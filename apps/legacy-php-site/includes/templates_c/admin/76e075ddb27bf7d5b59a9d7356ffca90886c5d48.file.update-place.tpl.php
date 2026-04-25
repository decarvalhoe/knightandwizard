<?php /* Smarty version Smarty-3.1.14, created on 2019-02-07 08:01:14
         compiled from "../includes/templates/admin/update-place.tpl" */ ?>
<?php /*%%SmartyHeaderCode:6130465445c5bd7ba724fd7-10542196%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '76e075ddb27bf7d5b59a9d7356ffca90886c5d48' => 
    array (
      0 => '../includes/templates/admin/update-place.tpl',
      1 => 1549227590,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6130465445c5bd7ba724fd7-10542196',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'placeArray' => 0,
    'placesArray' => 0,
    'place' => 0,
    'placesStatusArray' => 0,
    'status' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c5bd7ba7da105_50830628',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c5bd7ba7da105_50830628')) {function content_5c5bd7ba7da105_50830628($_smarty_tpl) {?><h1>Modifier un lieu</h1>

<form action="update-place.php?id=<?php echo $_smarty_tpl->tpl_vars['placeArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['placeArray']->value['name'];?>
">

    <br /><br />

    Inclus dans:
    <select name="is-child-of">
        <option value="0" <?php if ($_smarty_tpl->tpl_vars['placeArray']->value['isChildOf']==0){?>selected<?php }?>>Aucun</option>

        <?php  $_smarty_tpl->tpl_vars['place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['placesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['place']->key => $_smarty_tpl->tpl_vars['place']->value){
$_smarty_tpl->tpl_vars['place']->_loop = true;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['place']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['placeArray']->value['isChildOf']==$_smarty_tpl->tpl_vars['place']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['place']->value['name'];?>
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
" <?php if ($_smarty_tpl->tpl_vars['placeArray']->value['statusId']==$_smarty_tpl->tpl_vars['status']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['status']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    Capitale :
    <input type="radio" name="is-capital" value="1" <?php if ($_smarty_tpl->tpl_vars['placeArray']->value['isCapital']==1){?>checked<?php }?>> Oui
    &nbsp;
    <input type="radio" name="is-capital" value="0" <?php if ($_smarty_tpl->tpl_vars['placeArray']->value['isCapital']==0){?>checked<?php }?>> Non<br>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>