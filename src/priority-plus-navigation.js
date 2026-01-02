import PriorityNav from './core/PriorityNav.js';
import './styles/style.scss';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
	const navElements = document.querySelectorAll(
		'.wp-block-navigation.is-style-priority-plus-navigation'
	);

	navElements.forEach((element) => new PriorityNav(element));
});
