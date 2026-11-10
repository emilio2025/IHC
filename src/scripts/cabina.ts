import { Modal } from 'flowbite';
import { INSERTABLES, SONANDO, SIGUIENTE, ESTACION } from '../data/mock';
import * as api from '../lib/azuracast';
import { $, $$, pad, mmss, ahora, vibrar, toast, cargando } from './comun';

/* ---------- Estado de carga inicial (skeleton) ---------- */
api.cargarEstado().then(() => { $('#skeleton').classList.add('hidden'); $('#cabina').classList.remove('hidden'); });

/* ---------- Registro de eventos ---------- */
function evento(texto: string, destacado = false) {
  const li = document.createElement('li');
  li.className = 'ms-4';
  li.innerHTML = `<span class="absolute w-2.5 h-2.5 ${destacado ? 'bg-brand' : 'bg-neutral-quaternary'} rounded-full -start-[5.5px] mt-1.5"></span><span class="font-mono text-xs ${destacado ? 'text-brand' : ''} me-2">${ahora()}</span><span class="text-sm ${destacado ? 'text-heading' : ''}">${texto}</span>`;
  $('#eventos').prepend(li);
}

/* ---------- Sonando ahora ---------- */
let pista = { ...SONANDO }, transcurrido = 108, silenciada = false;
function pintarPista() {
  $('#np-titulo').textContent = pista.titulo;
  $('#np-meta').textContent = `${pista.artista} · ${pista.genero}${pista.lista ? ` · Lista «${pista.lista}»` : ''}`;
  $('#np-dur').textContent = mmss(pista.duracion);
}
setInterval(() => {
  if (silenciada) return;
  transcurrido++;
  if (transcurrido >= pista.duracion) { cambiarPista(); }
  $('#np-restan').textContent = mmss(pista.duracion - transcurrido);
  $('#np-trans').textContent = mmss(transcurrido);
  $('#np-barra').style.width = `${(transcurrido / pista.duracion) * 100}%`;
}, 1000);
function cambiarPista() {
  pista = { ...SIGUIENTE, lista: 'Mañanas andinas' }; transcurrido = 0; pintarPista();
  $('#np-luego').textContent = '«Flor de retama»';
  const primero = $('#cola li'); primero?.remove(); revisarCola();
  evento(`${pista.titulo} al aire (Deck A)`, true);
}
$('#btn-siguiente').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement; cargando(b, true, 'Pasando…');
  await api.siguienteCancion(); cambiarPista(); cargando(b, false, 'Siguiente canción');
  toast('Siguiente canción al aire', pista.titulo);
});

/* ---------- Medidor de voz ---------- */
const VU_N = 24; let micAbierto = false;
const vu = $('#vu');
for (let c = 0; c < 2; c++) {
  const fila = document.createElement('div'); fila.className = 'flex gap-[3px]';
  for (let i = 0; i < VU_N; i++) {
    const s = document.createElement('span');
    const col = i < VU_N * 0.7 ? 'bg-brand' : i < VU_N * 0.88 ? 'bg-amber' : 'bg-onair';
    s.className = `vu-seg h-2.5 flex-1 rounded-[2px] ${col} opacity-15`; fila.appendChild(s);
  }
  vu.appendChild(fila);
}
setInterval(() => {
  const base = micAbierto ? 0.55 + Math.random() * 0.3 : silenciada ? 0 : 0.08 + Math.random() * 0.06;
  for (const fila of Array.from(vu.children)) {
    const lit = Math.round(VU_N * Math.min(1, base + (Math.random() - .5) * .08));
    Array.from(fila.children).forEach((s, i) => ((s as HTMLElement).style.opacity = i < lit ? '1' : '.15'));
  }
  $('#vu-db').textContent = micAbierto ? `${(-20 + base * 14).toFixed(1)} dB` : '-∞ dB';
}, 90);

