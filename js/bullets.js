class Bala {
    constructor(x, y, velocidad, color) {
        this.x = x;
        this.y = y;
        this.ancho = 4;
        this.alto = 12;
        this.velocidad = velocidad;
        this.color = color;
        this.activa = true;
    }

    actualizar() {
        this.y += this.velocidad;
    }

    dibujar(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);
    }

    obtenerRectangulo() {
        return { x: this.x, y: this.y, ancho: this.ancho, alto: this.alto };
    }

    fueraDePantalla(altoCanvas) {
        return this.y + this.alto < 0 || this.y > altoCanvas;
    }
}

function colisionan(rectA, rectB) {
    return (
        rectA.x < rectB.x + rectB.ancho &&
        rectA.x + rectA.ancho > rectB.x &&
        rectA.y < rectB.y + rectB.alto &&
        rectA.y + rectA.alto > rectB.y
    );
}

function crearBalaJugador(jugador) {
    const rect = jugador.obtenerRectangulo();
    return new Bala(rect.x + rect.ancho / 2 - 2, rect.y, -8, '#ffffff');
}

function crearBalaEnemigo(enemigo) {
    const rect = enemigo.obtenerRectangulo();
    return new Bala(rect.x + rect.ancho / 2 - 2, rect.y + rect.alto, 4, '#ffcc00');
}
