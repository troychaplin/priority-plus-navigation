<?php
/**
 * Base class for plugin modules which can be initialized.
 *
 * @package PriorityPlusNavigation
 */

namespace PriorityPlusNavigation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin module extended by other classes.
 */
abstract class Plugin_Module {
	/**
	 * Initialize the module.
	 */
	abstract public function init();
}