/* ---------- Acción 1: Hablar al aire — bucle perceptual de 4 fases ---------- */
const hablar = $<HTMLButtonElement>('#btn-hablar');
let micDesde = 0, micTimer = 0;
function estadoHablar(e: 'reposo' | 'procesando' | 'al-aire', texto: string) {
  hablar.dataset.estado = e;
  hablar.querySelector('.txt')!.textContent = texto;
  hablar.querySelector('.spin')!.classList.toggle('hidden', e !== 'procesando');
  hablar.querySelector('.ico')!.classList.toggle('hidden', e !== 'reposo');
  hablar.querySelector('.dot')!.classList.toggle('hidden', e !== 'al-aire');
  hablar.classList.toggle('glow-onair', e === 'al-aire');
  hablar.classList.toggle('bg-onair', e === 'al-aire');
  hablar.classList.toggle('bg-danger-strong', e === 'procesando');
  hablar.setAttribute('aria-pressed', String(e === 'al-aire'));
  const micro = hablar.querySelector('.micro') as HTMLElement;
  micro.style.width = e === 'procesando' ? '45%' : '0%';
}
async function alternarMicrofono() {
  if (hablar.dataset.estado === 'procesando' || silenciada) return;
  vibrar();                                                   // fase 2 (háptica); la visual la da :active en CSS
  if (!micAbierto) {
    estadoHablar('procesando', 'Abriendo micrófono…');        // fase 3
    const lento = setTimeout(() => (hablar.querySelector('.txt')!.textContent = 'Sigue intentando…'), 1000);
    const r = await api.abrirMicrofono(); clearTimeout(lento);
    if (!r.ok) { estadoHablar('reposo', 'Hablar al aire'); toast('No se pudo abrir el micrófono', 'Revisa la conexión y vuelve a intentar.', 'error'); return; }
    micAbierto = true; micDesde = Date.now();                 // fase 4
    estadoHablar('al-aire', 'Micrófono abierto · 0:00');
    micTimer = window.setInterval(() => (hablar.querySelector('.txt')!.textContent = `Micrófono abierto · ${mmss((Date.now() - micDesde) / 1000)}`), 500);
    $('#mic-estado').textContent = 'Abierto'; $('#mic-estado').className = 'bg-danger-soft text-fg-danger text-xs font-bold px-2 py-0.5 rounded-full border border-danger-subtle';
    $('#ducking').classList.remove('hidden'); $('#aire-label').textContent = 'Micrófono abierto';
    evento('Micrófono 1 abierto · música −14 dB', true);
  } else {
    estadoHablar('procesando', 'Cerrando micrófono…');
    await api.cerrarMicrofono(); micCerrado();
  }
}
function micCerrado() {
  clearInterval(micTimer);
  const dur = mmss((Date.now() - micDesde) / 1000);
  micAbierto = false; estadoHablar('reposo', 'Hablar al aire');
  $('#mic-estado').textContent = 'Cerrado'; $('#mic-estado').className = 'bg-neutral-tertiary text-body text-xs font-medium px-2 py-0.5 rounded-full border border-default';
  $('#ducking').classList.add('hidden'); $('#aire-label').textContent = silenciada ? 'Emisora en silencio' : 'Estás al aire';
  evento(`Micrófono 1 cerrado (${dur})`);
}
hablar.addEventListener('click', alternarMicrofono);

