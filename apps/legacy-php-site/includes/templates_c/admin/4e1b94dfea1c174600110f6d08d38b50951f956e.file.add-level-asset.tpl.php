<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 17:06:34
         compiled from "../includes/templates/admin/add-level-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:8738284495b60a7fd597bb7-48887718%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '4e1b94dfea1c174600110f6d08d38b50951f956e' => 
    array (
      0 => '../includes/templates/admin/add-level-asset.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '8738284495b60a7fd597bb7-48887718',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b60a7fd63f5d0_72921648',
  'variables' => 
  array (
    'level' => 0,
    'assetsArray' => 0,
    'asset' => 0,
    'racesArray' => 0,
    'race' => 0,
    'orientationsArray' => 0,
    'orientation' => 0,
    'classesArray' => 0,
    'class' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b60a7fd63f5d0_72921648')) {function content_5b60a7fd63f5d0_72921648($_smarty_tpl) {?><h1>Ajouter un atout de niveau <?php echo $_smarty_tpl->tpl_vars['level']->value;?>
</h1>

<form action="add-level-asset.php?level=<?php echo $_smarty_tpl->tpl_vars['level']->value;?>
" method="post" class="form">
    Atout :
    <select name="asset-id">
        <option value="">Aucun</option>

        <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['asset']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    Points : <input type="number" name="points">

    <br /><br />

    Réservé à la race :

    <select name="race-id">
        <option value="">Aucune</option>

        <?php  $_smarty_tpl->tpl_vars['race'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['race']->_loop = false;
 $_smarty_tpl->tpl_vars['k'] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['racesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['race']->key => $_smarty_tpl->tpl_vars['race']->value){
$_smarty_tpl->tpl_vars['race']->_loop = true;
 $_smarty_tpl->tpl_vars['k']->value = $_smarty_tpl->tpl_vars['race']->key;
?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['race']->value['id'];?>
"><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    Réservé à l'orientation :
    <select name="orientation-id">
        <option value="">Aucune</option>

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

    Réservé à la classe :

    <select name="class-id">
        <option value="">Aucune</option>

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

    Condition spéciale :<br />
    <textarea rows="4" cols="50" name="special-condition"></textarea>


    <br /><br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>