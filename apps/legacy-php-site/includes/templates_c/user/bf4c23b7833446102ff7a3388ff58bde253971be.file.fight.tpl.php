<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:38:17
         compiled from "../includes/templates/user/fight.tpl" */ ?>
<?php /*%%SmartyHeaderCode:17553798935f3b5fc2b56330-54409403%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'bf4c23b7833446102ff7a3388ff58bde253971be' => 
    array (
      0 => '../includes/templates/user/fight.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '17553798935f3b5fc2b56330-54409403',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5f3b5fc2ba6925_27078791',
  'variables' => 
  array (
    'Arena' => 0,
    'MyCharacterArray' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5f3b5fc2ba6925_27078791')) {function content_5f3b5fc2ba6925_27078791($_smarty_tpl) {?><h1><?php echo $_smarty_tpl->tpl_vars['Arena']->value->name;?>
</h1>

<p>
    <?php echo $_smarty_tpl->tpl_vars['Arena']->value->description;?>


    <br />

    Arbitre : <?php echo $_smarty_tpl->tpl_vars['Arena']->value->arbitrator->name;?>

</p>

<h2>Challengers</h2>

<h3>En attente de validation</h3>

<br />

<form action="fight.php?arena-id=<?php echo $_smarty_tpl->tpl_vars['Arena']->value->id;?>
&action=add-challenger" method="post" class="form">
    Inclure un personnage :

    <select name="character-id">
        <?php  $_smarty_tpl->tpl_vars['Character'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Character']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['MyCharacterArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Character']->key => $_smarty_tpl->tpl_vars['Character']->value){
$_smarty_tpl->tpl_vars['Character']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['Character']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Character']->value->name;?>
</option>
        <?php } ?>
    </select>

    <input type="submit" value="Entrez" />
</form>
<?php }} ?>