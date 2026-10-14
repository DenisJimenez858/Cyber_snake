# 🕹️ Cyber Snake // Retro Arcade Experience

Un mini juego web interactivo desarrollado con estética retro-cyberpunk, efectos de partículas, síntesis de audio 8-bit en tiempo real y selector de dificultades.

---

## 🚀 Cómo abrir y jugar

No requiere ninguna instalación ni dependencias externas. Puedes probarlo de dos maneras:

### Opción 1: Abrir directamente en tu navegador
1. Ve a la carpeta `C:\Users\dnsji\OneDrive\Escritorio\Antigravity`.
2. Haz doble clic en el archivo **`index.html`**.
3. ¡Listo! Se abrirá instantáneamente en tu navegador predeterminado (Chrome, Edge, Firefox, etc.).

### Opción 2: Desde Visual Studio Code
- Si tienes la extensión **Live Server**, haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.

---

## 🎮 Controles
- **Mover la Serpiente:**
  - Teclas de flecha: `▲` `▼` `◀` `▶`
  - Teclas de juego: `W`, `A`, `S`, `D`
  - Botones táctiles / D-Pad en pantalla para mouse o pantallas táctiles.
- **Pausa / Reanudar:** Barra espaciadora o tecla `P` (o botón "PAUSA").
- **Comenzar / Reiniciar:** Barra espaciadora o botón "COMENZAR PARTIDA".

---

## ✨ Características Técnicas
1. **Audio Sintetizado 8-bit:** Desarrollado con la **Web Audio API** nativa de JavaScript. No requiere archivos de audio externos y genera ondas cuadradas y de sierra para sonidos arcade retro.
2. **Sistema de Partículas:** Explosiones de chispas de neón en Canvas cuando recoges comida o la gema dorada especial.
3. **Efecto Monitor CRT Retro:** Filtro de líneas de barrido (scanlines) que se puede activar o desactivar con un clic.
4. **Sistema de Récords y Combos:**
   - Multiplicador de combo que aumenta si recoges comida rápidamente (`x1.0` a `x4.0`).
   - Récord persistente guardado en el navegador con `localStorage`.
5. **Niveles y Dificultad Dinámica:** 4 modos de juego (*Cadete*, *Piloto*, *Ciberpunk*, *Hyperdrive*) con aceleración progresiva conforme subes de nivel.

