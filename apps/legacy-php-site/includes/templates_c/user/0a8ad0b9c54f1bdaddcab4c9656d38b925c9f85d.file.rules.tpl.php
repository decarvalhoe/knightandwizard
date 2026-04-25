<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:51:45
         compiled from "../includes/templates/user/rules.tpl" */ ?>
<?php /*%%SmartyHeaderCode:6481787195c600b823c74a2-05080690%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '0a8ad0b9c54f1bdaddcab4c9656d38b925c9f85d' => 
    array (
      0 => '../includes/templates/user/rules.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6481787195c600b823c74a2-05080690',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c600b8242a148_14562493',
  'variables' => 
  array (
    'contentArray' => 0,
    'content' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c600b8242a148_14562493')) {function content_5c600b8242a148_14562493($_smarty_tpl) {?><h1>Règles</h1>

<?php  $_smarty_tpl->tpl_vars['content'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['content']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['contentArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['content']->key => $_smarty_tpl->tpl_vars['content']->value){
$_smarty_tpl->tpl_vars['content']->_loop = true;
?>
    <?php if ($_smarty_tpl->tpl_vars['content']->value['level']!='notice'){?>
        <h<?php echo $_smarty_tpl->tpl_vars['content']->value['level']+1;?>
>
            <?php echo $_smarty_tpl->tpl_vars['content']->value['title'];?>

        </h<?php echo $_smarty_tpl->tpl_vars['content']->value['level']+1;?>
>
    <?php }else{ ?>
        <span class="rules-notice"><?php echo $_smarty_tpl->tpl_vars['content']->value['title'];?>
</span>
    <?php }?>

    <?php if ($_smarty_tpl->tpl_vars['content']->value['content']!=false){?>

        <?php if ($_smarty_tpl->tpl_vars['content']->value['level']!='notice'){?>
            <p class="p<?php echo $_smarty_tpl->tpl_vars['content']->value['level']+1;?>
">
                <?php echo $_smarty_tpl->tpl_vars['content']->value['content'];?>

            </p>
        <?php }else{ ?>
            <p class="p-notice">
                <?php echo $_smarty_tpl->tpl_vars['content']->value['content'];?>

            </p>
        <?php }?>
    <?php }?>
<?php } ?>
<?php }} ?>