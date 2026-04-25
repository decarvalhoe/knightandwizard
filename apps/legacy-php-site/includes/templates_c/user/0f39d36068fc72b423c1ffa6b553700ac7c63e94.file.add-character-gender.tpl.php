<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:17:45
         compiled from "../includes/templates/user/add-character-gender.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14448671515c6985d2800104-35497912%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '0f39d36068fc72b423c1ffa6b553700ac7c63e94' => 
    array (
      0 => '../includes/templates/user/add-character-gender.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14448671515c6985d2800104-35497912',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985d28111b8_59309848',
  'variables' => 
  array (
    'gendersArray' => 0,
    'gender' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985d28111b8_59309848')) {function content_5c6985d28111b8_59309848($_smarty_tpl) {?><form action="add-character.php" method="post" class="form">
    <h2>Genre</h2>

    <select name="genderId">
        <?php  $_smarty_tpl->tpl_vars['gender'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['gender']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['gendersArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['gender']->key => $_smarty_tpl->tpl_vars['gender']->value){
$_smarty_tpl->tpl_vars['gender']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['gender']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['gender']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['gender']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>