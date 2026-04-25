<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:17:55
         compiled from "../includes/templates/user/add-character-orientation.tpl" */ ?>
<?php /*%%SmartyHeaderCode:7116172945c6985e160f381-03083827%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e13558fabcef3ce0c556c4557d949f73b17a1b84' => 
    array (
      0 => '../includes/templates/user/add-character-orientation.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7116172945c6985e160f381-03083827',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985e163c3c2_28273465',
  'variables' => 
  array (
    'orientationsArray' => 0,
    'orientation' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985e163c3c2_28273465')) {function content_5c6985e163c3c2_28273465($_smarty_tpl) {?><form action="add-character.php" method="post" class="form">
    <h2>Orientation</h2>

    <select name="orientationId">
        <?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['orientationsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['orientation']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['orientation']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>