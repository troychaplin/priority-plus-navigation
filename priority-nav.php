<?php
/**
 * Plugin Name:       Priority+ Navigation Block
 * Plugin URI:        https://github.com/troychaplin/priority-plus-nav-block
 * Description:       A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Troy Chaplin
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       priority-plus-nav
 *
 * @package PriorityPlusNavigationBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Track if we've enqueued the frontend script (to avoid duplicates)
 */
$priority_nav_script_enqueued = false;

/**
 * Enqueue editor assets for Priority+ Navigation extension
 * This loads the JavaScript that extends core/navigation with Priority+ functionality
 */
function priority_nav_enqueue_editor_assets() {
	$editor_asset_file = __DIR__ . '/build/index.asset.php';
	if ( ! file_exists( $editor_asset_file ) ) {
		return;
	}

	$editor_asset = require $editor_asset_file;

	wp_enqueue_script(
		'priority-nav-editor',
		plugins_url( 'build/index.js', __FILE__ ),
		$editor_asset['dependencies'],
		$editor_asset['version'],
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'priority_nav_enqueue_editor_assets' );

/**
 * Enqueue Priority+ frontend script and styles
 * Called from render_block when needed
 */
function priority_nav_enqueue_assets() {
	global $priority_nav_script_enqueued;

	// Only enqueue once
	if ( $priority_nav_script_enqueued ) {
		return;
	}

	$priority_nav_script_enqueued = true;

	// Get the view script asset
	$view_asset_file = __DIR__ . '/build/view.asset.php';
	if ( ! file_exists( $view_asset_file ) ) {
		return;
	}

	$view_asset = require $view_asset_file;
	
	wp_enqueue_script(
		'priority-nav-view',
		plugins_url( 'build/view.js', __FILE__ ),
		$view_asset['dependencies'],
		$view_asset['version'],
		true
	);

	// Also enqueue styles
	$style_path = __DIR__ . '/build/style-index.css';
	if ( file_exists( $style_path ) ) {
		wp_enqueue_style(
			'priority-nav-style',
			plugins_url( 'build/style-index.css', __FILE__ ),
			array(),
			$view_asset['version']
		);
	}
}

/**
 * Filter block rendering to inject Priority+ data attributes
 * and enqueue the frontend script when needed.
 * Handles both core/navigation with Priority+ enabled and legacy wrapper blocks.
 *
 * @param string $block_content The block content.
 * @param array  $block         The full block, including name and attributes.
 * @return string Modified block content.
 */
function priority_nav_render_block( $block_content, $block ) {
	$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';

	// Handle core/navigation blocks with Priority+ enabled
	if ( 'core/navigation' === $block_name ) {
		// Check if Priority Nav is enabled
		$priority_nav_enabled = isset( $block['attrs']['priorityNavEnabled'] ) && $block['attrs']['priorityNavEnabled'];
		
		if ( ! $priority_nav_enabled ) {
			return $block_content;
		}

		// Enqueue assets if not already done
		priority_nav_enqueue_assets();

		// Get Priority+ settings
		$more_label = isset( $block['attrs']['priorityNavMoreLabel'] ) ? $block['attrs']['priorityNavMoreLabel'] : 'More';
		$more_icon  = isset( $block['attrs']['priorityNavMoreIcon'] ) ? $block['attrs']['priorityNavMoreIcon'] : 'dots';

		// Inject data attributes on the .wp-block-navigation element
		// The block content should contain a <nav class="wp-block-navigation"> element
		if ( ! empty( $block_content ) ) {
			// Add data attributes to the nav element
			$block_content = preg_replace(
				'/(<nav[^>]*class="[^"]*wp-block-navigation[^"]*")/i',
				'$1 data-priority-nav data-more-label="' . esc_attr( $more_label ) . '" data-more-icon="' . esc_attr( $more_icon ) . '"',
				$block_content,
				1
			);
		}

		return $block_content;
	}

	// Handle legacy wrapper blocks (for frontend compatibility)
	// Check if this is a legacy wrapper block or if content contains priority-nav markup
	if ( 'lumen/priority-nav' === $block_name || 
		 ( ! empty( $block_content ) && false !== strpos( $block_content, 'data-priority-nav' ) ) ) {
		// Enqueue assets for legacy wrapper blocks
		priority_nav_enqueue_assets();
	}

	return $block_content;
}
add_filter( 'render_block', 'priority_nav_render_block', 10, 2 );
