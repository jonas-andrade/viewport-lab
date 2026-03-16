// Dictionary.js
// Painel fixo no rodapé do panel-wrap
// Clicar em label de binding → exibe definição + link para docs
// NÃO decora: valores de dropdown, botões de ação, inputs numéricos

export function initDictionary(containerEl, labelMap) {
  containerEl.innerHTML = `
    <div id="vlab-dict">
      <div id="vlab-dict-idle">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="flex-shrink:0;opacity:0.35">
          <rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/>
          <rect x="2" y="7" width="10" height="2" rx="1" fill="currentColor"/>
          <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor"/>
        </svg>
        <span>Clique em um label para ver a definição</span>
      </div>
      <div id="vlab-dict-active">
        <div id="vlab-dict-top">
          <code id="vlab-dict-term"></code>
          <a id="vlab-dict-link" href="#" target="_blank" title="Abrir documentação Three.js">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M8 1h3v3M11 1L6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            docs
          </a>
        </div>
        <p id="vlab-dict-desc"></p>
      </div>
    </div>
  `

  const idle    = containerEl.querySelector('#vlab-dict-idle')
  const active  = containerEl.querySelector('#vlab-dict-active')
  const termEl  = containerEl.querySelector('#vlab-dict-term')
  const descEl  = containerEl.querySelector('#vlab-dict-desc')
  const linkEl  = containerEl.querySelector('#vlab-dict-link')

  active.style.display = 'none'

  function show(entry) {
    termEl.textContent = entry.label
    descEl.textContent = entry.desc
    if (entry.url) {
      linkEl.href = entry.url
      linkEl.style.display = 'inline-flex'
    } else {
      linkEl.style.display = 'none'
    }
    idle.style.display   = 'none'
    active.style.display = 'block'
  }

  // ── decorateAll ───────────────────────────────────────────────────────────
  // APENAS decora .tp-lblv_l (labels de binding como "Shape", "Roughness")
  // NÃO decora: .tp-lstv (list item), .tp-btnv_t (botão), .tp-fldv_t (folder title)
  // Isso evita que valores de dropdown ("Albedo Map", "FrontSide") se tornem clicáveis
  function decorateAll(panelEl) {
    panelEl.querySelectorAll('.tp-lblv_l').forEach(el => {
      if (el.hasAttribute('data-dict-done')) return
      const text = el.textContent.trim()
      const entry = findEntry(labelMap, text)
      if (entry) {
        el.setAttribute('data-dict-done', '1')
        el.classList.add('dict-label')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          show(entry)
        })
      }
    })
  }

  // API para exibir programaticamente (ex: ao mudar um dropdown)
  function showByKey(key) {
    const entry = labelMap[key]
    if (entry) show(entry)
  }

  return { decorateAll, showByKey, show }
}

// ── Matching contra LabelMap ──────────────────────────────────────────────────
// Match estrito: só exato ou limpeza de sufixos simples
// Não usa match parcial agressivo para não capturar labels errados
function findEntry(labelMap, rawText) {
  if (!rawText) return null
  const t = rawText.toLowerCase().trim()

  // 1. Exato
  for (const k in labelMap) {
    if (labelMap[k].label.toLowerCase() === t) return labelMap[k]
  }

  // 2. Remove sufixos comuns e tenta novamente
  const tClean = t.replace(/[°\s×()\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const k in labelMap) {
    const lClean = labelMap[k].label.toLowerCase().replace(/[°\s×()\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    if (lClean === tClean) return labelMap[k]
  }

  // 3. Chave direta (snake_case → lowercase sem underscore)
  for (const k in labelMap) {
    if (k.replace(/_/g, ' ') === t) return labelMap[k]
  }

  return null
}