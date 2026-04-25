<?php /* Smarty version Smarty-3.1.14, created on 2025-07-04 15:37:30
         compiled from "../includes/templates/admin/classes-list.tpl" */ ?>
<?php /*%%SmartyHeaderCode:3531640115b269dd76c41f8-73406400%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '5973a829de5ee26f128c1a3d6f90baca46dbdd9e' => 
    array (
      0 => '../includes/templates/admin/classes-list.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '3531640115b269dd76c41f8-73406400',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b269dd76f3779_13979547',
  'variables' => 
  array (
    'classesArray' => 0,
    'orientation' => 0,
    'class' => 0,
    'primarySkill' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b269dd76f3779_13979547')) {function content_5b269dd76f3779_13979547($_smarty_tpl) {?><h2>Liste des classes</h2>

<?php  $_smarty_tpl->tpl_vars['orientation'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['orientation']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['classesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['orientation']->key => $_smarty_tpl->tpl_vars['orientation']->value){
$_smarty_tpl->tpl_vars['orientation']->_loop = true;
?>
    <h3><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
</h3>

    <table>
    	<thead>
    		<tr>
    			<td>Nom</td>
    			<td>Atout</td>
    			<td>Compétence primaire</td>
    		</tr>
    	</thead>

    	<?php  $_smarty_tpl->tpl_vars['class'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['class']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['orientation']->value['classes']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['class']->key => $_smarty_tpl->tpl_vars['class']->value){
$_smarty_tpl->tpl_vars['class']->_loop = true;
?>
    		<tr>
    			<td><?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
 <a href="update-class.php?id=<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
" class="update-link">modifier</a></td>
    			<td><?php echo $_smarty_tpl->tpl_vars['class']->value['asset']['name'];?>
 <a href="update-class-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
" class="update-link">modifier</a></td>
                <td>
                    <?php  $_smarty_tpl->tpl_vars['primarySkill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['primarySkill']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['class']->value['primarySkillsArray']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['primarySkill']->key => $_smarty_tpl->tpl_vars['primarySkill']->value){
$_smarty_tpl->tpl_vars['primarySkill']->_loop = true;
?>
                        <?php echo $_smarty_tpl->tpl_vars['primarySkill']->value['name'];?>
 
                    <?php } ?>

                    <a href="update-class-primary-skills.php?id=<?php echo $_smarty_tpl->tpl_vars['class']->value['id'];?>
" class="update-link">
                        modifier
                    </a>
                </td>
    		</tr>
    	<?php } ?>
    </table>
<?php } ?>
<?php }} ?>