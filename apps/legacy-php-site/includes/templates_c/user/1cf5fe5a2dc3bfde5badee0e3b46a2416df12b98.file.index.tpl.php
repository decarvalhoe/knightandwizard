<?php /* Smarty version Smarty-3.1.14, created on 2020-03-24 22:28:15
         compiled from "../includes/templates/user/index.tpl" */ ?>
<?php /*%%SmartyHeaderCode:7904565255c6013364cc987-26539312%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '1cf5fe5a2dc3bfde5badee0e3b46a2416df12b98' => 
    array (
      0 => '../includes/templates/user/index.tpl',
      1 => 1585085268,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7904565255c6013364cc987-26539312',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6013364f2f76_86591738',
  'variables' => 
  array (
    'User' => 0,
    'imgPlacePath' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6013364f2f76_86591738')) {function content_5c6013364f2f76_86591738($_smarty_tpl) {?><h1>Knight and Wizard</h1>

<p>Bienvenu <?php echo $_smarty_tpl->tpl_vars['User']->value->name;?>
 !</p>

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
</div>
<?php }} ?>