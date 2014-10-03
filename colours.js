(function() {

    /**
     * Polyfill
     */
    var requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        cancelAnimationFrame =
            window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.msCancelAnimationFrame;

    /**
     * Colour class
     */
    var Colour = function(values) {
        this.values = (values.length === 3) ? values : [0,0,0];

        /**
         * Return colour as "rgb(...)" format string
         */
        this.getRGB = function() {
            return 'rgb(' + this.values.map(Math.round).join(',') + ')';
        }.bind(this);

        /**
         * Get a new "random" colour, mixed with this colour
         */
        this.getRandom = function(mix) {
            return new Colour(this.values.map(function (v) {
                return ((Math.random() * 256) + v) / 2;
            }));
        }.bind(this);
    };

    /**
     * Colour constants
     */
    var BLACK = new Colour([0, 0, 0]),
        WHITE = new Colour([255, 255, 255]);

    /**
     * Application class
     */
    var ColoursApp = function(id, opts) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.mode = opts.mode || 'colour';
        this.colour = opts.colour || BLACK;
        this.rows = opts.rows || 10;
        this.cols = opts.cols || 10;
        this.margin = opts.margin || 4;
        this.refresh = opts.refresh || 200;

        /**
         * Resize handler
         */
        window.onresize = function() {
            // Fill viewport
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.width =  this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            // Calcuate cell size
            this.cellX = ((this.canvas.width - (this.margin * 2)) / this.cols) - this.margin,
            this.cellY = ((this.canvas.height - (this.margin * 2)) / this.rows) - this.margin;
        }.bind(this)();

        /**
         * Cell style handlers
         */
        this.getStyle = {
            // Gradient with random from/to colours mixed with the base colour
            colour: function(x, y) {
                var style = this.ctx.createLinearGradient(x, y, x + this.cellX, y + this.cellY);
                style.addColorStop(0, this.colour.getRandom().getRGB());
                style.addColorStop(1, this.colour.getRandom().getRGB());
                return style;
            }.bind(this),

            // Random colour on/off
            monochrome: function() {
                return (Math.random() > 0.5) ? this.colour.getRGB() : WHITE.getRGB();
            }.bind(this),
        };

        /**
         * Main loop
         */
        this.run = function() {
            // Queue next frame
            requestAnimationFrame(this.run, this.canvas);

            // Render every X ms
            var now = new Date().getTime();
            if (this.time && (now - this.time) < this.refresh) {
                return;
            }
            this.time = now;

            // Draw cells
            for (var x = this.margin; (x + this.cellX) < this.canvas.width; x += this.cellX + this.margin) {
                for (var y = this.margin; (y + this.cellY) < this.canvas.height; y += this.cellY + this.margin) {
                    this.ctx.fillStyle = this.getStyle[this.mode](x, y);
                    this.ctx.fillRect(x, y, this.cellX, this.cellY);
                }
            }
        }.bind(this);
    };

    /**
     * Start app
     */
    new ColoursApp('page', {
        colour: new Colour([255, 168, 145]),
        rows: 40,
        cols: 20,
    }).run();

})();
