<?php /* Smarty version Smarty-3.1.14, created on 2024-11-24 04:03:25
         compiled from "../includes/templates/user/dices-result.tpl" */ ?>
<?php /*%%SmartyHeaderCode:17351648395c600b16a25635-42825813%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '92c55f0e96ef559a7e3c9022da3a5024353ea44d' => 
    array (
      0 => '../includes/templates/user/dices-result.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '17351648395c600b16a25635-42825813',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c600b16a6fb98_81162829',
  'variables' => 
  array (
    'diceType' => 0,
    'numberOfD10' => 0,
    'numberOfD20' => 0,
    'difficultyD10' => 0,
    'difficultyD20' => 0,
    'dicesArray' => 0,
    'dice' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c600b16a6fb98_81162829')) {function content_5c600b16a6fb98_81162829($_smarty_tpl) {?><div id="roll-info">
    <strong><?php echo $_smarty_tpl->tpl_vars['diceType']->value;?>
</strong><br />
    Nombre de d&eacute;s :

    <?php if ($_smarty_tpl->tpl_vars['diceType']->value=='d10'){?>
        <?php echo $_smarty_tpl->tpl_vars['numberOfD10']->value;?>

    <?php }elseif($_smarty_tpl->tpl_vars['diceType']->value=='d20'){?>
        <?php echo $_smarty_tpl->tpl_vars['numberOfD20']->value;?>

    <?php }?>

    <br />

    Difficult&eacute; :

    <?php if ($_smarty_tpl->tpl_vars['diceType']->value=='d10'){?>
        <?php echo $_smarty_tpl->tpl_vars['difficultyD10']->value;?>

    <?php }elseif($_smarty_tpl->tpl_vars['diceType']->value=='d20'){?>
        <?php echo $_smarty_tpl->tpl_vars['difficultyD20']->value;?>

    <?php }?>

    <br />

    Nombre de r&eacute;ussites : <?php echo $_smarty_tpl->tpl_vars['dicesArray']->value[0]['nbrOfSuccess'];?>

</div>

<br />

<div id="dices-result">
    <?php  $_smarty_tpl->tpl_vars['dice'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['dice']->_loop = false;
 $_smarty_tpl->tpl_vars[1] = new Smarty_Variable;
 $_from = $_smarty_tpl->tpl_vars['dicesArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['dice']->key => $_smarty_tpl->tpl_vars['dice']->value){
$_smarty_tpl->tpl_vars['dice']->_loop = true;
 $_smarty_tpl->tpl_vars[1]->value = $_smarty_tpl->tpl_vars['dice']->key;
?>
        <?php if ($_smarty_tpl->tpl_vars['dice']->value['success']=='NO'){?>
            <div class="dice">
        <?php }elseif($_smarty_tpl->tpl_vars['dice']->value['success']=='YES'){?>
            <div class="dice-success">
        <?php }elseif($_smarty_tpl->tpl_vars['dice']->value['success']=='CRITICAL'){?>
            <div class="dice-critical">
        <?php }elseif($_smarty_tpl->tpl_vars['dice']->value['success']=='FAIL'){?>
            <div class="dice-fail">
        <?php }elseif($_smarty_tpl->tpl_vars['dice']->value['success']=='LAST_DICE'){?>
            <div class="last-dice">
        <?php }?>
            <?php echo $_smarty_tpl->tpl_vars['dice']->value['value'];?>

        </div>
    <?php } ?>
</div>
<?php }} ?>