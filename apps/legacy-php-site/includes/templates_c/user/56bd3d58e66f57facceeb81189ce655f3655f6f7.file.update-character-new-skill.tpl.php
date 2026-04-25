<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:58:30
         compiled from "../includes/templates/user/update-character-new-skill.tpl" */ ?>
<?php /*%%SmartyHeaderCode:21081695145c613a256babe5-15216671%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '56bd3d58e66f57facceeb81189ce655f3655f6f7' => 
    array (
      0 => '../includes/templates/user/update-character-new-skill.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '21081695145c613a256babe5-15216671',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c613a256ff3f0_18908655',
  'variables' => 
  array (
    'skillsArray' => 0,
    'skillsFamilyArray' => 0,
    'skill' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c613a256ff3f0_18908655')) {function content_5c613a256ff3f0_18908655($_smarty_tpl) {?><h2>Nouvelle compétences</h2>

<form action="update-character.php?update=done" method="post" class="form">
    <?php  $_smarty_tpl->tpl_vars['skillsFamilyArray'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skillsFamilyArray']->key => $_smarty_tpl->tpl_vars['skillsFamilyArray']->value){
$_smarty_tpl->tpl_vars['skillsFamilyArray']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skillsFamilyArray']->key;
?>
        <h3><?php echo $_smarty_tpl->tpl_vars['skillsFamilyArray']->value['0']['familyName'];?>
</h3>

        <?php  $_smarty_tpl->tpl_vars['skill'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['skill']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['skillsFamilyArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['skill']->key => $_smarty_tpl->tpl_vars['skill']->value){
$_smarty_tpl->tpl_vars['skill']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['skill']->key;
?>
            <?php if ($_smarty_tpl->tpl_vars['skill']->value['isChildOf']==''){?>
                <div class="add-character-skills-skill">
            <?php }else{ ?>
                <div class="add-character-skills-specialisation">
            <?php }?>
                <?php echo $_smarty_tpl->tpl_vars['skill']->value['name'];?>
 : <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['skill']->value['id'];?>
" value="0" min="0"><br />
            </div>
        <?php } ?>
    <?php } ?>

    <br /><br />

    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="new-skill">
    <input type="submit" value="Terminer" />
</form>
<?php }} ?>