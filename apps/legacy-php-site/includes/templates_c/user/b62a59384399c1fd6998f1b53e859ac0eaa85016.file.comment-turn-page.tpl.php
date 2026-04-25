<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 15:28:23
         compiled from "../includes/templates/user/comment-turn-page.tpl" */ ?>
<?php /*%%SmartyHeaderCode:15113289345c605a99060dc9-44529658%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b62a59384399c1fd6998f1b53e859ac0eaa85016' => 
    array (
      0 => '../includes/templates/user/comment-turn-page.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '15113289345c605a99060dc9-44529658',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605a9906f420_64321842',
  'variables' => 
  array (
    'i' => 0,
    'nbrOfPages' => 0,
    'placeId' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605a9906f420_64321842')) {function content_5c605a9906f420_64321842($_smarty_tpl) {?><div id="play-turn-page">
    Page :

    <?php while ($_smarty_tpl->tpl_vars['i']->value<=$_smarty_tpl->tpl_vars['nbrOfPages']->value){?>
      <a href="play.php?place-id=<?php echo $_smarty_tpl->tpl_vars['placeId']->value;?>
&page=<?php echo $_smarty_tpl->tpl_vars['i']->value;?>
">
          <?php echo $_smarty_tpl->tpl_vars['i']->value++;?>

      </a>
    <?php }?>
</div>
<?php }} ?>