<?php
/**
 * Plugin Name:       Priority Plus Navigation
 * Plugin URI:        https://github.com/troychaplin/priority-plus-nav-block
 * Description:       A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.
 * Version:           1.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Troy Chaplin
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       priority-plus-navigation
 *
 * @package PriorityPlusNavigation
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include our bundled autoload if not loaded globally.
if ( ! class_exists( PriorityPlusNavigation\Plugin_Paths::class ) && file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

if ( ! class_exists( PriorityPlusNavigation\Plugin_Paths::class ) ) {
	wp_trigger_error( 'Priority Plus Navigation: Composer autoload file not found. Please run `composer install`.', E_USER_ERROR );
	return;
}

// Initialize plugin modules.
( function () {
	// Create shared dependencies.
	$enqueues      = new PriorityPlusNavigation\Enqueues( __DIR__ . '/build' );
	$css_converter = new PriorityPlusNavigation\CSS_Converter();

	// Create block renderer with callback to enqueue frontend assets.
	$block_renderer = new PriorityPlusNavigation\Block_Renderer(
		$css_converter,
		array( $enqueues, 'enqueue_frontend_assets' )
	);

	// Initialize all modules.
	$modules = array(
		$enqueues,
		$block_renderer,
	);

	foreach ( $modules as $module ) {
		if ( is_a( $module, PriorityPlusNavigation\Plugin_Module::class ) ) {
			$module->init();
		}
	}
} )();
