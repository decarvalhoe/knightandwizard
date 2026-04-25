<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 17:02:18
         compiled from "../includes/templates/user/land-map.tpl" */ ?>
<?php /*%%SmartyHeaderCode:1753467505c605aabea6ea9-46158862%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '1551c9f7f3baadab8c2a2ce579d0c547c0102fce' => 
    array (
      0 => '../includes/templates/user/land-map.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1753467505c605aabea6ea9-46158862',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605aabefec29_10484770',
  'variables' => 
  array (
    'Land' => 0,
    'CitiesAndTownsArray' => 0,
    'Place' => 0,
    'imgFlagPath' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605aabefec29_10484770')) {function content_5c605aabefec29_10484770($_smarty_tpl) {?><h1><?php echo $_smarty_tpl->tpl_vars['Land']->value->name;?>
</h1>

<div class="two-col-left">
    <h2>Villes</h2>

    <?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CitiesAndTownsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Place']->value->status['id']==2){?>
            <a href="city-map.php?id=<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</a><?php if ($_smarty_tpl->tpl_vars['Place']->value->isCapital==1){?> (Capitale)<?php }?>

            <br />
        <?php }?>
    <?php } ?>

    <h2>Montagnes</h2>

    <?php  $_smarty_tpl->tpl_vars['Place'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['Place']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['CitiesAndTownsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['Place']->key => $_smarty_tpl->tpl_vars['Place']->value){
$_smarty_tpl->tpl_vars['Place']->_loop = true;
?>
        <?php if ($_smarty_tpl->tpl_vars['Place']->value->status['id']==5){?>
            <a href="city-map.php?id=<?php echo $_smarty_tpl->tpl_vars['Place']->value->id;?>
"><?php echo $_smarty_tpl->tpl_vars['Place']->value->name;?>
</a><?php if ($_smarty_tpl->tpl_vars['Place']->value->isCapital==1){?> (Capitale)<?php }?>

            <br />
        <?php }?>
    <?php } ?>
</div>

<div class="two-col-right">
    <div class="flag">
        <img class="painting" src="<?php echo $_smarty_tpl->tpl_vars['imgFlagPath']->value;?>
/<?php echo $_smarty_tpl->tpl_vars['Land']->value->id;?>
.jpg" alt="<?php echo $_smarty_tpl->tpl_vars['Land']->value->name;?>
" width="200" height="250">
    </div>
</div>
<?php }} ?>