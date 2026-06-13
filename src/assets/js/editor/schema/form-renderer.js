/**
 * Generic schema-driven form renderer. Walks a resolved field tree and a
 * live values object in parallel, building a control per leaf bound to its
 * value. Groups render as nested field groups; `containerFields` becomes a
 * collapsible disclosure pane; `widget: array` becomes a repeatable list of
 * subforms. Editing mutates the values object in place and calls onChange.
 *
 * This is the rendering half of the manifest-driven editor (see
 * docs/manifest-driven-editor.md). It carries no per-type knowledge: any
 * section whose field tree the build artifact describes renders here.
 */

import { isLeaf, isArrayField, isGroup, materializeDefaults } from './field-utils.js';

/** Human headings for group keys that need more than a capitalized key. */
const GROUP_LABELS = {
  containerFields: 'Container settings',
  ctas: 'Call-to-action buttons'
};

/** @param {string} key @return {string} A heading for a group with no label. */
function groupLabel(key) {
  return GROUP_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

/**
 * Builds the labeled control for one leaf field, bound to obj[key].
 * @param {Object} node - The leaf field definition.
 * @param {Object} obj - The parent values object.
 * @param {string} key - The property on obj this control binds to.
 * @param {Function} onChange - Called after every edit.
 * @return {HTMLElement} The form-group element.
 */
function renderLeaf(node, obj, key, onChange) {
  const group = document.createElement('div');
  group.className = 'form-group section-field';

  const labelEl = document.createElement('label');
  labelEl.textContent = node.label || key;

  let input;
  if (node.widget === 'markdown') {
    input = document.createElement('textarea');
    input.rows = 6;
    input.value = obj[key] ?? '';
    input.oninput = () => {
      obj[key] = input.value;
      onChange();
    };
  } else if (node.widget === 'select') {
    input = document.createElement('select');
    for (const opt of node.enum || []) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      input.append(o);
    }
    input.value = obj[key] ?? node.default;
    input.onchange = () => {
      obj[key] = input.value;
      onChange();
    };
  } else if (node.widget === 'checkbox') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(obj[key]);
    input.onchange = () => {
      obj[key] = input.checked;
      onChange();
    };
    // Checkbox reads better as label-after-control.
    group.classList.add('section-field-checkbox');
    const inline = document.createElement('label');
    inline.className = 'checkbox-label';
    inline.append(input, document.createTextNode(` ${node.label || key}`));
    group.append(inline);
    if (node.help) {
      group.append(hint(node.help));
    }
    return group;
  } else {
    // text, image (URL/filename), and any not-yet-specialized widget.
    input = document.createElement('input');
    input.type = 'text';
    input.value = obj[key] ?? '';
    input.oninput = () => {
      obj[key] = input.value;
      onChange();
    };
  }

  group.append(labelEl, input);
  if (node.help) {
    group.append(hint(node.help));
  }
  return group;
}

/** @param {string} text @return {HTMLElement} A field hint paragraph. */
function hint(text) {
  const p = document.createElement('p');
  p.className = 'field-hint';
  p.textContent = text;
  return p;
}

/**
 * Renders a repeatable array field: one subform per entry with move/remove
 * controls, plus an add button. Structural edits re-render this widget in
 * place so the rest of the form is undisturbed.
 * @param {Object} node - The array field definition (has `items`).
 * @param {Object} obj - The parent values object.
 * @param {string} key - The array property on obj.
 * @param {Function} onChange - Called after every edit.
 * @return {HTMLElement} The array widget element.
 */
function renderArray(node, obj, key, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'section-array';

  const heading = document.createElement('div');
  heading.className = 'section-array-label';
  heading.textContent = node.label || groupLabel(key);
  wrap.append(heading);

  const list = document.createElement('div');
  list.className = 'section-array-items';
  wrap.append(list);

  if (!Array.isArray(obj[key])) {
    obj[key] = [];
  }

  const renderItems = () => {
    list.replaceChildren();
    obj[key].forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'section-array-item';

      const controls = document.createElement('div');
      controls.className = 'section-array-item-controls';
      for (const [ act, symbol, title ] of [
        [ 'up', '↑', 'Move up' ],
        [ 'down', '↓', 'Move down' ],
        [ 'remove', '✕', 'Remove' ]
      ]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn section-card-control';
        b.textContent = symbol;
        b.title = title;
        b.disabled = (act === 'up' && index === 0) || (act === 'down' && index === obj[key].length - 1);
        b.onclick = () => {
          if (act === 'remove') {
            obj[key].splice(index, 1);
          } else {
            const to = act === 'up' ? index - 1 : index + 1;
            [ obj[key][index], obj[key][to] ] = [ obj[key][to], obj[key][index] ];
          }
          renderItems();
          onChange();
        };
        controls.append(b);
      }
      itemEl.append(controls);
      itemEl.append(renderFields(node.items, item, onChange));
      list.append(itemEl);
    });
  };
  renderItems();

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn section-array-add';
  addBtn.textContent = `+ Add ${(node.label || key).replace(/s$/, '')}`;
  addBtn.onclick = () => {
    obj[key].push(materializeDefaults(node.items));
    renderItems();
    onChange();
  };
  wrap.append(addBtn);
  return wrap;
}

/**
 * Renders a field tree into a fragment, binding controls to the values
 * object. The recursive core of the form generator.
 * @param {Object} fields - The field tree.
 * @param {Object} values - The values object to bind to (mutated in place).
 * @param {Function} onChange - Called after every edit.
 * @return {DocumentFragment} The rendered controls.
 */
export function renderFields(fields, values, onChange) {
  const frag = document.createDocumentFragment();
  for (const [ key, node ] of Object.entries(fields)) {
    if (isArrayField(node)) {
      frag.append(renderArray(node, values, key, onChange));
    } else if (isLeaf(node)) {
      frag.append(renderLeaf(node, values, key, onChange));
    } else if (isGroup(node)) {
      if (!values[key] || typeof values[key] !== 'object') {
        values[key] = materializeDefaults(node);
      }
      frag.append(renderGroup(key, node, values[key], onChange));
    }
  }
  return frag;
}

/**
 * Renders a group of nested fields. `containerFields` collapses into a
 * <details> disclosure; other groups render as a titled field group.
 * @param {string} key - The group's key.
 * @param {Object} node - The group's field tree.
 * @param {Object} groupValues - The group's values object.
 * @param {Function} onChange - Called after every edit.
 * @return {HTMLElement} The group element.
 */
function renderGroup(key, node, groupValues, onChange) {
  if (key === 'containerFields') {
    const details = document.createElement('details');
    details.className = 'section-container-settings';
    const summary = document.createElement('summary');
    summary.textContent = groupLabel(key);
    details.append(summary);
    details.append(renderFields(node, groupValues, onChange));
    return details;
  }

  const fieldset = document.createElement('div');
  fieldset.className = 'section-field-group';
  const title = document.createElement('div');
  title.className = 'section-field-group-label';
  title.textContent = groupLabel(key);
  fieldset.append(title);
  fieldset.append(renderFields(node, groupValues, onChange));
  return fieldset;
}
