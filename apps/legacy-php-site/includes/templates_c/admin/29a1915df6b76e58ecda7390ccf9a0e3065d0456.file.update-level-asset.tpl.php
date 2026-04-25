<?php /* Smarty version Smarty-3.1.14, created on 2024-11-17 17:07:57
         compiled from "../includes/templates/admin/update-level-asset.tpl" */ ?>
<?php /*%%SmartyHeaderCode:1189828735c3e3108ba93f4-37601261%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '29a1915df6b76e58ecda7390ccf9a0e3065d0456' => 
    array (
      0 => '../includes/templates/admin/update-level-asset.tpl',
      1 => 1730646206,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1189828735c3e3108ba93f4-37601261',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c3e3108c11468_10502801',
  'variables' => 
  array (
    'assetMergeLevelArray' => 0,
    'assetArray' => 0,
    'k' => 0,
    'levelMax' => 0,
    'racesArray' => 0,
    'race' => 0,
    'orientationsArray' => 0,
    'orientation' => 0,
    'classesArray' => 0,
    'class' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c3e3108c11468_10502801')) {function content_5c3e3108c11468_10502801($_smarty_tpl) {?><h1>Modifier un atout de niveau</h1>

<form action="update-level-asset.php?id=<?php echo $_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['id'];?>
" method="post" class="form">
    <p>
        <b>Nom :</b>
        <br />
        <?php echo $_smarty_tpl->tpl_vars['assetArray']->value['name'];?>

    </p>

    <p>
        <b>Effet :</b>
        <br />
        <?php echo $_smarty_tpl->tpl_vars['assetArray']->value['effect'];?>

    </p>

    <p>
        <b>Activation :</b>
        <br />
        <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['activation']==0){?>
            Permanent
        <?php }else{ ?>
            Ephémère
        <?php }?>
    </p>

    <p>
        <b>Unité :</b>
        <br />
        <?php if ($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==1){?>
            Aucune
        <?php }elseif($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==2){?>
            Point
        <?php }elseif($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==3){?>
            %
        <?php }elseif($_smarty_tpl->tpl_vars['assetArray']->value['unitId']==4){?>
            Niveau
        <?php }?>
    </p>

    <p>
        <b>Valeur : </b>
        <br />
        <?php echo $_smarty_tpl->tpl_vars['assetArray']->value['value'];?>

    </p>

    Niveau :


    <select name="level">
        <?php $_smarty_tpl->tpl_vars['k'] = new Smarty_variable(1, null, 0);?>

        <?php while ($_smarty_tpl->tpl_vars['k']->value++<$_smarty_tpl->tpl_vars['levelMax']->value){?>
            <option value="<?php echo $_smarty_tpl->tpl_vars['k']->value;?>
" <?php if ($_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['level']==$_smarty_tpl->tpl_vars['k']->value){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['k']->value;?>
</option>
        <?php }?>
    </select>

    <br /><br />

    Points : <input type="number" name="points" value="<?php echo $_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['points'];?>
">

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
" <?php if ($_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['raceId']==$_smarty_tpl->tpl_vars['race']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['race']->value['name'];?>
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
" <?php if ($_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['orientationId']==$_smarty_tpl->tpl_vars['orientation']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['orientation']->value['name'];?>
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
" <?php if ($_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['classId']==$_smarty_tpl->tpl_vars['class']->value['id']){?>selected<?php }?>><?php echo $_smarty_tpl->tpl_vars['class']->value['name'];?>
</option>
        <?php } ?>
    </select>

    <br /><br />

    Condition spéciale :<br />
    <textarea rows="4" cols="50" name="special-condition"><?php echo $_smarty_tpl->tpl_vars['assetMergeLevelArray']->value['specialCondition'];?>
</textarea>

    <br /><br />

    <input type="hidden" name="update" value="done">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>