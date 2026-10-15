# 🕹️ Cyber Snake // Retro Arcade Ultimate Edition v2.0

Un juego web arcade interactivo estilo retro-cyberpunk con múltiples modos de juego, sistema de power-ups, música de fondo chiptune sintetizada en tiempo real, vibración háptica en móviles y Salón de la Fama Arcade (Top 5).

---

## 🚀 Cómo jugar

### Opción 1: En línea desde cualquier dispositivo
Puedes jugarlo en vivo a través de GitHub Pages:
**[https://denisjimenez858.github.io/Cyber_snake/](https://denisjimenez858.github.io/Cyber_snake/)**

### Opción 2: Abrir localmente
1. Abre la carpeta `C:\Users\dnsji\OneDrive\Escritorio\Antigravity`.
2. Haz doble clic en **`index.html`** para abrirlo en tu navegador.

---

## 🎮 Modos de Juego
- 🌟 **Clásico:** La experiencia arcade pura. Aumenta la velocidad y sube de nivel con cada 5 comidas.
- ⏳ **Contrarreloj (Time Attack):** Inicias con 60 segundos. Cada comida añade +3s y la gema dorada +6s. ¡Consigue la mayor puntuación antes de que el reloj llegue a 0!
- 🧱 **Laberinto (Obstáculos):** Barreras láser fijas aparecen en el mapa y aumentan con cada nivel. Chocar contra ellas es fatal a menos que tengas el Modo Fantasma.
- 🌀 **Portales:** Dos vórtices de energía (Portal Azul y Naranja). Entrar por uno te proyecta al instante por el otro con la misma dirección y velocidad.

---

## ⚡ Power-ups y Objetos Especiales
Durante la partida aparecerán orbes con un anillo de cuenta regresiva:
- 🧲 **Imán de Neón:** Atrae automáticamente la comida y gemas cercanas hacia la cabeza de la serpiente por 7 segundos.
- ⏱️ **Slow-Mo (Cámara Lenta):** Reduce la velocidad de movimiento un 40% durante 7 segundos para salvarte de giros cerrados.
- 👻 **Modo Fantasma:** La serpiente se vuelve translúcida y puede atravesar su propio cuerpo, las barreras láser y los bordes de la pantalla sin morir.
- ✂️ **Tijera Reductora:** Corta la longitud de la cola a la mitad inmediatamente y te otorga +50 puntos de bonificación.
- ⭐ **Gema Dorada:** Otorga +60 puntos instantáneos multiplicados por tu combo actual.

---

## 🎨 Selector de Skins y Temas
- 🌆 **Cyberpunk:** Estética futurista original en tonos Cyan y Rosa Neón.
- 📟 **Matrix:** Código digital cayendo en el fondo (lluvia de caracteres verdes) y estilo fósforo verde terminal.
- 🌅 **Vaporwave:** Paleta nostálgica de los 80s con tonos violeta, rosa pastel y naranja atardecer.
- 🌈 **Arcoíris RGB:** Cada segmento de la serpiente calcula un color espectral dinámico en tiempo real.

---

## 🔊 Sonido y Música Chiptune
- **Música BGM Chiptune:** Secuenciador sintetizado en tiempo real con la **Web Audio API** (Am - F - C - G) que acelera su ritmo conforme aumentas de nivel.
- **Efectos SFX Arcade:** Sonidos de 8 bits para comer, recoger power-ups, teletransportación, chocar y subir de nivel.
- Controles independientes para activar/desactivar efectos (SFX) y música (BGM).

---

## 🏆 Salón de la Fama Arcade (Top 5)
- Si tu puntuación califica entre los 5 mejores récords, la pantalla de Game Over te permitirá ingresar tus **3 iniciales clásicas** (ej. `DNS`) para inmortalizar tu récord en el navegador con `localStorage`.

---

## 📳 Vibración Háptica (Móviles)
- En dispositivos táctiles compatibles, el juego emite vibraciones hápticas sutiles al comer comida o power-ups, y una sacudida contundente al chocar.