/* ---------- Acción 2: cartuchos de pauta ---------- */
let cartSonando: HTMLElement | null = null;
let cartDetener: (() => void) | null = null;
async function lanzar(c: HTMLElement) {
  if (silenciada) return;
  if (c.dataset.estado !== 'reposo') return;                  // evita doble emisión
  if (cartSonando) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); toast(`Espera a que termine «${cartSonando.dataset.nombre}»`, 'Solo suena una pieza de la pauta a la vez.', 'aviso'); return; }
  vibrar();
  const durTxt = c.querySelector('.durtxt')!, micro = c.querySelector('.micro') as HTMLElement, tipo = c.querySelector('.tipo')!;
  const tipoOrig = tipo.textContent!, durOrig = durTxt.textContent!;
  c.dataset.estado = 'cargando';                              // fase 3
  c.querySelector('.spin')!.classList.remove('hidden'); durTxt.textContent = 'cargando…';
  c.classList.add('bg-amber/10', 'border-amber/60'); micro.style.width = '35%';
  await api.lanzarCartucho(c.dataset.id!);
  c.dataset.estado = 'sonando'; cartSonando = c;              // fase 4
  c.querySelector('.spin')!.classList.add('hidden');
  c.classList.remove('bg-amber/10'); c.classList.add('bg-amber/20', 'border-amber', 'glow-amber');
  tipo.textContent = '● SONANDO'; tipo.classList.replace('text-amber', 'text-heading');
  evento(`${tipoOrig === 'JINGLE' ? 'Jingle' : 'Cuña'} «${c.dataset.nombre}» al aire`, true);
  const total = Number(c.dataset.dur); let resta = total;
  durTxt.textContent = mmss(resta); micro.style.width = '0%';
  const fin = (texto: string) => {
    clearInterval(t); c.dataset.estado = 'reposo'; cartSonando = null; cartDetener = null;
    c.classList.remove('bg-amber/20', 'border-amber', 'glow-amber', 'border-amber/60');
    tipo.textContent = tipoOrig; tipo.classList.replace('text-heading', 'text-amber'); durTxt.textContent = durOrig; micro.style.width = '0%';
    evento(texto);
  };
  const t = setInterval(() => {
    resta--; durTxt.textContent = mmss(Math.max(0, resta)); micro.style.width = `${((total - resta) / total) * 100}%`;
    if (resta <= 0) fin(`«${c.dataset.nombre}» terminó`);
  }, 1000);
  cartDetener = () => fin(`«${c.dataset.nombre}» cortado por silencio`);
}
for (const c of $$('.cart')) c.addEventListener('click', () => lanzar(c));

/* ---------- Atajos de teclado ---------- */
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (t.matches('input, textarea') || document.querySelector('[role="dialog"]:not(.hidden)')) return;
  if (e.code === 'Space') { e.preventDefault(); hablar.classList.add('scale-95'); setTimeout(() => hablar.classList.remove('scale-95'), 90); alternarMicrofono(); }
  const c = $$('.cart').find((x) => x.dataset.tecla === e.key);
  if (c) { e.preventDefault(); lanzar(c); }
});

/* ---------- Cola del AutoDJ ---------- */
function revisarCola() { const vacia = $$('#cola li').length === 0; $('#cola-vacia').classList.toggle('hidden', !vacia); }
function agregarACola(nombre: string) {
  const cat = INSERTABLES.find((x) => x.nombre === nombre)?.categoria ?? 'Canción';
  const tipo = cat === 'Canción' ? 'Canción' : cat === 'Jingle e ID' ? 'Jingle' : 'Cuña';
  const badge = tipo === 'Canción' ? 'bg-success-soft text-fg-success border-brand/40' : tipo === 'Jingle' ? 'bg-aqua/10 text-aqua border-aqua/40' : 'bg-warning-soft text-fg-warning border-amber/40';
  const li = document.createElement('li'); li.className = 'flex items-center gap-3 py-2 bg-brand-soft/60 transition-colors duration-1000';
  li.innerHTML = `<span class="font-mono text-xs text-brand tabular">siguiente</span><span class="flex-1 text-sm text-heading truncate">${nombre}</span><span class="text-xs font-medium px-2 py-0.5 rounded-full border ${badge}">${tipo}</span>`;
  $('#cola').prepend(li); setTimeout(() => li.classList.remove('bg-brand-soft/60'), 1200); revisarCola();
  return li;
}
$('#btn-sim-vacio').addEventListener('click', () => { $('#cola').innerHTML = ''; revisarCola(); });

