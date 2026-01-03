# Dropdown Style Customizer - Implementation Plan

## Overview

Add a visual dropdown style customizer to the Priority Plus Navigation block, allowing users to customize dropdown appearance through a modal interface with live preview. This will eventually replace the theme.json approach with a more user-friendly, per-block customization system.

## Goals

1. **Visual Customization** - Provide intuitive UI for styling the dropdown menu
2. **Live Preview** - Show real-time feedback as users adjust settings
3. **Per-Block Control** - Each Priority+ Navigation block can have unique dropdown styles
4. **Better UX** - Easier than editing theme.json for non-technical users
5. **Foundation for Future** - Sets up infrastructure for preset styles and block variations

## Design Decisions

### ✅ Confirmed Approach

- **Storage**: Block attributes (not global settings)
- **UI Pattern**: Modal (not Popover)
- **Properties**: All 9 existing dropdown properties
- **Defaults**: Pre-populate with plugin defaults on first use
- **theme.json**: Plan to deprecate (no fallback support needed - unreleased product)

### Why Block Attributes?

- Matches WordPress block patterns
- Allows per-block customization (header vs footer nav can differ)
- Portable - styles travel with the block
- Version controlled in post revisions
- Future-proof for preset styles and variations

### Why Modal?

- Two-column layout needs space (controls + preview)
- Better for 9+ properties with labels/help text
- Feels more like a dedicated "design tool"
- WordPress `Modal` component is well-tested

## Implementation Phases

### Phase 1: Foundation & Data Structure

**Goal**: Set up block attributes and CSS generation logic

#### 1.1 Add Block Attribute

**File**: `src/variation/block.js`

Add new attribute to store dropdown styles:

```javascript
attributes: {
  // ... existing attributes ...

  dropdownStyles: {
    type: 'object',
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#dddddd',
      borderWidth: '1px',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      itemSpacing: '0.75rem 1.25rem',
      itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
      itemHoverTextColor: 'inherit',
      multiLevelIndent: '1.25rem'
    }
  }
}
```

#### 1.2 Generate CSS Custom Properties

**File**: `classes/class-enqueues.php` (or new file `classes/class-dropdown-styles.php`)

Create function to convert block attributes to inline CSS custom properties:

```php
public function generate_dropdown_styles( $attributes ) {
  if ( empty( $attributes['dropdownStyles'] ) ) {
    return '';
  }

  $styles = $attributes['dropdownStyles'];
  $css_vars = '';

  // Map attribute keys to CSS custom property names
  $property_map = [
    'backgroundColor' => '--wp--custom--priority-plus-navigation--dropdown--background-color',
    'borderColor' => '--wp--custom--priority-plus-navigation--dropdown--border-color',
    'borderWidth' => '--wp--custom--priority-plus-navigation--dropdown--border-width',
    'borderRadius' => '--wp--custom--priority-plus-navigation--dropdown--border-radius',
    'boxShadow' => '--wp--custom--priority-plus-navigation--dropdown--box-shadow',
    'itemSpacing' => '--wp--custom--priority-plus-navigation--dropdown--item-spacing',
    'itemHoverBackgroundColor' => '--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color',
    'itemHoverTextColor' => '--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color',
    'multiLevelIndent' => '--wp--custom--priority-plus-navigation--dropdown--multi-level-indent',
  ];

  foreach ( $property_map as $attr_key => $css_var ) {
    if ( isset( $styles[ $attr_key ] ) ) {
      $css_vars .= "{$css_var}: {$styles[$attr_key]};";
    }
  }

  return $css_vars;
}
```

#### 1.3 Apply Styles to Block Wrapper

**File**: `classes/class-enqueues.php`

Modify `render_block` filter to inject inline styles:

```php
public function render_block( $block_content, $block ) {
  if ( 'core/navigation' !== $block['blockName'] ) {
    return $block_content;
  }

  // Check if this is Priority+ variation
  if ( ! isset( $block['attrs']['className'] ) ||
       strpos( $block['attrs']['className'], 'is-style-priority-plus-navigation' ) === false ) {
    return $block_content;
  }

  // Generate dropdown styles
  $dropdown_styles = $this->generate_dropdown_styles( $block['attrs'] );

  if ( ! empty( $dropdown_styles ) ) {
    // Inject inline styles into block wrapper
    $style_attr = 'style="' . esc_attr( $dropdown_styles ) . '"';
    $block_content = preg_replace(
      '/class="([^"]*is-style-priority-plus-navigation[^"]*)"/',
      'class="$1" ' . $style_attr,
      $block_content,
      1
    );
  }

  return $block_content;
}
```

