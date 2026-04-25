<?php /* Smarty version Smarty-3.1.14, created on 2019-01-17 08:49:16
         compiled from "../includes/templates/admin/add-race.tpl" */ ?>
<?php /*%%SmartyHeaderCode:12655349015b37cac8ef5949-96217834%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '426375f205c33bed9bd3901e2fe829d513f8c84a' => 
    array (
      0 => '../includes/templates/admin/add-race.tpl',
      1 => 1538508576,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '12655349015b37cac8ef5949-96217834',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b37cac9007297_31692854',
  'variables' => 
  array (
    'assetsArray' => 0,
    'asset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b37cac9007297_31692854')) {function content_5b37cac9007297_31692854($_smarty_tpl) {?><h1>Ajouter une race</h1>

<form action="add-race.php" method="post" class="form">
    Nom : <input type="text" name="name"><br />

    <br />

    Catégorie : <input type="number" name="category" min="0"><br />

    <br />

    Vitalité : <input type="number" name="vitality" min="0"><br />

    <br />

    F. Vitesse : <input type="number" name="speedFactor" min="0"><br />

    F. Volonté : <input type="number" name="willFactor" min="0"><br />

    <br />

    <h3>Limites physiques</h3>

    Force : <input type="number" name="strengthMax" min="0"><br />

    Dextérité : <input type="number" name="dexterityMax" min="0"><br />

    Endurance : <input type="number" name="staminaMax" min="0"><br />

    <br />

    Charisme : <input type="number" name="charismaMax" min="0"><br />

    Esthétisme : <input type="number" name="aestheticismMax" min="0"><br />

    Empathie : <input type="number" name="empathyMax" min="0"><br />

    <br />

    Intelligence : <input type="number" name="intelligenceMax" min="0"><br />

    Perception : <input type="number" name="perceptionMax" min="0"><br />

    Reflexes : <input type="number" name="reflexesMax" min="0"><br />

    <h3>Atouts</h3>

    <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
        <?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>


        <input type="checkbox" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
">

        <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==2){?>
            <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" min="0"> points
        <?php }elseif($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
            <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" min="0"> %
        <?php }else{ ?>
            <input type="hidden" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" value="0">
        <?php }?>

        <br />
    <?php } ?>

    <br />

    <input type="hidden" name="filledField" value="TRUE">
    <input type="submit" value="Ajouter" />
</form>
<?php }} ?>