/* ---------- Modal Insertar (Actividad 8: 3 categorías + búsqueda predictiva) ---------- */
const modalIns = new Modal($('#modal-insertar'), { backdrop: 'dynamic', closable: true });
let categoria = 'Cuña y pauta';
const tpl = $<HTMLTemplateElement>('#tpl-insertable');
function pintarLista() {
  const q = $<HTMLInputElement>('#ins-buscar').value.trim().toLowerCase();
  const lista = $('#ins-lista'); lista.innerHTML = '';
  const items = INSERTABLES.filter((x) => x.categoria === categoria && (!q || x.nombre.toLowerCase().includes(q)));
  for (const it of items) {
    const n = tpl.content.cloneNode(true) as DocumentFragment;
    const b = n.querySelector('button')!; b.dataset.nombre = it.nombre;
    n.querySelector('.txt')!.textContent = it.nombre; n.querySelector('.meta')!.textContent = it.meta;
    lista.appendChild(n);
  }
  if (!items.length) lista.innerHTML = `<li class="px-3 py-4 text-sm text-center">Sin resultados para «${q}» en ${categoria}.</li>`;
}
for (const t of $$('.ins-tab')) t.addEventListener('click', () => {
  categoria = t.dataset.cat!;
  for (const x of $$('.ins-tab')) { const on = x === t; x.classList.toggle('bg-brand', on); x.classList.toggle('text-gray-950', on); x.classList.toggle('font-bold', on); x.classList.toggle('text-body', !on); }
  $<HTMLInputElement>('#ins-buscar').placeholder = `Busca dentro de «${categoria}» (2–3 letras)`;
  $('#ins-sugerida').classList.toggle('hidden', categoria !== 'Cuña y pauta');
  pintarLista();
});
$('#ins-buscar').addEventListener('input', pintarLista);
$('#modal-insertar').addEventListener('click', async (e) => {
  const b = (e.target as HTMLElement).closest('.ins-item') as HTMLElement | null; if (!b) return;
  const original = b.querySelector('.txt')!.textContent!;
  cargando(b, true); await api.insertarEnCola(b.dataset.nombre!); cargando(b, false, original);
  modalIns.hide();
  const li = agregarACola(b.dataset.nombre!);
  evento(`«${b.dataset.nombre}» insertado en la cola`);
  toast('Insertado en la cola', `«${b.dataset.nombre}» sonará a continuación.`, 'ok', () => { li.remove(); revisarCola(); evento(`Inserción de «${b.dataset.nombre}» deshecha`); });
});
const abrirInsertar = () => { $<HTMLInputElement>('#ins-buscar').value = ''; pintarLista(); modalIns.show(); setTimeout(() => $('#ins-buscar').focus(), 50); };
$('#btn-abrir-insertar').addEventListener('click', abrirInsertar);
$('#cola-vacia button').addEventListener('click', abrirInsertar);

/* ---------- Modal Silenciar (Actividad 9: frase + casilla + conteo de 3 s) ---------- */
const modalSil = new Modal($('#modal-silenciar'), { backdrop: 'static', closable: true });
const silIn = $<HTMLInputElement>('#sil-input'), silCk = $<HTMLInputElement>('#sil-check'), silBtn = $<HTMLButtonElement>('#sil-confirmar');
let conteo = 0, conteoTimer = 0, habilitado = false;
function setHabilitado(on: boolean, texto: string) {
  habilitado = on; silBtn.setAttribute('aria-disabled', String(!on));
  silBtn.classList.toggle('opacity-40', !on); silBtn.classList.toggle('cursor-not-allowed', !on); silBtn.classList.toggle('glow-onair', on);
  silBtn.querySelector('.txt')!.textContent = texto;
}
function validarSilencio() {
  const coincide = silIn.value.trim() === 'SILENCIAR';
  $('#sil-coincide').classList.toggle('hidden', !coincide);
  silIn.classList.toggle('border-brand', coincide);
  clearInterval(conteoTimer); $('#sil-conteo').classList.add('hidden');
  if (coincide && silCk.checked) {
    $('#sil-error').classList.add('hidden');
    conteo = 3; setHabilitado(false, `Silenciar emisora (${conteo})`);
    const c = $('#sil-conteo'); c.classList.remove('hidden'); c.textContent = `Espera ${conteo} s: tiempo para arrepentirte antes de cortar la señal.`;
    conteoTimer = window.setInterval(() => {
      conteo--;
      if (conteo > 0) { setHabilitado(false, `Silenciar emisora (${conteo})`); c.textContent = `Espera ${conteo} s: tiempo para arrepentirte antes de cortar la señal.`; }
      else { clearInterval(conteoTimer); setHabilitado(true, 'Silenciar emisora ahora'); c.textContent = 'Confirmación completa. Ya puedes silenciar la emisora.'; c.classList.replace('text-fg-warning', 'text-fg-success'); }
    }, 1000);
  } else setHabilitado(false, 'Silenciar emisora');
}
silIn.addEventListener('input', validarSilencio); silCk.addEventListener('change', validarSilencio);
silBtn.addEventListener('click', async () => {
  if (!habilitado) { $('#sil-error').classList.remove('hidden'); silBtn.classList.remove('shake'); void silBtn.offsetWidth; silBtn.classList.add('shake'); return; }
  cargando(silBtn, true, 'Silenciando…'); await api.silenciarEmisora(); cargando(silBtn, false);
  modalSil.hide(); silenciar(true);
});
$('#btn-abrir-silenciar').addEventListener('click', () => {
  silIn.value = ''; silCk.checked = false; $('#sil-error').classList.add('hidden');
  $('#sil-conteo').classList.replace('text-fg-success', 'text-fg-warning'); validarSilencio();
  $('#sil-oyentes').textContent = String(ESTACION.oyentes); modalSil.show(); setTimeout(() => silIn.focus(), 50);
});
for (const b of $$('[data-cerrar="modal-silenciar"]')) b.addEventListener('click', () => { clearInterval(conteoTimer); modalSil.hide(); });
for (const b of $$('[data-cerrar="modal-insertar"]')) b.addEventListener('click', () => modalIns.hide());