**Testing**: At this point, manually setting `dropdownStyles` attribute should apply styles.

---

### Phase 2: Modal UI - Basic Structure

**Goal**: Create modal that opens/closes with basic layout

#### 2.1 Add "Customize Dropdown" Button

**File**: `src/variation/controls.js`

Add button to InspectorControls:

```javascript
import { ToolsPanel, ToolsPanelItem, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

function PriorityNavControls( { attributes, setAttributes } ) {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  return (
    <>
      <InspectorControls>
        {/* ... existing More Button controls ... */}

        <ToolsPanel label={__('Dropdown Styles', 'priority-plus-navigation')}>
          <Button
            variant="secondary"
            onClick={() => setIsCustomizerOpen(true)}
          >
            {__('Customize Dropdown', 'priority-plus-navigation')}
          </Button>
        </ToolsPanel>
      </InspectorControls>

      {isCustomizerOpen && (
        <DropdownCustomizerModal
          attributes={attributes}
          setAttributes={setAttributes}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </>
  );
}
```

#### 2.2 Create Modal Component

**File**: `src/variation/components/dropdown-customizer-modal.js` (new file)

```javascript
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './dropdown-customizer-modal.scss';

export function DropdownCustomizerModal({ attributes, setAttributes, onClose }) {
  const { dropdownStyles = {} } = attributes;

  return (
    <Modal
      title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
      onRequestClose={onClose}
      className="priority-plus-dropdown-customizer"
      size="large"
    >
      <div className="dropdown-customizer-layout">
        <div className="dropdown-customizer-controls">
          {/* Controls will go here */}
          <p>Controls placeholder</p>
        </div>

        <div className="dropdown-customizer-preview">
          {/* Preview will go here */}
          <p>Preview placeholder</p>
        </div>
      </div>

      <div className="dropdown-customizer-footer">
        <Button variant="primary" onClick={onClose}>
          {__('Done', 'priority-plus-navigation')}
        </Button>
      </div>
    </Modal>
  );
}
```

#### 2.3 Modal Layout Styles

**File**: `src/variation/components/dropdown-customizer-modal.scss` (new file)

```scss
.priority-plus-dropdown-customizer {
  .components-modal__content {
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .dropdown-customizer-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
    flex: 1;
    overflow: hidden;
  }

  .dropdown-customizer-controls {
    overflow-y: auto;
    padding-right: 1rem;
  }

  .dropdown-customizer-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border-radius: 4px;
    padding: 2rem;
    position: sticky;
    top: 0;
  }

  .dropdown-customizer-footer {
    padding: 1rem 2rem;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
  }
}
```

**Testing**: Modal should open/close, show two-column layout.

---

### Phase 3: Control Components

**Goal**: Add all 9 property controls with proper inputs

#### 3.1 Control Component Structure

Each property gets a `ToolsPanelItem` with appropriate control type:

- **Color properties**: `ColorPalette` or `ColorPicker` (with alpha support)
- **Dimension properties**: `UnitControl`
- **Shadow property**: `TextControl` (complex - could enhance later)

#### 3.2 Implement All Controls

**File**: `src/variation/components/dropdown-customizer-modal.js`

