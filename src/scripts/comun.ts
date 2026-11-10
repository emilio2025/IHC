// Utilidades compartidas por todos los módulos (barra superior, nivel, toasts, loaders).
import { initFlowbite } from 'flowbite';
import type { Nivel } from '../data/mock';

export const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
export const pad = (n: number) => String(n).padStart(2, '0');
export const mmss = (s: number) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
export const ahora = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
export const vibrar = () => { try { navigator.vibrate?.(10); } catch { /* sin soporte */ } };

initFlowbite();

/* Reloj de la barra superior */
const reloj = () => { const r = document.getElementById('reloj'); if (r) r.textContent = ahora(); };
setInterval(reloj, 1000); reloj();

/* Nivel de interfaz: se recuerda entre módulos */
const NOMBRE: Record<Nivel, string> = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };
export function aplicarNivel(n: Nivel) {
  const t = document.getElementById('nivel-txt'); if (t) t.textContent = NOMBRE[n];
  for (const el of $$('[data-niveles]')) el.style.display = el.dataset.niveles!.split(' ').includes(n) ? '' : 'none';
  try { localStorage.setItem('nivel', n); } catch { /* almacenamiento no disponible */ }
  document.dispatchEvent(new CustomEvent('nivel', { detail: n }));
}
export function nivelActual(): Nivel { try { return (localStorage.getItem('nivel') as Nivel) || 'intermedio'; } catch { return 'intermedio'; } }
for (const b of $$('[data-nivel]')) b.addEventListener('click', () => { aplicarNivel(b.dataset.nivel as Nivel); document.getElementById('dd-nivel')?.classList.add('hidden'); });
aplicarNivel(nivelActual());

/* Toasts (Flowbite toast) */
export function toast(titulo: string, detalle = '', tipo: 'ok' | 'aviso' | 'error' = 'ok', deshacer?: () => void) {
  const color = tipo === 'ok' ? 'text-fg-success bg-success-soft' : tipo === 'aviso' ? 'text-fg-warning bg-warning-soft' : 'text-fg-danger bg-danger-soft';
  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.className = 'flex items-center w-full p-4 text-body bg-neutral-primary-medium border border-default rounded-base shadow-lg transition-opacity duration-300';
  el.innerHTML = `<div class="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-base font-bold ${color}">${tipo === 'ok' ? '✓' : '!'}</div>
    <div class="ms-3 text-sm flex-1"><p class="font-semibold text-heading">${titulo}</p>${detalle ? `<p class="text-xs">${detalle}</p>` : ''}</div>
    ${deshacer ? '<button class="undo ms-2 text-sm font-semibold text-brand hover:underline">Deshacer</button>' : ''}
    <button class="close ms-2 text-body hover:text-heading rounded-base w-8 h-8" aria-label="Cerrar">✕</button>`;
  const cerrar = () => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); };
  el.querySelector('.close')!.addEventListener('click', cerrar);
  el.querySelector('.undo')?.addEventListener('click', () => { deshacer!(); cerrar(); });
  let cont = document.getElementById('toasts');
  if (!cont) { cont = document.createElement('div'); cont.id = 'toasts'; cont.className = 'fixed bottom-5 right-5 z-[60] flex flex-col gap-3 w-[min(92vw,380px)]'; document.body.appendChild(cont); }
  cont.appendChild(el);
  setTimeout(cerrar, deshacer ? 10000 : 5000);
}

/* Patrón Flowbite «Button with loader» */
export function cargando(btn: HTMLElement, on: boolean, texto?: string) {
  btn.querySelector('.spin')?.classList.toggle('hidden', !on);
  if (texto) { const t = btn.querySelector('.txt'); if (t) t.textContent = texto; }
  (btn as HTMLButtonElement).disabled = on;
}

/* Sacudida breve para acciones rechazadas */
export function sacudir(el: HTMLElement) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
