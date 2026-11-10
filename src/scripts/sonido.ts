import { PRESETS } from '../data/mock';
import * as api from '../lib/azuracast';
import { $, $$, ahora, toast, cargando } from './comun';

const eqs = $$<HTMLInputElement>('.eq');
let aplicado = [...PRESETS['Música andina']];
const leer = () => eqs.map((e) => Number(e.value));
function poner(v: number[]) { eqs.forEach((e, i) => { e.value = String(v[i]); }); refrescar(); }
function refrescar() {
  leer().forEach((v, i) => { const d = $(`.db[data-i="${i}"]`); d.textContent = `${v > 0 ? '+' : ''}${v} dB`; d.classList.toggle('text-brand', v !== 0); });
  const cambios = leer().some((v, i) => v !== aplicado[i]);
  $('#pendientes').classList.toggle('hidden', !cambios);
  ($('#btn-aplicar') as HTMLButtonElement).disabled = !cambios;
  $('#btn-aplicar').classList.toggle('opacity-40', !cambios);
}
for (const e of eqs) e.addEventListener('input', () => { marcarPreset(''); refrescar(); });
function marcarPreset(p: string) {
  for (const b of $$('.preset')) { const on = b.dataset.p === p; b.className = `preset text-sm px-3 py-1.5 rounded-full border ${on ? 'bg-brand text-gray-950 border-brand font-bold' : 'border-default bg-neutral-tertiary text-heading hover:bg-neutral-tertiary-medium'}`; }
}
for (const b of $$('.preset')) b.addEventListener('click', () => { marcarPreset(b.dataset.p!); poner(PRESETS[b.dataset.p!]); });
$('#btn-descartar').addEventListener('click', () => { poner(aplicado); toast('Cambios descartados', 'Se mantiene el sonido que está al aire.', 'aviso'); });
$('#btn-aplicar').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement; const anterior = [...aplicado], nuevo = leer();
  cargando(b, true, 'Aplicando al aire…'); await api.aplicarSonido(); cargando(b, false, 'Aplicar al aire');
  aplicado = nuevo; refrescar();
  const li = document.createElement('li'); li.innerHTML = `<span class="font-mono text-xs text-brand me-2">${ahora().slice(0, 5)}</span>Ecualizador aplicado (${nuevo.map((v) => (v > 0 ? '+' : '') + v).join(' / ')})`; $('#historial').prepend(li);
  toast('Cambios aplicados al aire', 'Los oyentes ya escuchan el nuevo ecualizador.', 'ok', async () => { await api.aplicarSonido(); aplicado = anterior; poner(anterior); toast('Se restauró el sonido anterior'); });
});
$('#preescucha').addEventListener('change', (e) => toast((e.target as HTMLInputElement).checked ? 'Pre-escucha activada' : 'Pre-escucha desactivada', 'Solo se oye en los audífonos de cabina.', 'aviso'));
for (const r of $$<HTMLInputElement>('.av')) r.addEventListener('input', () => { $(`#v-${r.dataset.id}`).textContent = r.value; $('#pendientes').classList.remove('hidden'); ($('#btn-aplicar') as HTMLButtonElement).disabled = false; $('#btn-aplicar').classList.remove('opacity-40'); });

/* Medición de sonoridad (simulada) */
setInterval(() => {
  const l = -16 + (Math.random() - 0.5) * 1.2, t = -1.2 - Math.random() * 0.6;
  $('#lufs').textContent = l.toFixed(1); $('#tp').textContent = t.toFixed(1);
  $('#lufs-bar').style.width = `${Math.max(5, Math.min(100, (l + 30) / 20 * 100))}%`;
}, 400);
poner(aplicado);
