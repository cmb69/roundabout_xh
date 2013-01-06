<?php

/**
 * Back-end of Roundabout_XH.
 *
 * @package	Roundabout
 * @copyright	Copyright (c) 2012-2013 Christoph M. Becker <http://3-magi.net/>
 * @license	http://www.gnu.org/licenses/gpl-3.0.en.html GNU GPLv3
 * @version     $Id$
 * @link	http://3-magi.net/?CMSimple_XH/Roundabout_XH
 */


if (!defined('CMSIMPLE_XH_VERSION')) {
    header('HTTP/1.0 403 Forbidden');
    exit;
}


/**
 * Returns the plugin version information view.
 *
 * @global array
 * @return string  The (X)HTML.
 */
function Roundabout_version()
{
    global $pth;

    return '<h1><a href="http://3-magi.net/?CMSimple_XH/Roundabout_XH">Roundabout_XH</a></h1>'
        . tag('img src="' . $pth['folder']['plugins']
	      . 'roundabout/roundabout.png" style="float:left; margin-right: 1em"')
	. '<p>Version: ' . ROUNDABOUT_VERSION . '</p>'
	. '<p>Copyright &copy; 2012 <a href="http://3-magi.net">Christoph M. Becker</a></p>'
	. '<p>Roundabout_XH is powered by <a href="http://www.jcarousel.de/">jQuery Carousel</a>'
	. ' and <a href="http://www.jacklmoore.com/colorbox">ColorBox</a>.</p>'
	. '<p style="text-align: justify">This program is free software: you can redistribute it and/or modify'
	. ' it under the terms of the GNU General Public License as published by'
	. ' the Free Software Foundation, either version 3 of the License, or'
	. ' (at your option) any later version.</p>'
	. '<p style="text-align: justify">This program is distributed in the hope that it will be useful,'
	. ' but WITHOUT ANY WARRANTY; without even the implied warranty of'
	. ' MERCHAN&shy;TABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the'
	. ' GNU General Public License for more details.</p>'
	. '<p style="text-align: justify">You should have received a copy of the GNU General Public License'
	. ' along with this program.  If not, see'
	. ' <a href="http://www.gnu.org/licenses/">http://www.gnu.org/licenses/</a>.</p>';
}


/**
 * Returns the requirements information view.
 *
 * @global array
 * @global array
 * @global array
 * @return string  The (X)HTML.
 */
function Roundabout_systemCheck()
{ // RELEASE-TODO
    global $pth, $tx, $plugin_tx;

    $phpVersion = '4.0.7';
    $ptx = $plugin_tx['roundabout'];
    $imgdir = $pth['folder']['plugins'] . 'roundabout/images/';
    $ok = tag('img src="' . $imgdir . 'ok.png" alt="ok"');
    $warn = tag('img src="' . $imgdir . 'warn.png" alt="warning"');
    $fail = tag('img src="' . $imgdir . 'fail.png" alt="failure"');
    $o = tag('hr') . '<h4>' . $ptx['syscheck_title'] . '</h4>'
	. (version_compare(PHP_VERSION, $phpVersion) >= 0 ? $ok : $fail)
	. '&nbsp;&nbsp;' . sprintf($ptx['syscheck_phpversion'], $phpVersion)
	. tag('br');
    foreach (array() as $ext) {
	$o .= (extension_loaded($ext) ? $ok : $fail)
	    . '&nbsp;&nbsp;' . sprintf($ptx['syscheck_extension'], $ext) . tag('br');
    }
    $o .= (!get_magic_quotes_runtime() ? $ok : $fail)
	. '&nbsp;&nbsp;' . $ptx['syscheck_magic_quotes'] . tag('br') . tag('br');
    $o .= (strtoupper($tx['meta']['codepage']) == 'UTF-8' ? $ok : $warn)
	. '&nbsp;&nbsp;' . $ptx['syscheck_encoding'] . tag('br');
    $o .= (file_exists($pth['folder']['plugins'].'jquery/jquery.inc.php') ? $ok : $fail)
	. '&nbsp;&nbsp;' . $ptx['syscheck_jquery'] . tag('br') . tag('br');
    foreach (array('config/', 'css/', 'languages/') as $folder) {
	$folders[] = $pth['folder']['plugins'] . 'roundabout/' . $folder;
    }
    $folders[] = ROUNDABOUT_GALLERY_FOLDER;
    foreach ($folders as $folder) {
	$o .= (is_writable($folder) ? $ok : $warn)
	    . '&nbsp;&nbsp;' . sprintf($ptx['syscheck_writable'], $folder) . tag('br');
    }
    return $o;
}


/*
 * Handle the plugin administration.
 */
if (isset($roundabout) && $roundabout == 'true') {
    $o .= print_plugin_admin('off');
    switch ($admin) {
    case '':
	$o .= Roundabout_version() . Roundabout_systemCheck();
	break;
    default:
	$o .= plugin_admin_common($action, $admin, $plugin);
    }
}

?>