```javascript
import {
  ColorPalette,
  UnitControl,
  TextControl,
  __experimentalToolsPanel as ToolsPanel,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

export function DropdownCustomizerModal({ attributes, setAttributes, onClose }) {
  const { dropdownStyles = {} } = attributes;

  const updateStyle = (key, value) => {
    setAttributes({
      dropdownStyles: {
        ...dropdownStyles,
        [key]: value,
      },
    });
  };

  return (
    <Modal /* ... */>
      <div className="dropdown-customizer-layout">
        <div className="dropdown-customizer-controls">
          <ToolsPanel label={__('Dropdown Appearance', 'priority-plus-navigation')}>

            {/* Background Color */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.backgroundColor}
              label={__('Background Color', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('backgroundColor', undefined)}
            >
              <ColorPalette
                value={dropdownStyles.backgroundColor}
                onChange={(value) => updateStyle('backgroundColor', value)}
              />
            </ToolsPanelItem>

            {/* Border Color */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.borderColor}
              label={__('Border Color', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('borderColor', undefined)}
            >
              <ColorPalette
                value={dropdownStyles.borderColor}
                onChange={(value) => updateStyle('borderColor', value)}
              />
            </ToolsPanelItem>

            {/* Border Width */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.borderWidth}
              label={__('Border Width', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('borderWidth', undefined)}
            >
              <UnitControl
                value={dropdownStyles.borderWidth}
                onChange={(value) => updateStyle('borderWidth', value)}
                units={[
                  { value: 'px', label: 'px' },
                  { value: 'rem', label: 'rem' },
                ]}
              />
            </ToolsPanelItem>

            {/* Border Radius */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.borderRadius}
              label={__('Border Radius', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('borderRadius', undefined)}
            >
              <UnitControl
                value={dropdownStyles.borderRadius}
                onChange={(value) => updateStyle('borderRadius', value)}
                units={[
                  { value: 'px', label: 'px' },
                  { value: 'rem', label: 'rem' },
                  { value: '%', label: '%' },
                ]}
              />
            </ToolsPanelItem>

            {/* Box Shadow */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.boxShadow}
              label={__('Box Shadow', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('boxShadow', undefined)}
              help={__('CSS box-shadow value (e.g., "0 4px 12px rgba(0,0,0,0.15)")', 'priority-plus-navigation')}
            >
              <TextControl
                value={dropdownStyles.boxShadow}
                onChange={(value) => updateStyle('boxShadow', value)}
              />
            </ToolsPanelItem>

          </ToolsPanel>

          <ToolsPanel label={__('Item Styles', 'priority-plus-navigation')}>

            {/* Item Spacing */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.itemSpacing}
              label={__('Item Spacing', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('itemSpacing', undefined)}
              help={__('Padding around items (e.g., "0.75rem 1.25rem")', 'priority-plus-navigation')}
            >
              <TextControl
                value={dropdownStyles.itemSpacing}
                onChange={(value) => updateStyle('itemSpacing', value)}
              />
            </ToolsPanelItem>

            {/* Item Hover Background */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.itemHoverBackgroundColor}
              label={__('Hover Background Color', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('itemHoverBackgroundColor', undefined)}
            >
              <ColorPalette
                value={dropdownStyles.itemHoverBackgroundColor}
                onChange={(value) => updateStyle('itemHoverBackgroundColor', value)}
                enableAlpha
              />
            </ToolsPanelItem>

            {/* Item Hover Text Color */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.itemHoverTextColor}
              label={__('Hover Text Color', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('itemHoverTextColor', undefined)}
            >
              <ColorPalette
                value={dropdownStyles.itemHoverTextColor}
                onChange={(value) => updateStyle('itemHoverTextColor', value)}
              />
            </ToolsPanelItem>

            {/* Multi-level Indent */}
            <ToolsPanelItem
              hasValue={() => !!dropdownStyles.multiLevelIndent}
              label={__('Multi-level Indent', 'priority-plus-navigation')}
              onDeselect={() => updateStyle('multiLevelIndent', undefined)}
              help={__('Indentation for nested menu levels', 'priority-plus-navigation')}
            >
              <UnitControl
                value={dropdownStyles.multiLevelIndent}
                onChange={(value) => updateStyle('multiLevelIndent', value)}
                units={[
                  { value: 'px', label: 'px' },
                  { value: 'rem', label: 'rem' },
                  { value: 'em', label: 'em' },
                ]}
              />
            </ToolsPanelItem>

          </ToolsPanel>
        </div>

        <div className="dropdown-customizer-preview">
          {/* Preview component */}
        </div>
      </div>

      {/* Footer */}
    </Modal>
  );
}
```

**Testing**: Controls should update `dropdownStyles` attribute, verify in browser devtools.

---

### Phase 4: Live Preview Component

**Goal**: Create visual preview that updates in real-time

#### 4.1 Preview Component

**File**: `src/variation/components/dropdown-preview.js` (new file)

```javascript
import { useMemo } from '@wordpress/element';
import './dropdown-preview.scss';

export function DropdownPreview({ styles }) {
  const previewStyles = useMemo(() => {
    return {
      '--preview-bg': styles.backgroundColor || '#ffffff',
      '--preview-border-color': styles.borderColor || '#dddddd',
      '--preview-border-width': styles.borderWidth || '1px',
      '--preview-border-radius': styles.borderRadius || '4px',
      '--preview-box-shadow': styles.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
      '--preview-item-spacing': styles.itemSpacing || '0.75rem 1.25rem',
      '--preview-item-hover-bg': styles.itemHoverBackgroundColor || 'rgba(0, 0, 0, 0.05)',
      '--preview-item-hover-color': styles.itemHoverTextColor || 'inherit',
      '--preview-multi-indent': styles.multiLevelIndent || '1.25rem',
    };
  }, [styles]);

  return (
    <div className="dropdown-preview-wrapper" style={previewStyles}>
      <div className="dropdown-preview-menu">
        <div className="dropdown-preview-item">Home</div>
        <div className="dropdown-preview-item">About</div>
        <div className="dropdown-preview-item dropdown-preview-item-hover">
          Services
          <span className="dropdown-preview-arrow">▼</span>
        </div>
        <div className="dropdown-preview-submenu">
          <div className="dropdown-preview-item dropdown-preview-item-nested">
            Design
          </div>
          <div className="dropdown-preview-item dropdown-preview-item-nested">
            Development
            <span className="dropdown-preview-arrow">▼</span>
          </div>
          <div className="dropdown-preview-submenu dropdown-preview-submenu-nested">
            <div className="dropdown-preview-item dropdown-preview-item-nested-2">
              WordPress
            </div>
            <div className="dropdown-preview-item dropdown-preview-item-nested-2">
              React
            </div>
          </div>
        </div>
        <div className="dropdown-preview-item">Contact</div>
      </div>
    </div>
  );
}
```

