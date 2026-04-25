<?php /* Smarty version Smarty-3.1.14, created on 2018-07-04 21:16:42
         compiled from "../includes/templates/admin/update-race.tpl" */ ?>
<?php /*%%SmartyHeaderCode:14569249375b2ffce20ca7c6-97242925%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'ec515eeb568ddd3dff814df262eb1332e6b03382' => 
    array (
      0 => '../includes/templates/admin/update-race.tpl',
      1 => 1530730791,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '14569249375b2ffce20ca7c6-97242925',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5b2ffce2116475_75300689',
  'variables' => 
  array (
    'raceArray' => 0,
    'assetsArray' => 0,
    'asset' => 0,
    'raceAsset' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5b2ffce2116475_75300689')) {function content_5b2ffce2116475_75300689($_smarty_tpl) {?><h1>Modifier une race</h1>

<form action="update-race.php?id=<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['id'];?>
" method="post" class="form">
    Nom : <input type="text" name="name" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['name'];?>
"><br />

    <br />

    Catégorie : <input type="number" name="category" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['category'];?>
" min="0"><br />

    <br />

    Vitalité : <input type="number" name="vitality" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['vitality'];?>
" min="0"><br />

    <br />

    F. Vitesse : <input type="number" name="speedFactor" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['speedFactor'];?>
" min="0"><br />

    F. Volonté : <input type="number" name="willFactor" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['willFactor'];?>
" min="0"><br />

    <br />

    <h3>Limites physiques</h3>

    Force : <input type="number" name="strengthMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['strengthMax'];?>
" min="0"><br />

    Dextérité : <input type="number" name="dexterityMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['dexterityMax'];?>
" min="0"><br />

    Endurance : <input type="number" name="staminaMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['staminaMax'];?>
" min="0"><br />

    Charisme : <input type="number" name="charismaMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['charismaMax'];?>
" min="0"><br />

    Esthétisme : <input type="number" name="aestheticismMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['aestheticismMax'];?>
" min="0"><br />

    Empathie : <input type="number" name="empathyMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['empathyMax'];?>
" min="0"><br />

    Intelligence : <input type="number" name="intelligenceMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['intelligenceMax'];?>
" min="0"><br />

    Perception : <input type="number" name="perceptionMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['perceptionMax'];?>
" min="0"><br />

    Reflexes : <input type="number" name="reflexesMax" value="<?php echo $_smarty_tpl->tpl_vars['raceArray']->value['reflexesMax'];?>
" min="0"><br />

    <h3>Atouts</h3>

    <?php  $_smarty_tpl->tpl_vars['asset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['asset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['assetsArray']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['asset']->key => $_smarty_tpl->tpl_vars['asset']->value){
$_smarty_tpl->tpl_vars['asset']->_loop = true;
?>
        <?php echo $_smarty_tpl->tpl_vars['asset']->value['name'];?>


        <input type="checkbox" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
"
            <?php  $_smarty_tpl->tpl_vars['raceAsset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['raceAsset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['raceArray']->value['assets']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['raceAsset']->key => $_smarty_tpl->tpl_vars['raceAsset']->value){
$_smarty_tpl->tpl_vars['raceAsset']->_loop = true;
?>
                <?php if ($_smarty_tpl->tpl_vars['raceAsset']->value['id']==$_smarty_tpl->tpl_vars['asset']->value['id']){?>checked<?php }?>
            <?php } ?>
        >

        <?php if ($_smarty_tpl->tpl_vars['asset']->value['unitId']==2){?>
            <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" min="0"

            <?php  $_smarty_tpl->tpl_vars['raceAsset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['raceAsset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['raceArray']->value['assets']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['raceAsset']->key => $_smarty_tpl->tpl_vars['raceAsset']->value){
$_smarty_tpl->tpl_vars['raceAsset']->_loop = true;
?>
                <?php if ($_smarty_tpl->tpl_vars['raceAsset']->value['id']==$_smarty_tpl->tpl_vars['asset']->value['id']){?>value="<?php echo $_smarty_tpl->tpl_vars['raceAsset']->value['points'];?>
"<?php }?>
            <?php } ?>

             > points
        <?php }elseif($_smarty_tpl->tpl_vars['asset']->value['unitId']==3){?>
            <input type="number" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" min="0"

            <?php  $_smarty_tpl->tpl_vars['raceAsset'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['raceAsset']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['raceArray']->value['assets']; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['raceAsset']->key => $_smarty_tpl->tpl_vars['raceAsset']->value){
$_smarty_tpl->tpl_vars['raceAsset']->_loop = true;
?>
                <?php if ($_smarty_tpl->tpl_vars['raceAsset']->value['id']==$_smarty_tpl->tpl_vars['asset']->value['id']){?>value="<?php echo $_smarty_tpl->tpl_vars['raceAsset']->value['points'];?>
"<?php }?>
            <?php } ?>

            > %
        <?php }else{ ?>
            <input type="hidden" name="<?php echo $_smarty_tpl->tpl_vars['asset']->value['id'];?>
-points" value="NULL">
        <?php }?>

        <br />
    <?php } ?>

    <br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>