let silTimer = 0;
function silenciar(on: boolean) {
  if (on) { if (micAbierto) micCerrado(); cartDetener?.(); }
  silenciada = on;
  for (const b of [hablar, $<HTMLButtonElement>('#btn-siguiente'), ...$$<HTMLButtonElement>('.cart')]) { b.disabled = on; b.classList.toggle('opacity-40', on); b.classList.toggle('cursor-not-allowed', on); }
  $('#aire-label').textContent = on ? 'Emisora en silencio' : 'Estás al aire';
  $('#alerta-silencio').classList.toggle('hidden', !on);
  $('#aire-circulo').classList.toggle('bg-onair/90', !on); $('#aire-circulo').classList.toggle('bg-neutral-tertiary-medium', on);
  $('#aire-titulo').textContent = on ? 'SILENCIO' : 'AL AIRE';
  $('#badge-aire-txt').textContent = on ? 'SILENCIO' : 'AL AIRE';
  if (on) {
    const desde = Date.now(); evento('Emisora silenciada por el operador', true);
    silTimer = window.setInterval(() => ($('#silencio-t').textContent = `${Math.floor((Date.now() - desde) / 1000)} s`), 500);
  } else { clearInterval(silTimer); evento('AutoDJ reanudado · señal restablecida', true); }
}
$('#btn-reanudar').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLElement; b.textContent = 'Reanudando…';
  await api.reanudarAutoDJ(); b.textContent = 'Reanudar AutoDJ'; silenciar(false); toast('Señal restablecida', 'El AutoDJ volvió al aire.');
});

/* ---------- Estado de error: corte de conexión simulado ---------- */
let retryT = 0;
function conexion(perdida: boolean) {
  $('#alerta-conexion').classList.toggle('hidden', !perdida);
  clearInterval(retryT);
  if (perdida) {
    let s = 5; $('#reintento-txt').textContent = `Reintentando en ${s} s…`;
    retryT = window.setInterval(() => { s--; $('#reintento-txt').textContent = `Reintentando en ${s} s…`; if (s <= 0) conexion(false); }, 1000);
    evento('Conexión con AzuraCast perdida');
  } else evento('Conexión con AzuraCast restablecida');
}
$('#btn-sim-error').addEventListener('click', () => conexion(true));
$('#btn-reintentar').addEventListener('click', () => conexion(false));

/* ---------- Tiempo al aire del programa ---------- */
let aire = 24 * 60 + 13;
setInterval(() => { if (!silenciada) { aire++; $('#aire-tiempo').textContent = `${pad(Math.floor(aire / 3600))}:${pad(Math.floor(aire / 60) % 60)}:${pad(aire % 60)}`; } }, 1000);
pintarPista();