#### 4.2 Preview Styles

**File**: `src/variation/components/dropdown-preview.scss` (new file)

```scss
.dropdown-preview-wrapper {
  width: 100%;
  max-width: 300px;
}

.dropdown-preview-menu {
  background: var(--preview-bg);
  border-width: var(--preview-border-width);
  border-style: solid;
  border-color: var(--preview-border-color);
  border-radius: var(--preview-border-radius);
  box-shadow: var(--preview-box-shadow);
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-preview-item {
  padding: var(--preview-item-spacing);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease, color 0.2s ease;

  &.dropdown-preview-item-hover {
    background: var(--preview-item-hover-bg);
    color: var(--preview-item-hover-color);
  }

  &.dropdown-preview-item-nested {
    padding-left: calc(1rem + var(--preview-multi-indent));
  }

  &.dropdown-preview-item-nested-2 {
    padding-left: calc(1rem + (var(--preview-multi-indent) * 2));
  }
}

.dropdown-preview-arrow {
  font-size: 0.7em;
  opacity: 0.6;
}

.dropdown-preview-submenu {
  background: transparent;
}
```

#### 4.3 Integrate Preview into Modal

**File**: `src/variation/components/dropdown-customizer-modal.js`

```javascript
import { DropdownPreview } from './dropdown-preview';

export function DropdownCustomizerModal({ attributes, setAttributes, onClose }) {
  // ...

  return (
    <Modal /* ... */>
      <div className="dropdown-customizer-layout">
        <div className="dropdown-customizer-controls">
          {/* Controls */}
        </div>

        <div className="dropdown-customizer-preview">
          <DropdownPreview styles={dropdownStyles} />
        </div>
      </div>
      {/* Footer */}
    </Modal>
  );
}
```

**Testing**: Preview should update live as controls change.

---

### Phase 5: Polish & UX Enhancements

**Goal**: Improve usability and add helpful features

#### 5.1 Reset to Defaults Button

Add button to footer that resets all styles to plugin defaults:

```javascript
<div className="dropdown-customizer-footer">
  <Button
    variant="tertiary"
    isDestructive
    onClick={() => {
      setAttributes({
        dropdownStyles: {
          backgroundColor: '#ffffff',
          borderColor: '#dddddd',
          borderWidth: '1px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          itemSpacing: '0.75rem 1.25rem',
          itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
          itemHoverTextColor: 'inherit',
          multiLevelIndent: '1.25rem',
        },
      });
    }}
  >
    {__('Reset to Defaults', 'priority-plus-navigation')}
  </Button>

  <Button variant="primary" onClick={onClose}>
    {__('Done', 'priority-plus-navigation')}
  </Button>
</div>
```

#### 5.2 Validation & Sanitization

Add validation for dimension values:

```javascript
const updateStyle = (key, value) => {
  // Sanitize dimension values
  if (['borderWidth', 'borderRadius', 'multiLevelIndent'].includes(key)) {
    // Ensure value has unit (default to px if numeric)
    if (value && /^\d+$/.test(value)) {
      value = value + 'px';
    }
  }

  setAttributes({
    dropdownStyles: {
      ...dropdownStyles,
      [key]: value,
    },
  });
};
```

#### 5.3 Improved Color Controls

Use `ColorPicker` instead of `ColorPalette` for more control:

```javascript
import { ColorPicker } from '@wordpress/components';

<ColorPicker
  color={dropdownStyles.backgroundColor}
  onChange={(value) => updateStyle('backgroundColor', value)}
  enableAlpha
/>
```

#### 5.4 Help Text & Documentation

Add helpful descriptions to each control explaining what it does.

---

### Phase 6: Deprecate theme.json (Future Release)

**Goal**: Clean up theme.json support after customizer ships

#### 6.1 Update Documentation

