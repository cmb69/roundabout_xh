<?php

/**
 * Front-end of Roundabout_XH.
 *
 * @package	Roundabout
 * @copyright	Copyright (c) 2012-2013 Christoph M. Becker <http://3-magi.net/>
 * @license	http://www.gnu.org/licenses/gpl-3.0.en.html GNU GPLv3
 * @version     $Id$
 * @link	http://3-magi.net/?CMSimple_XH/Roundabout_XH
 */


define('ROUNDABOUT_VERSION', '1beta2');


define('ROUNDABOUT_FIELD_ID', 0);
define('ROUNDABOUT_FIELD_NUM', 1);
define('ROUNDABOUT_FIELD_ALBUM', 2);
define('ROUNDABOUT_FIELD_FNAME', 3);
define('ROUNDABOUT_FIELD_TIME', 4);
define('ROUNDABOUT_FIELD_MIME', 5);
define('ROUNDABOUT_FIELD_DESC', 6);


define('ROUNDABOUT_GALLERY_FOLDER',
       rtrim($pth['folder']['base'] . $plugin_cf['roundabout']['gallery_folder'],
	     '/')
       . '/');


/**
 * Returns a list of all photos in $album.
 *
 * @global array
 * @global array
 * @param  int $album  The album/gallery ID.
 * @return array
 */
function Roundabout_photos($album)
{
    global $pth, $plugin_cf;
    static $recs = NULL;

    if (is_null($recs)) {
	$pcf = $plugin_cf['roundabout'];
	$fn = ROUNDABOUT_GALLERY_FOLDER . 'data/photo.txt';
	$lines = file($fn);
	$recs = array();
	foreach ($lines as $line) {
	    $recs[] = explode($pcf['gallery_separator'], rtrim($line));
	}
    }
    $filter = create_function('$elt',
			      'return $elt[' . ROUNDABOUT_FIELD_ALBUM . '] == '
			      . $album . ';');
    return array_values(array_filter($recs, $filter));
}


/**
 * Delivers the JSON for $album.
 *
 * @global array
 * @global array
 * @param  int $album  The album/gallery ID.
 * @return void
 */
function Roundabout_json($album) // TODO: use json_encode
{
    global $pth, $plugin_cf;

    $pcf = $plugin_cf['roundabout'];
    $fn = ROUNDABOUT_GALLERY_FOLDER . 'images/thumbs/';
    $o = '{' . "\n" . '    "items": [';
    $albums = Roundabout_photos($album);
    foreach ($albums as $i => $photo) {
	$o .= '{' . "\n"
	    . "\t" . '"id": "' . $photo[ROUNDABOUT_FIELD_ID] . '",' . "\n"
	    . "\t" . '"bez": "img' . $photo[ROUNDABOUT_FIELD_ID] . '",' . "\n"
	    . "\t" . '"src": "' . $fn . $photo[ROUNDABOUT_FIELD_ID] . 't.jpg",' . "\n"
	    . "\t" . '"template": "' . '",' . "\n"
	    . "\t" . '"title": "' . addcslashes($photo[ROUNDABOUT_FIELD_DESC], "\\\"") . '",' . "\n"
	    . "\t" . '"description": "' . '"' . "\n"
	    . '    }';
	if ($i < count($albums) - 1) {$o .= ', ';}
    }
    $o .= ']' . "\n" . '}' . "\n";
    header('Content-Type: text/plain; charset=UTF-8');
    echo $o;
    exit;
}


/**
 * Includes the JS and CSS to the <head>.
 *
 * @global array
 * @global string
 * @param  int $album  The album/gallery ID.
 * @return void
 */
function Roundabout_hjs()
{
    global $pth, $hjs;
    static $again = false;

    if ($again) {
	return;
    }
    include_once $pth['folder']['plugins'] . 'jquery/jquery.inc.php';
    include_jQuery();
    $hjs .= tag('link rel="stylesheet" href="' . $pth['folder']['plugins']
		. 'roundabout/css/colorbox.css" type="text/css"');
    include_jQueryPlugin('jCarousel', $pth['folder']['plugins']
			 . 'roundabout/lib/carousel-0.9.3.js');
    include_jQueryPlugin('colorbox', $pth['folder']['plugins']
			 . 'roundabout/lib/jquery.colorbox-min.js');
    $again = true;
}


/**
 * Returns the script to initialize a roundabout.
 *
 * @global string
 * @global array
 * @param  int $album  The album/gallery ID.
 * @return void
 */
function Roundabout_init($album)
{
    global $sn, $plugin_cf;

    $pcf = $plugin_cf['roundabout'];
    $show_title = $pcf['show_title'] ? 'true' : 'false';
    //$show_buttons = $pcf['show_buttons'] ? 'true' : 'false';
    $json = "$sn?&roundabout_json=$album";
    $imgdir = ROUNDABOUT_GALLERY_FOLDER . 'images/';
    return <<<SCRIPT
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
 * Returns the carousel view of an album.
 *
 * @access public
 *
 * @global array
 * @param  int $album  The album/gallery ID.
 * @return string  The (X)HTML.
 */
function Roundabout($album)
{
    global $plugin_tx;

    Roundabout_hjs();
    $o = '<div id="roundabout_' . $album . '" class="roundabout"><noscript><div>'
	. $plugin_tx['roundabout']['message_noscript'] . '</div></noscript></div>'
	. Roundabout_init($album);
    return $o;
}


/*
 * Handle the request of JSON data.
 */
if (isset($_GET['roundabout_json']) && is_numeric($_GET['roundabout_json'])) {
    Roundabout_json(intval($_GET['roundabout_json']));
}

/*
 * Initialize plugin, if template_call is set.
 */
if ($plugin_cf['roundabout']['template_call']) {
    Roundabout_hjs();
}

?>
