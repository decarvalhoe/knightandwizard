<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:37:56
         compiled from "../includes/templates/user/world-map.tpl" */ ?>
<?php /*%%SmartyHeaderCode:6582984735c605aaa3a91e9-07722966%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '6f42886d4f3c84ef3e20edfda099ae2a017f118f' => 
    array (
      0 => '../includes/templates/user/world-map.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6582984735c605aaa3a91e9-07722966',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c605aaa3d2491_33086261',
  'variables' => 
  array (
    'imgPlacePath' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c605aaa3d2491_33086261')) {function content_5c605aaa3d2491_33086261($_smarty_tpl) {?><h1>Carte du monde</h1>

<div id="world-map">
    <img src="<?php echo $_smarty_tpl->tpl_vars['imgPlacePath']->value;?>
map-world.jpg" alt="Carte du monde">

    <div class="map-icon-container" style="position: relative;">
        <a href="land-map.php?id=9" style="position: absolute; top: -460px; left: 542px;">
            <div class="map-icon" style="background-image:url('../img/flags/flag-alteria-mini.jpg');"></div>
        </a>
    </div>

    <div class="map-icon-container" style="position: relative;">
        <a href="land-map.php?id=8" style="position: absolute; top: -320px; left: 378px;">
            <div class="map-icon" style="background-image:url('../img/flags/flag-cortega-mini.jpg');"></div>
        </a>
    </div>

    <div class="map-icon-container" style="position: relative;">
        <a href="land-map.php?id=13" style="position: absolute; top: -404px; left: 738px;">
            <div class="map-icon" style="background-image:url('../img/flags/flag-irtanie-mini.jpg');"></div>
        </a>
    </div>

    <div class="map-icon-container" style="position: relative;">
        <a href="land-map.php?id=21" style="position: absolute; top: -446px; left: 394px;">
            <div class="map-icon" style="background-image:url('../img/flags/flag-fauche-le-vent-mini.jpg');"></div>
        </a>
    </div>

    <div class="map-icon-container" style="position: relative;">
        <a href="land-map.php?id=24" style="position: absolute; top: -380px; left: 457px;">
            <div class="map-icon" style="background-image:url('../img/flags/flag-portes-azrak-mini.jpg');"></div>
        </a>
    </div>
</div>
<?php }} ?>