- Update `docs/styling.md` to mark theme.json as deprecated
- Add note that customizer is the preferred method
- Keep theme.json docs for reference but add deprecation notice

#### 6.2 Migration Notice (Optional)

Add admin notice for users who have theme.json customizations:

```php
// Check if theme.json has Priority+ settings
// Show dismissible notice suggesting migration to block customizer
```

#### 6.3 Remove SCSS Defaults (Optional - Breaking Change)

After sufficient adoption period, remove `:root` defaults from `_variables.scss` since they'll be in block attributes.

---

## File Structure

```
src/variation/
├── block.js (updated - add dropdownStyles attribute)
├── controls.js (updated - add Customize button & modal trigger)
├── components/
│   ├── dropdown-customizer-modal.js (new)
│   ├── dropdown-customizer-modal.scss (new)
│   ├── dropdown-preview.js (new)
│   └── dropdown-preview.scss (new)

classes/
├── class-enqueues.php (updated - add inline style generation)
└── class-dropdown-styles.php (optional new - style generation helper)
```

## Testing Checklist

### Phase 1
- [ ] `dropdownStyles` attribute saves to post_content
- [ ] Manually setting attribute applies styles on frontend
- [ ] Inline styles correctly override SCSS defaults

### Phase 2
- [ ] "Customize Dropdown" button appears in Inspector
- [ ] Modal opens/closes correctly
- [ ] Two-column layout displays properly
- [ ] Modal is responsive (test small screens)

### Phase 3
- [ ] All 9 controls render in modal
- [ ] Changing values updates attribute
- [ ] Color pickers support alpha channel
- [ ] UnitControl shows proper unit options
- [ ] ToolsPanelItem reset works (X button)

### Phase 4
- [ ] Preview renders in modal
- [ ] Preview updates in real-time as controls change
- [ ] Preview shows nested navigation correctly
- [ ] Preview matches actual dropdown appearance

### Phase 5
- [ ] "Reset to Defaults" clears all customizations
- [ ] Validation prevents invalid dimension values
- [ ] Help text is clear and helpful
- [ ] Modal is keyboard accessible

### Phase 6
- [ ] Documentation updated
- [ ] Deprecation notices added where appropriate

## Performance Considerations

1. **Use `useMemo` in preview** - Prevent unnecessary re-renders
2. **Debounce rapid changes** - If typing in TextControl causes lag
3. **Lazy load modal** - Only import modal components when needed
4. **Optimize preview HTML** - Keep preview DOM lightweight

## Accessibility

- [ ] Modal is keyboard navigable (Tab/Shift+Tab)
- [ ] Esc key closes modal
- [ ] Color controls have proper labels
- [ ] Preview has appropriate ARIA labels
- [ ] Focus returns to trigger button on close

## Browser Compatibility

- All features use WordPress components (pre-tested)
- CSS custom properties have excellent support
- Preview uses modern CSS (Grid, custom properties) - acceptable for editor-only feature

## Future Enhancements (Post-MVP)

1. **Preset Styles** - Add quick-select presets ("Minimal", "Bold", "Card")
2. **Copy Styles** - Copy dropdown styles from one block to another
3. **Advanced Shadow Builder** - Visual box-shadow builder instead of text input
4. **Spacing Builder** - Visual padding/margin builder for itemSpacing
5. **Import/Export** - Export styles as JSON, import into other blocks
6. **Block Variations** - Register variations with pre-configured dropdown styles

## Migration from theme.json

For users currently using theme.json:

1. **No automatic migration** - Manual only (simpler, less risky)
2. **Documentation** - Provide clear instructions on moving from theme.json to block attributes
3. **Coexistence** - Block attributes take precedence, theme.json acts as fallback until deprecated

## Success Criteria

- [ ] Users can customize all 9 dropdown properties without touching code
- [ ] Live preview accurately represents final appearance
- [ ] Modal UX feels polished and professional
- [ ] Performance is smooth (no lag when adjusting controls)
- [ ] Code is maintainable and well-documented
- [ ] Feature is accessible to keyboard and screen reader users

## Timeline Estimate

- **Phase 1**: 3-4 hours (attribute + CSS generation)
- **Phase 2**: 2-3 hours (modal structure)
- **Phase 3**: 4-5 hours (all controls)
- **Phase 4**: 3-4 hours (preview component)
- **Phase 5**: 2-3 hours (polish)
- **Phase 6**: 1-2 hours (documentation)

**Total**: ~15-21 hours

## Notes

- This is an unreleased product - no backward compatibility needed
- Block attributes approach aligns with WordPress best practices
- Modal provides better UX than Popover for this use case
- Live preview is critical for good UX
- Plan to deprecate theme.json once customizer ships
