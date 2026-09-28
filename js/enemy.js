class Enemigo {
    constructor(x, y, ancho, alto) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.vivo = true;
        this.sprite = document.getElementById('sprite-enemigo');
    }

    dibujar(ctx) {
        if (!this.vivo) return;
        if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.x, this.y, this.ancho, this.alto);
        } else {
            ctx.fillStyle = '#ff3355';
            ctx.fillRect(this.x, this.y, this.ancho, this.alto);
        }
    }

    obtenerRectangulo() {
        return { x: this.x, y: this.y, ancho: this.ancho, alto: this.alto };
    }
}

class Flota {
    constructor(canvas, nivel) {
        this.canvas = canvas;
        this.filas = 4;
        this.columnas = 8;
        this.anchoEnemigo = 32;
        this.altoEnemigo = 24;
        this.espaciado = 16;
        this.direccion = 1;
        this.velocidadBase = 1 + (nivel - 1) * 0.4;
        this.velocidad = this.velocidadBase;
        this.bajarPixeles = 20;
        this.enemigos = [];
        this.crearEnemigos();
    }

    crearEnemigos() {
        const margenX = (this.canvas.width - (this.columnas * (this.anchoEnemigo + this.espaciado))) / 2;
        const margenY = 60;
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                const x = margenX + col * (this.anchoEnemigo + this.espaciado);
                const y = margenY + fila * (this.altoEnemigo + this.espaciado);
                this.enemigos.push(new Enemigo(x, y, this.anchoEnemigo, this.altoEnemigo));
            }
        }
    }

    enemigosVivos() {
        return this.enemigos.filter(e => e.vivo);
    }

    quedanEnemigos() {
        return this.enemigosVivos().length > 0;
    }

    actualizar() {
        const vivos = this.enemigosVivos();
        if (vivos.length === 0) return;

        let tocaBorde = false;
        for (const enemigo of vivos) {
            const siguienteX = enemigo.x + this.velocidad * this.direccion;
            if (siguienteX < 0 || siguienteX + enemigo.ancho > this.canvas.width) {
                tocaBorde = true;
                break;
            }
        }

        if (tocaBorde) {
            this.direccion *= -1;
            for (const enemigo of vivos) {
                enemigo.y += this.bajarPixeles;
            }
        } else {
            for (const enemigo of vivos) {
                enemigo.x += this.velocidad * this.direccion;
            }
        }
    }

    alcanzaronElFondo(limiteY) {
        return this.enemigosVivos().some(e => e.y + e.alto >= limiteY);
    }

    dibujar(ctx) {
        for (const enemigo of this.enemigos) {
            enemigo.dibujar(ctx);
        }
    }
}
