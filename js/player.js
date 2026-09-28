class Jugador {
    constructor(canvas) {
        this.canvas = canvas;
        this.ancho = 40;
        this.alto = 30;
        this.x = canvas.width / 2 - this.ancho / 2;
        this.y = canvas.height - this.alto - 20;
        this.velocidad = 6;
        this.moviendoIzquierda = false;
        this.moviendoDerecha = false;
        this.sprite = document.getElementById('sprite-jugador');
    }

    actualizar() {
        if (this.moviendoIzquierda) this.x -= this.velocidad;
        if (this.moviendoDerecha) this.x += this.velocidad;

        if (this.x < 0) this.x = 0;
        if (this.x + this.ancho > this.canvas.width) {
            this.x = this.canvas.width - this.ancho;
        }
    }

    dibujar(ctx) {
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.ancho, this.alto);
        } else {
            ctx.fillStyle = '#00ff66';
            ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        }
    }

    obtenerRectangulo() {
        return { x: this.x, y: this.y, ancho: this.ancho, alto: this.alto };
    }
}
