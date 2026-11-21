const URL_API = "https://rickandmortyapi.com/api/episode";
const CLAVE_STORAGE = "ultimaBusqueda";

const formulario = document.getElementById("formulario");
const campoNombre = document.getElementById("nombre");
const campoTemporada = document.getElementById("temporada");
const boton = document.getElementById("boton");
const mensaje = document.getElementById("mensaje");
const resultados = document.getElementById("resultados");

const mostrarMensaje = (texto, esError = false) => {
  mensaje.textContent = texto;
  mensaje.classList.toggle("mensaje--error", esError);
};

const textoOCompleto = (valor) =>
  valor === "" || valor === null || valor === undefined || valor === "unknown"
    ? "Desconocido"
    : String(valor);

const crearLinea = (etiqueta, valor) => {
  const linea = document.createElement("p");
  linea.textContent = `${etiqueta}: ${textoOCompleto(valor)}`;
  return linea;
};

const crearTarjeta = (episodio) => {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";

  const titulo = document.createElement("h2");
  titulo.textContent = textoOCompleto(episodio.name);

  const codigo = document.createElement("p");
  codigo.className = "tarjeta__codigo";
  codigo.textContent = textoOCompleto(episodio.episode);

  tarjeta.append(
    titulo,
    codigo,
    crearLinea("Emisión", episodio.air_date),
    crearLinea("Personajes", episodio.characters.length)
  );
  return tarjeta;
};

const mostrarTarjetas = (episodios) => {
  resultados.replaceChildren(...episodios.map(crearTarjeta));
};

const guardarBusqueda = (nombre, temporada) => {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ nombre, temporada }));
  } catch (error) {
    console.warn("No se pudo guardar la búsqueda:", error);
  }
};

const leerBusquedaGuardada = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_STORAGE));
  } catch (error) {
    return null;
  }
};

const pedirEpisodios = async (nombre, temporada) => {
  const url = new URL(URL_API);
  if (nombre) url.searchParams.set("name", nombre);
  if (temporada) url.searchParams.set("episode", temporada);

  const respuesta = await fetch(url);
  if (respuesta.status === 404) return [];
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

  const datos = await respuesta.json();
  return datos.results;
};

const buscar = async (nombre, temporada) => {
  if (!nombre && !temporada) {
    mostrarMensaje("Escribe un nombre o elige una temporada para buscar.", true);
    return;
  }

  boton.disabled = true;
  mostrarMensaje("Buscando…");
  resultados.replaceChildren();

  try {
    const episodios = await pedirEpisodios(nombre, temporada);
    if (episodios.length === 0) {
      mostrarMensaje("Sin resultados para esa búsqueda.");
    } else {
      mostrarMensaje(`${episodios.length} episodio(s) encontrado(s).`);
      mostrarTarjetas(episodios);
    }
    guardarBusqueda(nombre, temporada);
  } catch (error) {
    mostrarMensaje("No se pudo completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.", true);
    console.error(error);
  } finally {
    boton.disabled = false;
  }
};

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscar(campoNombre.value.trim(), campoTemporada.value);
});

const restaurarBusqueda = () => {
  const guardada = leerBusquedaGuardada();
  if (!guardada) return;
  campoNombre.value = guardada.nombre ?? "";
  campoTemporada.value = guardada.temporada ?? "";
  buscar(campoNombre.value, campoTemporada.value);
};

restaurarBusqueda();
