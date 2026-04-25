<?php /* Smarty version Smarty-3.1.14, created on 2024-11-09 19:18:47
         compiled from "../includes/templates/user/add-character-skills.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14462923245c69862326d529-53282647%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a4b6934b740a1a959cc27e9faba494171a850719' => 
    array (
      0 => '../includes/templates/user/add-character-skills.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14462923245c69862326d529-53282647',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6986232cff18_14204152',
  'variables' => 
  array (
    'skillsArray' => 0,
    'skillsFamilyArray' => 0,
    'skill' => 0,
    'level' => 0,
    'step' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6986232cff18_14204152')) {function content_5c6986232cff18_14204152($_smarty_tpl) {?><h2>Compétences</h2>

<form action="add-character.php" method="post" class="form">
    <?php  $_smarty_tpl->tpl_vars['skillsFamilyArray'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skillsFamilyArray']->key => $_smarty_tpl->tpl_vars['skillsFamilyArray']->value){
$_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skillsFamilyArray']->key;
?>
        <h3><?php echo $_smarty_tpl->tpl_vars['skillsFamilyArray']->value['0']['familyName'];?>
</h3>

        <table>
        	<thead>
        		<tr>
        			<td>Prim.</td>
        			<td>Compétence</td>
        			<td>Points</td>
        		</tr>
        	</thead>

        	<?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsFamilyArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skill']->key;
?>
        		<tr>
        			<td>
                        <?php if ($_smarty_tpl->tpl_vars['skill']->value['isChildOf']=='0'){?>
                            <input type="radio" name="mainSkill" value="<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
"/>
                        <?php }?>
                    </td>

        			<td>
                        <?php if ($_smarty_tpl->tpl_vars['skill']->value['isChildOf']==''){?>
                            <div class="add-character-skills-skill">
                        <?php }else{ ?>
                            <div class="add-character-skills-specialisation">
                        <?php }?>
                            <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>

                        </div>
                    </td>

        			<td>
                        <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
" value="0" min="0">
                    </td>
        		</tr>
        	<?php } ?>
        </table>
    <?php } ?>

    <br />

    <input type="checkbox" name="random" value="TRUE"> Aléatoire | Niveau : <input type="number" name="level" value="<?php echo $_smarty_tpl->tpl_vars['level']->value;?>
" min="1">

    <br /><br />

    <input type="hidden" name="step" value="<?php echo $_smarty_tpl->tpl_vars['step']->value;?>
">
    <input type="submit" value="Suivant" />
</form>
<?php }} ?>