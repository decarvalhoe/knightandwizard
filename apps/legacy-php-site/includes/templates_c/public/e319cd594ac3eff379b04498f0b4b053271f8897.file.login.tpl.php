<?php /* Smarty version Smarty-3.1.14, created on 2024-11-03 16:36:49
         compiled from "./includes/templates/public/login.tpl" */ ?>
<?php /*%%SmartyHeaderCode:38650339959be5479079407-75279584%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'e319cd594ac3eff379b04498f0b4b053271f8897' => 
    array (
      0 => './includes/templates/public/login.tpl',
      1 => 1730646207,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '38650339959be5479079407-75279584',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.14',
  'unifunc' => 'content_59be54790a9189_66288050',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_59be54790a9189_66288050')) {function content_59be54790a9189_66288050($_smarty_tpl) {?><h1>Login</h1>

<form action="login.php" method="post" class="form">
	E-mail : <input type="text" name="email" id="email" /><br />

    Mot de passe : <input type="password" name="password" id="password" /><br />

	<br />

	<input type="hidden" name="filledField" value="true">
	<input type="submit" value="Connexion" />
</form>
<?php }} ?>