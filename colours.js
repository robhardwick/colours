(function() {

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
         * Return colour as "rgba(...)" format string
         */
        this.getRGBA = function() {
            return 'rgba(' + this.values.map(Math.round).join(',') + ',1)';
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
     * Application class
     */
    var ColoursApp = function(id, colour, opts) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.colour = colour;
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

                    // Get cell gradient
                    var gradient = this.ctx.createLinearGradient(x, y, x + this.cellX, y + this.cellY);
                    gradient.addColorStop(0, this.colour.getRandom().getRGBA());
                    gradient.addColorStop(1, this.colour.getRandom().getRGBA());

                    // Fill cell
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x, y, this.cellX, this.cellY);
                }
            }
        }.bind(this);
    };

    /**
     * Start app
     */
    new ColoursApp('page', new Colour([255, 168, 145]), {rows: 40, cols: 20}).run();

})();
