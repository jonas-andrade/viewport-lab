// Dictionary.js
// Painel fixo no rodapé do panel-wrap
// Clicar em qualquer label do Tweakpane com match no LabelMap → exibe definição

export function initDictionary(containerEl, labelMap) {
  containerEl.innerHTML = `
    <div id="vlab-dict">
      <div id="vlab-dict-idle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
          <circle cx="8" cy="8" r="7" stroke="#333" stroke-width="1.2"/>
          <path d="M8 7v5M8 5v1" stroke="#444" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span>Clique em um label para ver a definição</span>
      </div>
      <div id="vlab-dict-active">
        <div id="vlab-dict-top">
          <span id="vlab-dict-term"></span>
          <button id="vlab-dict-close" title="Fechar">✕</button>
        </div>
        <div id="vlab-dict-body">
          <span id="vlab-dict-tag">definição</span>
          <p id="vlab-dict-desc"></p>
        </div>
      </div>
    </div>
  `

  const idle    = containerEl.querySelector('#vlab-dict-idle')
  const active  = containerEl.querySelector('#vlab-dict-active')
  const termEl  = containerEl.querySelector('#vlab-dict-term')
  const descEl  = containerEl.querySelector('#vlab-dict-desc')
  const closeBtn = containerEl.querySelector('#vlab-dict-close')

  // Estado inicial
  active.style.display = 'none'

  closeBtn.addEventListener('click', () => {
    active.style.display = 'none'
    idle.style.display = 'flex'
  })

  function show(term, desc) {
    termEl.textContent = term
    descEl.textContent = desc
    idle.style.display   = 'none'
    active.style.display = 'block'
  }

  // ── decorateAll ───────────────────────────────────────────────────────────
  // Percorre todos os labels do Tweakpane e adiciona comportamento de clique
  // Tweakpane usa .tp-lblv_l para labels de binding
  // Folders usam .tp-fldv_t (não decoramos folders, apenas bindings)
  function decorateAll(panelEl) {
    // Labels de binding — texto ao lado do controle (ex: "Shape", "FOV", "Roughness")
    panelEl.querySelectorAll('.tp-lblv_l').forEach(el => {
      if (el.hasAttribute('data-dict-done')) return
      const text = el.textContent.trim()
      const entry = findEntry(labelMap, text)
      if (entry) {
        el.setAttribute('data-dict-done', '1')
        el.classList.add('dict-label')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          show(entry.label, entry.desc)
        })
      }
    })

    // Também decora títulos de sub-folders (ex: "PBR Properties", "Fog Settings")
    panelEl.querySelectorAll('.tp-fldv_t').forEach(el => {
      if (el.hasAttribute('data-dict-done')) return
      const raw = el.textContent.trim()
      // Remove ícones unicode do início
      const text = raw.replace(/^[\u2600-\u27BF\u{1F300}-\u{1F9FF}]\s*/u, '').trim()
      const entry = findEntry(labelMap, text)
      if (entry) {
        el.setAttribute('data-dict-done', '1')
        el.classList.add('dict-label')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          show(entry.label, entry.desc)
        })
      }
    })
  }

  return { decorateAll }
}

// ── Matching contra LabelMap ──────────────────────────────────────────────────
function findEntry(labelMap, rawText) {
  if (!rawText) return null
  const t = rawText.toLowerCase().trim()

  // 1. Exato pelo label
  for (const k in labelMap) {
    if (labelMap[k].label.toLowerCase() === t) return labelMap[k]
  }

  // 2. Label sem sufixo como "°" "×" ou parênteses
  const tClean = t.replace(/[°×()]/g, '').trim()
  for (const k in labelMap) {
    if (labelMap[k].label.toLowerCase().replace(/[°×()]/g, '').trim() === tClean) return labelMap[k]
  }

  // 3. label está contido no texto
  for (const k in labelMap) {
    const lbl = labelMap[k].label.toLowerCase()
    if (t.includes(lbl) && lbl.length > 3) return labelMap[k]
  }

  // 4. texto está contido no label
  for (const k in labelMap) {
    const lbl = labelMap[k].label.toLowerCase()
    if (lbl.includes(t) && t.length > 3) return labelMap[k]
  }

  // 5. chave do mapa bate (underscore → space)
  for (const k in labelMap) {
    const kn = k.replace(/_/g, ' ')
    if (kn === t || t.includes(kn) || kn.includes(t)) return labelMap[k]
  }

  return null
}