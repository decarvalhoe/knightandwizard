<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:18:01
         compiled from "../includes/templates/user/add-character-class.tpl" */ ?>
<?php /*%%SmartyHeaderCode:11284954365c6985f8215b13-18136902%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '001ad83b7a89bf4283ec89c8c503280ffd6d3a78' => 
    array (
      0 => '../includes/templates/user/add-character-class.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '11284954365c6985f8215b13-18136902',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6985f82515c0_90379631',
  'variables' => 
  array (
    'classesArray' => 0,
    'class' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6985f82515c0_90379631')) {function content_5c6985f82515c0_90379631($_smarty_tpl) {?><form action="add-character.php" method="post" class="form">
    <h2>Classe</h2>

    <select name="classId">
        <?php  $_smarty_tpl->tpl_vars['class'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['class']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['classesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['class']->key => $_smarty_tpl->tpl_vars['class']->value){
$_smarty_tpl->tpl_vars['class']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['class']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />
    
    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>