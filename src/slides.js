
    function Slides(container, options) {


        this.$container = $(container);
        this.$wrapper = this.$container.children().eq(0);
        this.$slides = this.$wrapper.children();

        this.default = {
            autoplay: false,
            autoplayTime: 3000,
            speed: 300,
            longSwipesRatio: 0.2,
            initIndex: 0,
            width: this.$container.innerWidth(),
            height: this.$container.innerHeight(),
            direction: 'vertical', //horizontal
            pagination: '.slide-pagination',
            paginationClickable: false,
            effect: 'normal', //cover,zoom,normal,covermove
            loop: false,
            onInit: null,
            onTouchStart: null,
            onTouchMove: null,
            onTouchEnd: null,
            onSlideChangeStart: null,
            onSlideChangeEnd: null,
            onAutoplay: null,
            onAutoplayStart: null,
            onAutoplayEnd: null
        };

        this.emitterEventListeners = {};
        this.slidesLength = this.$slides.length;
        this.moveing = false;
        this.options = $.extend(true, {}, this.default, options);
        this.hack = ["-webkit-", ""];
        this.index = this.options.initIndex;
        this.touchStart = this.touchStart.bind(this);
        this.touchMove = this.touchMove.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
        this.timer = [];
        this.isVertical = this.options.direction == 'vertical';
        this.size = this.options.direction == "vertical" ? this.options.height : this.options.width;
        this.disable = false;
        this.$pagination = this.$container.find(this.options.pagination);
        this.init();
    }

    Slides.prototype.init = function() {

        this.$container[0].addEventListener("touchstart", this.touchStart, false);
        document.addEventListener("touchmove", this.touchMove, false);
        document.addEventListener("touchend", this.touchEnd, false);

        this.effect();
        if (this.options.loop) {
            this.loop();
        }
        this.pagination();

        this.emit("onInit", this);
    };

    Slides.prototype.translateDir = function(translate) {
        return this.isVertical ? "translate3d(0," + translate + "px,0)" : "translate3d(" + translate + "px,0,0)";
    };

    Slides.prototype.pagination = function() {
        if (this.$pagination[0]) {
            var paginationLength = this.options.loop ? this.slidesLength - 2 : this.slidesLength;
            for (var i = 0; i < paginationLength; i++) {
                this.$pagination.append('<span></span>');
            }
            this.paginationChange(this.index);
            var that = this;
            if (this.paginationClickable) {
                this.$pagination.on('click', 'span', function() {
                    var activeIndex = $(this).index() + (that.options.loop ? 1 : 0);
                    that.slideTo(activeIndex, 500);

                });
            }


        }
    };



    Slides.prototype.paginationChange = function(index) {
        if (this.$pagination[0]) {
            var activeIndex = index - (this.options.loop ? 1 : 0);
            this.$pagination.find('span').removeClass("active").eq(activeIndex).addClass('active');
        }
    };



    Slides.prototype.emit = function(eventName) {
        if (this.options[eventName]) {
            this.options[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        }
        if (this.emitterEventListeners[eventName]) {
            for (var i = 0; i < this.emitterEventListeners[eventName].length; i++) {
                this.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            }
        }
    };
    Slides.prototype.on = function(eventName, handler) {
        if (!this.emitterEventListeners[eventName]) this.emitterEventListeners[eventName] = [];
        this.emitterEventListeners[eventName].push(handler);
        return this;
    };
    Slides.prototype.off = function(eventName, handler) {
        var i;
        if (typeof handler === 'undefined') {
            this.emitterEventListeners[eventName] = [];
            return this;
        }
        if (!this.emitterEventListeners[eventName] || this.emitterEventListeners[eventName].length === 0) return;
        for (i = 0; i < this.emitterEventListeners[eventName].length; i++) {
            if (this.emitterEventListeners[eventName][i] === handler) this.emitterEventListeners[eventName].splice(i, 1);
        }
        return this;
    };
    Slides.prototype.once = function(eventName, handler) {
        var _handler = function() {
            handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            this.off(eventName, _handler);
        };
        this.on(eventName, _handler);
        return this;
    };

    Slides.prototype.loop = function() {
        this.index++;
        this.slideTo(this.index, 0);
        this.$wrapper.append(this.$slides.eq(0).clone(false)).prepend(this.$slides.last().clone(false));
        this.$slides = this.$wrapper.children();
        this.slidesLength += 2;

    };

    Slides.prototype.autoplay = function() {

    };

    Slides.prototype.resize = function() {

    };

    Slides.prototype.effect = function() {
        if (this.options.effect == 'covermove') {
            this.cover = 0.5;
            this.zoom = 1;
        } else if (this.options.effect == 'zoom') {
            this.cover = 0.5;
            this.zoom = 0.3;
        } else if (this.options.effect == 'cover') {
            this.cover = 1;
            this.zoom = 1;
        } else if (this.options.effect == 'normal') {
            this.cover = 0;
            this.zoom = 1;
        }
    };


    Slides.prototype.moveUp = function() {

        var styleingSlide = "";
        var styleingWrapper = "";
        for (var i = 0; i < this.hack.length; i++) {
            styleingWrapper += this.hack[i] + "transform:" + this.translateDir(this.size * -(this.index + 1)) + ";" + this.hack[i] + "transition:all .3s ease-in;";
            styleingSlide += this.hack[i] + "transform:" + this.translateDir(this.size * this.cover) + " scale(" + this.zoom + "," + this.zoom + ");" + this.hack[i] + "transition:all .3s ease-in;z-index:1;";
        }


        this.$wrapper.attr("style", styleingWrapper);
        this.$slides.eq(this.index).attr("style", styleingSlide);
        var that = this;
        setTimeout(function() {
            styleingSlide = styleingWrapper = "";
            for (var i = 0; i < that.hack.length; i++) {
                styleingWrapper += that.hack[i] + "transform:" + that.translateDir(that.size * -(that.index + 1)) + ";";
                styleingSlide += that.hack[i] + "transform:translate3d(0,0,0) scale(1,1);";
            }

            that.$wrapper.attr("style", styleingWrapper);
            that.$slides.eq(that.index).attr("style", styleingSlide);
            that.index++;
            that.disable = false;

            if (that.options.loop && that.index == that.slidesLength - 1) {
                that.index = 1;
                that.slideTo(that.index, 0);
            }
            that.paginationChange(that.index);
            that.emit("onSlideChangeEnd", that);
        }, 300);
    };

    Slides.prototype.moveDown = function() {

        var styleingSlide = "";
        var styleingWrapper = "";
        for (var i = 0; i < this.hack.length; i++) {
            styleingWrapper += this.hack[i] + "transform:" + this.translateDir(this.size * -(this.index - 1)) + ";-webkit-transition:all .3s ease-in;";
            styleingSlide += this.hack[i] + "transform:" + this.translateDir(-this.size * this.cover) + " scale(" + this.zoom + "," + this.zoom + ");" + this.hack[i] + "transition:all .3s ease-in;z-index:1;";
        }


        this.$wrapper.attr("style", styleingWrapper);
        this.$slides.eq(this.index).attr("style", styleingSlide);
        var that = this;
        setTimeout(function() {
            styleingSlide = styleingWrapper = "";
            for (var i = 0; i < that.hack.length; i++) {
                styleingWrapper += that.hack[i] + "transform:" + that.translateDir(that.size * -(that.index - 1)) + ";";
                styleingSlide += that.hack[i] + "transform:translate3d(0,0,0) scale(1,1);";
            }

            that.$wrapper.attr("style", styleingWrapper);
            that.$slides.eq(that.index).attr("style", styleingSlide);
            that.index--;
            that.disable = false;
            if (that.options.loop && that.index == 0) {
                that.index = that.slidesLength - 2;
                that.slideTo(that.index, 0);
            }
            that.paginationChange(that.index);
            that.emit("onSlideChangeEnd", that);
        }, 300);
    };

    Slides.prototype.touchStart = function(event) {
        if (!this.disable) {
            var touch = event.touches[0];
            this.startY = this.endY = touch.pageY;
            this.startX = this.endX = touch.pageX;
            this.moveing = true;
            this.emit("onTouchStart", this, event);
        }

    };

    Slides.prototype.touchMove = function(event) {
        if (this.moveing) {
            event.preventDefault();
            var touch = event.touches[0];
            this.endY = touch.pageY;
            this.endX = touch.pageX;

            var moveSlide = this.isVertical ? (this.endY - this.startY) : (this.endX - this.startX);
            var moveWrapper = -this.size * this.index + moveSlide;

            var styleingWrapper = "";
            var styleingSlide = "";
            var scale = this.zoom < 1 ? (this.size - Math.abs(moveSlide)) / this.size + this.zoom : 1;

            if (this.index === 0 && moveSlide > 0) {
                moveSlide = 0;
                moveWrapper = -this.size * (this.index);
                scale = 1;
            }
            if (this.index == this.slidesLength - 1 && moveSlide < 0) {
                moveSlide = 0;
                moveWrapper = -this.size * (this.index);
                scale = 1;
            }
            if (scale >= 1) {
                scale = 1;
            }
            for (var i = 0; i < this.hack.length; i++) {
                styleingWrapper += this.hack[i] + "transform:" + this.translateDir(moveWrapper) + ";";
                styleingSlide += this.hack[i] + "transform:" + this.translateDir(-moveSlide * this.cover) + " scale(" + scale + "," + scale + ");z-index:1;";
            }
            this.$wrapper.attr("style", styleingWrapper);
            this.$slides.eq(this.index).attr("style", styleingSlide);
            this.emit("onTouchMove", this, event);

        }
    };

    Slides.prototype.touchEnd = function(event) {
        if (this.moveing) {
            if ((this.endY - this.startY < -this.size * this.options.longSwipesRatio || this.endX - this.startX < -this.size * this.options.longSwipesRatio) && this.index < this.slidesLength - 1) {
                this.disable = true;
                this.moveUp();
            } else if ((this.endY - this.startY > this.size * this.options.longSwipesRatio || this.endX - this.startX > this.size * this.options.longSwipesRatio) && this.index > 0) {

                this.disable = true;
                this.moveDown();

            } else {
                var styleingSlide = "";
                var styleingWrapper = "";
                for (var i = 0; i < this.hack.length; i++) {
                    styleingSlide += this.hack[i] + "transform:translate3d(0,0,0) scale(1,1);" + this.hack[i] + "transition:all .1s ease-in;z-index:9;";
                    styleingWrapper += this.hack[i] + "transform:" + this.translateDir(-this.size * (this.index)) + ";" + this.hack[i] + "transition:all .1s ease-in;z-index:1;";
                }
                this.$slides.eq(this.index).attr("style", styleingSlide);
                this.$wrapper.attr("style", styleingWrapper);
            }

            this.moveing = false;
            this.emit("onTouchEnd", this, event);
            this.emit("onSlideChange", this);
        }

    };
    Slides.prototype.slideTo = function(index, time, cb) {
        this.emit("onSlideChangeStart", this);
        this.disable = true;
        var styleingWrapper = "";
        for (var i = 0; i < this.hack.length; i++) {

            styleingWrapper += this.hack[i] + "transform:" + this.translateDir(-this.size * (index)) + ";" + this.hack[i] + "transition:all " + time * 0.001 + "s ease-in;";
        }
        this.$wrapper.attr("style", styleingWrapper);
        this.index = index;
        this.paginationChange(index);
        var that = this;
        setTimeout(function() {
            if (typeof cb === "function") {
                cb();
            }
            that.emit("onSlideChange", that);
            that.emit("onSlideChangeEnd", that);
            that.disable = false;
        }, time);
    };


  export default Slides;
