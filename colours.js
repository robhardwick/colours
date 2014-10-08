var Colours = (function() {

    /**
     * Polyfill
     */
    var requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

    /**
     * Colour class
     */
    var Colour = function(values) {
        this.values = (values.length === 3) ? values : [0,0,0];
    };

    /**
     * Return colour as "rgb(...)" format string
     */
    Colour.prototype.getRGB = function() {
        return 'rgb(' + this.values.map(Math.round).join(',') + ')';
    };

    /**
     * Get a new "random" colour, mixed with this colour
     */
    Colour.prototype.getRandom = function(mix) {
        return new Colour(this.values.map(function (v) {
            return ((Math.random() * 256) + v) / 2;
        }));
    };

    /**
     * Colour constants
     */
    var BLACK = new Colour([0, 0, 0]),
        WHITE = new Colour([255, 255, 255]);

    /**
     * Create and add DOM element
     */
    var createElement = function(tag, parent) {
        return (parent || document.body).appendChild(document.createElement(tag));
    };

    /**
     * Create and add button
     */
    var addButton = function(parent, label, obj, prop, value) {
        var btn = createElement('button', parent);
        btn.appendChild(document.createTextNode(label));
        btn.onclick = function() { obj[prop] = value; };
    };

    /**
     * Application class
     */
    var App = function(opts) {
        this.mode = opts.mode || 'gradient';
        this.colour = opts.colour || BLACK;
        this.rows = opts.rows || 10;
        this.cols = opts.cols || 10;
        this.margin = opts.margin || 4;
        this.gutter = opts.gutter || 20;
        this.refresh = opts.refresh || 200;
        this.frame = 0;

        // Create canvas
        this.canvas = createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Create toolbar
        var toolbar = createElement('footer');
        for (var mode in this.getStyle) {
            addButton(toolbar, mode, this, 'mode', mode);
        }

        // Set canvas size and update on window resize
        this.resize();
        window.onresize = this.resize;
    };

    /**
     * Resize handler
     */
    App.prototype.resize = function() {
        if (!this.canvas) {
            return;
        }

        // Fill viewport
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        // Calcuate cell size
        this.cellX = Math.round(((this.canvas.width - (this.margin * 2)) / this.cols) - this.margin);
        this.cellY = Math.round(((this.canvas.height - (this.margin * 2) - this.gutter) / this.rows) - this.margin);
    };

    /**
     * Stripe style helper
     */
    function stripe(coord, frame, size, margin) {
        var c = Math.round((coord - margin) / (size + margin)) % 2,
            f = frame % 2;
        return ((c === 0 && f === 0) || (c !== 0 && f !== 0));
    }

    /**
     * Cell style handlers
     */
    App.prototype.getStyle = {

        // Vertical stripes
        vstripes: function(x, y, frame) {
            if (stripe(x, frame, this.cellX, this.margin)) {
                return this.colour.getRGB();
            }
            return WHITE.getRGB();
        },

        // Horizontal stripes
        hstripes: function(x, y, frame) {
            if (stripe(y, frame, this.cellY, this.margin)) {
                return this.colour.getRGB();
            }
            return WHITE.getRGB();
        },

        // Random on or off
        random: function() {
            return (Math.random() > 0.5) ? this.colour.getRGB() : WHITE.getRGB();
        },

        // Gradient with random from/to colours mixed with the base colour
        gradient: function(x, y) {
            var style = this.ctx.createLinearGradient(x, y, x + this.cellX, y + this.cellY);
            style.addColorStop(0, this.colour.getRandom().getRGB());
            style.addColorStop(1, this.colour.getRandom().getRGB());
            return style;
        },

    };

    /**
     * Main loop
     */
    App.prototype.run = function() {
        // Queue next frame
        requestAnimationFrame(this.run.bind(this), this.canvas);

        // Render every X ms
        var now = new Date().getTime();
        if (this.time && (now - this.time) < this.refresh) {
            return;
        }
        this.time = now;

        // Draw cells
        for (var y = this.margin; (y + this.cellY + this.gutter) < this.canvas.height; y += this.cellY + this.margin) {
            for (var x = this.margin; (x + this.cellX) < this.canvas.width; x += this.cellX + this.margin) {
                this.ctx.fillStyle = this.getStyle[this.mode].call(this, x, y, this.frame);
                this.ctx.fillRect(x, y, this.cellX, this.cellY);
            }
        }

        this.frame++;
    };

    return {Colour: Colour, App: App};

})();
