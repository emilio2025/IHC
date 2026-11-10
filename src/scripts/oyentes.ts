import ApexCharts from 'apexcharts';
import { MENSAJES, OYENTES_HORA } from '../data/mock';
import * as api from '../lib/azuracast';
import { $, toast, cargando } from './comun';

/* ---------- Gráfico (Flowbite charts usa ApexCharts) ---------- */
const grafico = new ApexCharts($('#grafico'), {
  chart: { type: 'area', height: 290, fontFamily: 'Manrope, sans-serif', toolbar: { show: false }, background: 'transparent', zoom: { enabled: false } },
  theme: { mode: 'dark' },
  series: [{ name: 'Hoy', data: OYENTES_HORA.hoy }, { name: 'Ayer', data: OYENTES_HORA.ayer }],
  xaxis: { categories: OYENTES_HORA.horas.map((h) => `${h}:00`), labels: { style: { colors: '#8FA39D' } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#8FA39D' } } },
  colors: ['#10F5A0', '#22D3EE'],
  fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.02 } },
  stroke: { curve: 'smooth', width: [3, 2], dashArray: [0, 5] },
  dataLabels: { enabled: false },
  grid: { borderColor: '#1D2E29', strokeDashArray: 4 },
  legend: { labels: { colors: '#F2FFF9' }, position: 'top', horizontalAlign: 'right' },
  tooltip: { theme: 'dark', y: { formatter: (v: number) => `${v} oyentes` } },
});
grafico.render();
document.addEventListener('nivel', () => setTimeout(() => grafico.updateOptions({}), 50));

/* ---------- Oyentes en vivo (simulado) ---------- */
let ahora = 128;
setInterval(() => { ahora = Math.max(90, Math.min(190, ahora + Math.round((Math.random() - 0.5) * 6))); $('#k-ahora').textContent = String(ahora); }, 3000);

/* ---------- Mensajes: leer al aire ---------- */
const spin = $<HTMLTemplateElement>('#tpl-spin').innerHTML;
let pendientes = MENSAJES.map((m) => ({ ...m }));
const viaColor: Record<string, string> = { WhatsApp: 'text-fg-success', Facebook: 'text-aqua', Web: 'text-fg-warning' };
function pintar() {
  $('#mensajes').innerHTML = pendientes.map((m) => `
    <li class="p-3 rounded-base border border-default bg-neutral-tertiary" data-id="${m.id}">
      <div class="flex items-center justify-between text-xs"><span><b class="text-heading">${m.de}</b> · <span class="${viaColor[m.via]}">${m.via}</span> · ${m.lugar}</span><span class="font-mono">${m.hora}</span></div>
      <p class="text-sm text-heading mt-1.5">${m.texto}</p>
      <div class="flex justify-end gap-3 mt-2">
        <button class="descartar text-xs text-body hover:text-heading underline">Descartar</button>
        <button class="leer inline-flex items-center text-xs font-bold text-brand hover:underline"><span class="spin hidden">${spin}</span><span class="txt">Leer al aire →</span></button>
      </div></li>`).join('');
  const n = pendientes.length;
  $('#k-msg').textContent = String(n); $('#badge-msg').textContent = n ? `${n} nuevos` : 'Al día';
  $('#sin-msg').classList.toggle('hidden', n > 0);
}
$('#mensajes').addEventListener('click', async (e) => {
  const t = e.target as HTMLElement; const li = t.closest('li') as HTMLElement | null; if (!li) return;
  const i = pendientes.findIndex((m) => m.id === li.dataset.id); const m = pendientes[i];
  const quitar = () => { pendientes.splice(pendientes.indexOf(m), 1); pintar(); };
  const leer = t.closest('.leer') as HTMLElement | null;
  if (leer) { cargando(leer, true, 'Marcando…'); await api.marcarLeido(m.id); quitar(); toast('Mensaje leído al aire', `De ${m.de} (${m.lugar}).`, 'ok', () => { pendientes.splice(i, 0, m); pintar(); }); }
  else if (t.closest('.descartar')) { quitar(); toast('Mensaje descartado', '', 'aviso', () => { pendientes.splice(i, 0, m); pintar(); }); }
});
pintar();

/* ---------- Reporte para anunciantes (CSV real) ---------- */
$('#btn-reporte').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement; cargando(b, true, 'Generando reporte…'); await api.generarReporte(); cargando(b, false, '⇩ Reporte para anunciantes');
  const filas = [['Hora', 'Oyentes hoy', 'Oyentes ayer'], ...OYENTES_HORA.horas.map((h, i) => [`${h}:00`, OYENTES_HORA.hoy[i], OYENTES_HORA.ayer[i]])];
  const blob = new Blob(['﻿' + filas.map((f) => f.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'reporte_oyentes_sol_andino.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('Reporte generado', 'Se descargó reporte_oyentes_sol_andino.csv.');
});
