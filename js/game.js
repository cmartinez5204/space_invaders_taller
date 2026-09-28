(function () {
    const canvas = document.getElementById('lienzo-juego');
    const ctx = canvas.getContext('2d');

    const pantallaInicio = document.getElementById('pantalla-inicio');
    const pantallaGameOver = document.getElementById('pantalla-game-over');
    const botonIniciar = document.getElementById('boton-iniciar');
    const botonReiniciar = document.getElementById('boton-reiniciar');

    const spanPuntaje = document.getElementById('puntaje');
    const spanNivel = document.getElementById('nivel');
    const spanVidas = document.getElementById('vidas');
    const spanPuntajeFinal = document.getElementById('puntaje-final');

    const botonIzquierda = document.getElementById('boton-izquierda');
    const botonDerecha = document.getElementById('boton-derecha');
    const botonDisparar = document.getElementById('boton-disparar');
    const botonPausar = document.getElementById('boton-pausar');

    const INTERVALO_DISPARO_JUGADOR = 400;
    const PROBABILIDAD_DISPARO_ENEMIGO = 0.01;

    let jugador;
    let flota;
    let balasJugador = [];
    let balasEnemigas = [];
    let puntaje = 0;
    let nivel = 1;
    let vidas = 3;
    let pausado = false;
    let juegoActivo = false;
    let ultimoDisparoJugador = 0;
    let idAnimacion = null;

    function actualizarHud() {
        spanPuntaje.textContent = puntaje;
        spanNivel.textContent = nivel;
        spanVidas.textContent = vidas;
    }

    function iniciarNivel(nivelActual) {
        jugador = jugador || new Jugador(canvas);
        jugador.x = canvas.width / 2 - jugador.ancho / 2;
        flota = new Flota(canvas, nivelActual);
        balasJugador = [];
        balasEnemigas = [];
    }

    function iniciarJuego() {
        puntaje = 0;
        nivel = 1;
        vidas = 3;
        pausado = false;
        juegoActivo = true;
        iniciarNivel(nivel);
        actualizarHud();

        pantallaInicio.hidden = true;
        pantallaGameOver.hidden = true;

        if (idAnimacion) cancelAnimationFrame(idAnimacion);
        idAnimacion = requestAnimationFrame(bucleJuego);
    }

    function terminarJuego() {
        juegoActivo = false;
        spanPuntajeFinal.textContent = puntaje;
        pantallaGameOver.hidden = false;
        if (idAnimacion) {
            cancelAnimationFrame(idAnimacion);
            idAnimacion = null;
        }
    }

    function manejarDisparoJugador(marcaTiempo) {
        if (marcaTiempo - ultimoDisparoJugador < INTERVALO_DISPARO_JUGADOR) return;
        ultimoDisparoJugador = marcaTiempo;
        balasJugador.push(crearBalaJugador(jugador));
    }

    function manejarDisparosEnemigos() {
        const vivos = flota.enemigosVivos();
        if (vivos.length === 0) return;
        if (Math.random() < PROBABILIDAD_DISPARO_ENEMIGO) {
            const disparador = vivos[Math.floor(Math.random() * vivos.length)];
            balasEnemigas.push(crearBalaEnemigo(disparador));
        }
    }

    function actualizarBalas() {
        balasJugador.forEach(b => b.actualizar());
        balasEnemigas.forEach(b => b.actualizar());
        balasJugador = balasJugador.filter(b => !b.fueraDePantalla(canvas.height));
        balasEnemigas = balasEnemigas.filter(b => !b.fueraDePantalla(canvas.height));
    }

    function detectarColisiones() {
        for (const bala of balasJugador) {
            for (const enemigo of flota.enemigosVivos()) {
                if (colisionan(bala.obtenerRectangulo(), enemigo.obtenerRectangulo())) {
                    bala.activa = false;
                    enemigo.vivo = false;
                    puntaje += 10;
                }
            }
        }
        balasJugador = balasJugador.filter(b => b.activa);

        const rectJugador = jugador.obtenerRectangulo();
        for (const bala of balasEnemigas) {
            if (colisionan(bala.obtenerRectangulo(), rectJugador)) {
                bala.activa = false;
                perderVida();
            }
        }
        balasEnemigas = balasEnemigas.filter(b => b.activa);
    }

    function perderVida() {
        vidas -= 1;
        actualizarHud();
        if (vidas <= 0) {
            terminarJuego();
        }
    }

    function comprobarFinDeNivel() {
        if (!flota.quedanEnemigos()) {
            nivel += 1;
            actualizarHud();
            iniciarNivel(nivel);
        }
    }

    function comprobarInvasion() {
        const limiteY = jugador.y;
        if (flota.alcanzaronElFondo(limiteY)) {
            terminarJuego();
        }
    }

    function dibujarTodo() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        jugador.dibujar(ctx);
        flota.dibujar(ctx);
        balasJugador.forEach(b => b.dibujar(ctx));
        balasEnemigas.forEach(b => b.dibujar(ctx));
    }

    function bucleJuego(marcaTiempo) {
        if (!juegoActivo) return;

        if (!pausado) {
            jugador.actualizar();
            flota.actualizar();
            manejarDisparosEnemigos();
            actualizarBalas();
            detectarColisiones();
            comprobarInvasion();
            if (juegoActivo) comprobarFinDeNivel();
            actualizarHud();
        }

        dibujarTodo();

        if (juegoActivo) {
            idAnimacion = requestAnimationFrame(bucleJuego);
        }
    }

    function alternarPausa() {
        if (!juegoActivo) return;
        pausado = !pausado;
    }

    function dispararSiActivo() {
        if (!juegoActivo || pausado) return;
        manejarDisparoJugador(performance.now());
    }

    document.addEventListener('keydown', (evento) => {
        if (!jugador) return;
        if (evento.code === 'ArrowLeft') jugador.moviendoIzquierda = true;
        if (evento.code === 'ArrowRight') jugador.moviendoDerecha = true;
        if (evento.code === 'Space') {
            evento.preventDefault();
            dispararSiActivo();
        }
        if (evento.code === 'KeyP') alternarPausa();
    });

    document.addEventListener('keyup', (evento) => {
        if (!jugador) return;
        if (evento.code === 'ArrowLeft') jugador.moviendoIzquierda = false;
        if (evento.code === 'ArrowRight') jugador.moviendoDerecha = false;
    });

    function activarMovimiento(boton, propiedad) {
        const activar = () => { if (jugador) jugador[propiedad] = true; };
        const desactivar = () => { if (jugador) jugador[propiedad] = false; };
        boton.addEventListener('mousedown', activar);
        boton.addEventListener('touchstart', activar);
        boton.addEventListener('mouseup', desactivar);
        boton.addEventListener('mouseleave', desactivar);
        boton.addEventListener('touchend', desactivar);
    }

    activarMovimiento(botonIzquierda, 'moviendoIzquierda');
    activarMovimiento(botonDerecha, 'moviendoDerecha');
    botonDisparar.addEventListener('click', dispararSiActivo);
    botonPausar.addEventListener('click', alternarPausa);

    botonIniciar.addEventListener('click', iniciarJuego);
    botonReiniciar.addEventListener('click', iniciarJuego);
})();
