<?php /* Smarty version Smarty-3.1.14, created on 2024-11-10 16:41:41
         compiled from "../includes/templates/user/update-character-profil-img.tpl" */ ?>
<?php /*%%SmartyHeaderCode:21192510915c6012bb06cf87-93010778%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '07c37b983efa681e47a6005dab57fe4df36158d5' => 
    array (
      0 => '../includes/templates/user/update-character-profil-img.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '21192510915c6012bb06cf87-93010778',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_5c6012bb09cbd3_03161251',
  'variables' => 
  array (
    'Character' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_5c6012bb09cbd3_03161251')) {function content_5c6012bb09cbd3_03161251($_smarty_tpl) {?><h1>Modification l'image de profil du personnage</h1>

<form action="update-character.php?update=done" method="post" class="form" enctype="multipart/form-data">
    <input type="file" name="characterProfilImg" id="characterProfilImg"> (Le format doit être exactment de 400 x 500 px et en ".jpg")

    <br />
    <input type="hidden" name="character-id" value="<?php echo $_smarty_tpl->tpl_vars['Character']->value->id;?>
">
    <input type="hidden" name="update" value="profil-img">
    <input type="submit" value="Modifier" />
</form>
<?php }} ?>