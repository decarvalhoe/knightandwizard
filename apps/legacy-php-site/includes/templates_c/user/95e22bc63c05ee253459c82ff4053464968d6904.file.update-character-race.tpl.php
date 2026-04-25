<?php /* Smarty version Smarty-3.1.14, created on 2025-08-13 18:09:07
         compiled from "../includes/templates/user/update-character-race.tpl" */ ?>
<?php /*%%SmartyHeaderCode:5344974775d7f6c676bdd15-92843995%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '95e22bc63c05ee253459c82ff4053464968d6904' => 
    array (
      0 => '../includes/templates/user/update-character-race.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '5344974775d7f6c676bdd15-92843995',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5d7f6c676f5994_53871095',
  'variables' => 
  array (
    'racesArray' => 0,
    'race' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5d7f6c676f5994_53871095')) {function content_5d7f6c676f5994_53871095($_smarty_tpl) {?><h1>Modification de la race du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">
    Race :
    <select name="raceId">
        <?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['race']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['race']->value['id'];?>
" <?php if ($_smarty_tpl->tpl_vars['race']->value['id']==$_smarty_tpl->tpl_vars['Character']->value->race['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="race">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>