// Tooltip.js
// Sistema global de tooltip com delay de 1 segundo
// Lê data-tooltip (desc PT-BR) e data-term (termo EN) do elemento alvo

export function initTooltip() {
  const box = document.createElement('div')
  box.id = 'vlab-tooltip'
  box.innerHTML = `
    <div class="tip-header">
      <span class="tip-dot"></span>
      <span class="tip-term" id="tip-term"></span>
    </div>
    <div class="tip-body">
      <div class="tip-label">definição</div>
      <div class="tip-desc" id="tip-desc"></div>
    </div>
  `
  document.body.appendChild(box)

  const termEl = box.querySelector('#tip-term')
  const descEl = box.querySelector('#tip-desc')

  let timer   = null
  let current = null

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]')
    if (!target || target === current) return

    current = target
    clearTimeout(timer)

    timer = setTimeout(() => {
      const desc = target.getAttribute('data-tooltip')
      const term = target.getAttribute('data-term') || ''
      if (!desc) return

      termEl.textContent = term
      descEl.textContent = desc

      // Mostra o header só se tiver termo
      box.querySelector('.tip-header').style.display = term ? 'flex' : 'none'

      box.classList.add('visible')
      _position(e)
    }, 1000)
  })

  document.addEventListener('mousemove', (e) => {
    if (box.classList.contains('visible')) _position(e)
  })

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]')
    if (!target) return
    current = null
    clearTimeout(timer)
    box.classList.remove('visible')
  })

  function _position(e) {
    const margin = 14
    const bw = box.offsetWidth
    const bh = box.offsetHeight
    const ww = window.innerWidth
    const wh = window.innerHeight

    let x = e.clientX + margin
    let y = e.clientY + margin

    if (x + bw > ww - margin) x = e.clientX - bw - margin
    if (y + bh > wh - margin) y = e.clientY - bh - margin

    box.style.left = `${x}px`
    box.style.top  = `${y}px`
  }
}