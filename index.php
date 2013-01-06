<?php

/**
 * Front-End of Roundabout_XH.
 *
 * Copyright (c) 2012 Christoph M. Becker (see license.txt)
 */

// utf8-marker: äöüß


define('ROUNDABOUT_VERSION', '1beta2');


define('ROUNDABOUT_FIELD_ID', 0);
define('ROUNDABOUT_FIELD_NUM', 1);
define('ROUNDABOUT_FIELD_ALBUM', 2);
define('ROUNDABOUT_FIELD_FNAME', 3);
define('ROUNDABOUT_FIELD_TIME', 4);
define('ROUNDABOUT_FIELD_MIME', 5);
define('ROUNDABOUT_FIELD_DESC', 6);


define('ROUNDABOUT_GALLERY_FOLDER', rtrim($pth['folder']['base'].$plugin_cf['roundabout']['gallery_folder'], '/').'/');


/**
 * Returns a list of all photos in $album.
 *
 * @param int $album  The album/gallery ID.
 * @return array
 */
function roundabout_photos($album) {
    global $pth, $plugin_cf;
    static $recs = NULL;

    if (is_null($recs)) {
	$pcf = $plugin_cf['roundabout'];
	$fn = ROUNDABOUT_GALLERY_FOLDER.'data/photo.txt';
	$lines = file($fn, FILE_IGNORE_NEW_LINES);
	$recs = array();
	foreach ($lines as $line) {
	    $recs[] = explode($pcf['gallery_separator'], $line);
	}
    }
    return array_values(array_filter($recs, create_function('$elt',
	    'return $elt['.ROUNDABOUT_FIELD_ALBUM.'] == '.$album.';')));
}


/**
 * Creates the JSON file for $album and returns the file name.
 *
 * @param int $album  The album/gallery ID.
 * @return string
 */
function roundabout_json($album) {
    global $pth, $plugin_cf;

    $pcf = $plugin_cf['roundabout'];
    $fn = $pth['folder']['base'].$pcf['gallery_folder'].'images/thumbs/';
    $o = '{'."\n".'    "items": [';
    $albums = roundabout_photos($album);
    foreach ($albums as $i => $photo) {
	$o .= '{'."\n"
		."\t".'"id": "'.$photo[ROUNDABOUT_FIELD_ID].'",'."\n"
		."\t".'"bez": "img'.$photo[ROUNDABOUT_FIELD_ID].'",'."\n"
		."\t".'"src": "'.$fn.$photo[ROUNDABOUT_FIELD_ID].'t.jpg",'."\n"
		."\t".'"template": "'.'",'."\n"
		."\t".'"title": "'.addcslashes($photo[ROUNDABOUT_FIELD_DESC], "\\\"").'",'."\n"
		."\t".'"description": "'.'"'."\n"
		.'    }';
	if ($i < count($albums) - 1) {$o .= ', ';}
    }
    $o .= ']'."\n".'}'."\n";
//    $fn = $pth['folder']['base'].$pcf['gallery_folder'].'data/roundabout_'.$album.'.json';
//    if (($fh = fopen($fn, 'w')) === FALSE || fwrite($fh, $o) === FALSE) {
//	e('cntwriteto', 'file', $fn);
//	$fn = NULL;
//    }
//    if ($fh !== FALSE) {fclose($fh);}
//    return $fn;
    header('Content-Type: text/plain; charset=UTF-8');
    echo $o;
    exit;
}


/**
 * Includes the JS and CSS to the <head>.
 *
 * @param int $album  The album/gallery ID.
 * @global $hjs
 * @return void
 */
function roundabout_js($album) {
    global $pth, $hjs, $sn, $plugin_cf;

    $pcf = $plugin_cf['roundabout'];
    include_once $pth['folder']['plugins'].'jquery/jquery.inc.php';
    include_jquery();
    $hjs .= tag('link rel="stylesheet" href="'.$pth['folder']['plugins'].'roundabout/css/colorbox.css" type="text/css"');
    include_jqueryplugin('jCarousel', $pth['folder']['plugins'].'roundabout/lib/carousel-0.9.3.js');
    include_jqueryplugin('colorbox', $pth['folder']['plugins'].'roundabout/lib/jquery.colorbox-min.js');
    $show_title = $pcf['show_title'] ? 'true' : 'false';
    //$show_buttons = $pcf['show_buttons'] ? 'true' : 'false';
    $json = "$sn?&roundabout_json=$album";
    $imgdir = ROUNDABOUT_GALLERY_FOLDER.'images/';
    $hjs .= <<<SCRIPT

<script type="text/javascript">
/* <![CDATA[ */
jQuery(function() {
    jQuery('#roundabout_$album').jCarousel({
	width: $pcf[size_width],
	height: $pcf[size_height],
	speed: $pcf[speed],
	maxSpeed: $pcf[speed_max],
	perspecitve: $pcf[perspective],
	dynamic: $pcf[dynamic],
	showTitle: $show_title,
	//showButtons: $show_buttons,
	jsonScript : '$json',
	reflection: $pcf[reflection],
	reflectionStart: $pcf[reflection_start],
	reflectionEnd: $pcf[reflection_end],
	overlay: $pcf[overlay_perspective],
	overlayGlobale: $pcf[overlay_global],
	overlayColor: '$pcf[overlay_color]',
	onPicClick: function(base, imageBlock, i) {
	    base.stopCarousel();
	    jQuery.colorbox({
		href: '$imgdir' + base.image[i].id + '.jpg',
		title: base.image[i].title,
		onClosed: function() {
		    base.startCarousel();
		}
	    });
	}
    });
})
/* ]]> */
</script>

SCRIPT;
}


/**
 * Returns the carousel view of $album.
 *
 * @access public
 * @param int $album  The album/gallery ID.
 * @return string  The (X)HTML.
 */
function roundabout($album) {
    global $plugin_tx;

    roundabout_js($album);
    $o = '<div id="roundabout_'.$album.'" class="roundabout"><noscript><div>'
	    .$plugin_tx['roundabout']['message_noscript'].'</div></noscript></div>';
    return $o;
}


if (isset($_GET['roundabout_json'])) {
    roundabout_json($_GET['roundabout_json']);
}

?>
