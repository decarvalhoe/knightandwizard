<?php /* Smarty version Smarty-3.1.14, created on 2024-11-23 09:56:03
         compiled from "../includes/templates/user/update-character-attribute.tpl" */ ?>
<?php /*%%SmartyHeaderCode:19060929795c61b3c394fc35-92728402%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'bdb630096cd5f6c9d53107a5d3727f68d5e34e66' => 
    array (
      0 => '../includes/templates/user/update-character-attribute.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '19060929795c61b3c394fc35-92728402',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c61b3c39e51b4_55941218',
  'variables' => 
  array (
    'attribute' => 0,
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c61b3c39e51b4_55941218')) {function content_5c61b3c39e51b4_55941218($_smarty_tpl) {?><h1>Modification d'attribut du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form">

    <?php if ($_smarty_tpl->tpl_vars['attribute']->value=='strength'){?>
        Force
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='dexterity'){?>
        Dextérité
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='stamina'){?>
        Endurance
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='aestheticism'){?>
        Esthétisme
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='charisma'){?>
        Charisme
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='empathy'){?>
        Empathie
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='intelligence'){?>
        Intelligence
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='perception'){?>
        Perception
    <?php }elseif($_smarty_tpl->tpl_vars['attribute']->value=='reflexes'){?>
        Reflexes
    <?php }?>

    : <input type="number" name="attribute-value" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->{$_smarty_tpl->tpl_vars['attribute']->value};?>
" min="0">

    <br /><br />

    <input type="hidden" name="attribute-name" value="<?php echo $_smarty_tpl->tpl_vars['attribute']->value;?>
">
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="attribute">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>