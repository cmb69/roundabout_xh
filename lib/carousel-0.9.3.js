/**
 * jCarousel
 *
 * @url		    : http://www.jcarousel.de
 * @author    : Erik Stelzer
 * @version	  : 0.9.3
 *
 * Copyright 2010, Erik Stelzer
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
**/

(function($){
    $.jCarousel = function(el, options){

        $.jCarousel.defaultOptions = {
          width: 600,
          height: 250,
          speed: 200,
          dynamic: 50,
          jsonScript: null,
          reload: null,
          maxSpeed: 3,
          direction: 1,
          reflection: 40,
          reflectionStart: 50,
          reflectionEnd: 100,
          onPicClick: null,
          overlayColor: '#ffffff',
          overlayGlobal: 0,
          overlay: 60,
          showImageTitle : true,
          imageTitleShift : 5,
          imageTitlePadding: 0,
          detailsPadding : 50,
          perspective : 30,
          imageTitleFontSize : 10,
          direction : 1,
          showButtons : false
        };

        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;
        // Add a reverse reference to the DOM object
        base.$el.data("jCarousel", base);

        base.initHelp = function() {
          base.speed = base.options.speed / 100000 * base.options.direction;
          base.speedHelp = base.options.speed / 1000;
          base.reload = base.options.reload * 1000;                 // Zeit, nach dem das Carousel automatisch neu geladen wird
          base.overlayGlobal = base.options.overlayGlobal / 100;
          base.overlay = base.options.overlay / 100;
          base.perspective = 100 / base.options.perspective;
          base.reflectionStart = base.options.reflectionStart / 100;
          base.reflectionEnd = base.options.reflectionEnd / 100;
          //base.options.reflection = (base.options.reflection == 0) ? false : base.options.reflection;
          // Buttons

          // Beschleunigung (nur wenn keine Buttons verwendet werden)
          //if (base.$el.find('.carouselNext').length == 0 || base.$el.find('.carouselPrev').length == 0) {
          base.$el.children('#carouselContent_'+base.el.id).bind({
                                                                    mousemove: function(event) {base.accelaration(event)},
                                                                    mouseleave: function(event) {base.acc = 1}
                                                                    });


        }

        base.init = function(){
          base.options = $.extend({},$.jCarousel.defaultOptions, options);
          /*************************************************************/
          base.initHelp();
          /*************************************************************/
          base.i = base.j = base.k = base.sc = base.z = 0;
          base.b = base.acc = 1;
          base.image = new Array();
          base.imageMaxWidth = 0;
          base.imageMaxHeight = 0;
          base.interval1;
          base.interval2;
          /*************************************************************/
          base.posXonClick;
          base.posYonClick;
          base.widthOnClick;
          base.heightOnClick;
          base.opacityOnClick;
          base.animationStatus = false;
          base.clickStatus = false;
          base.firstStart = true;
          base.carouselOn = true;
          base.buttonMouseDown = false;
          /*************************************************************/
          base.$el.css('display', 'none');
          base.carouselContent = $('<div />').attr('id','carouselContent_'+base.el.id);
          base.$el.append(base.carouselContent);

          base.$el.children('#carouselContent_'+base.el.id).bind({
                                                                    mousemove: function(event) {base.accelaration(event)},
                                                                    mouseleave: function(event) {base.acc = 1}
                                                                    });

          // Daten holen
          base.getData();

          //Buttons
          base.showButtons();

        };


        base.getData = function() {
          /* ------------------------------------------------------------------------------------------------------------------ */
          /* Datenquelle
          (1): JSON
          (2): Bilder werden im HTML-Script definiert
          Hinweis: Um JSON in Verbindung mit spieglenden Bildern zu verwenden, müssen diese auch im HTML-Script vorliegen,
                   und "invisble" sein (es sei denn, sie werden an anderer Stelle explizit verwendet).
          /* ------------------------------------------------------------------------------------------------------------------ */
          if (base.options.jsonScript)
            base.getJSONData();
          else
            base.getHtmlData();
          /* ------------------------------------------------------------------------------------------------------------------ */
        }

        base.preloadImage = function(img,i) {
          img.onload = function()
              {
              base.image[i]["width"] = img.width;
              base.image[i]["height"] = img.height;
          }
        }

        base.getJSONData = function() {
          var img; var h = 0;
          $.each(base.$el.find('.carousel'), function()
          {
            $(this).css('display','none'); //alle "Carousel-Bilder ausblenden"
          });
          $.getJSON(base.options.jsonScript, function(data) {
            $.each(data.items, function(i,item){
              base.image[i] = new Object();
              base.image[i]["id"] = item.id;
              base.image[i]["bez"] = item.bez;
              base.image[i]["src"] = item.src;
              base.image[i]["title"] = item.title;
              base.image[i]["description"] = item.description;

              var img = new Image();

                //base.preloadImage(img,i);
                img.onload = function()
                {
                  $('#debug1').val(h);
                  base.image[i]["width"] = img.width;
                  base.image[i]["height"] = img.height;
                  base.createImageBlock(i);
                  if (base.image[i]["width"] > 0 && base.image[i]["height"] > 0)
                    h = h + 1;
                  else
                    base.preloadImage(img,i);
                  if (h >= data.items.length)
                  {
                    base.initializeContent();
                  }
                }
              img.src = item.src;
            });
          });
        }

        base.getHtmlData = function() {
          $.each(base.$el.find('.carousel'), function(i)
          {
            $(this).css('display','none'); //alle "Carousel-Bilder ausblenden"
            base.image[i] = new Object();
            base.image[i]["src"] = this.src;
            base.image[i]["width"] = parseInt(this.width);
            base.image[i]["height"] = parseInt(this.height);
            base.image[i]["title"] = this.title;
            base.image[i]["description"] = this.title;
            base.createImageBlock(i);
          });
          base.initializeContent();
        }

        // Buttons
        base.showButtons = function() {
          if (base.options.showButtons) {
            // Events für Buttons "Next" und "Prev"
            base.$el.find('.carouselNext').mousedown(function(event) {base.onButtonMouseDown(event)});
            base.$el.find('.carouselPrev').mousedown(function(event) {base.onButtonMouseDown(event)});
            base.$el.find('.carouselNext').mouseup(function() {base.onButtonMouseUp()});
            base.$el.find('.carouselPrev').mouseup(function() {base.onButtonMouseUp()});
            // Positionierung
            base.$el.find('.carouselNext').css({'position':'absolute','z-index':'10000','display':'block'});
            base.$el.find('.carouselPrev').css({'position':'absolute','z-index':'10000','display':'block'});
            // keine automatische rotation, wenn buttons zum rotieren verwendet werden (speed = 0)
            //if (base.$el.find('.carouselNext').length > 0 && base.$el.find('.carouselPrev').length > 0)
            //base.stopCarousel();
          }
          else {
            base.$el.find('.carouselNext').css({'position':'absolute','display':'none'});
            base.$el.find('.carouselPrev').css({'position':'absolute','display':'none'});
            base.firstStart = true;
            base.startCarousel();
          }
        }

        base.createImageBlock = function(i) {
          var imgBlock = $('<div />').attr({'id':'cBlock'+base.el.id+''+(i+1), 'class':'cBlock c'});
          var myImage = $('<img />').attr({'src':base.image[i]["src"], 'id':'cImage_'+base.el.id+''+(i+1), 'class':'cImage c'});
          var imageTitle = $('<div />').attr({'id':'cImageTitle_'+base.el.id+''+(i+1), 'class':'cImgTitle c'});
          // Overlay
          //if (base.options.overlayColor)
            var cOverlay = $('<div />').attr({'id':'cOverlay_'+base.el.id+''+(i+1), 'class':'cOverlay c'});
          //else
            //cOverlay = null;
          // Container einhängen
          base.carouselContent.append(imgBlock);
          $(imgBlock).append(myImage);
          $(imageTitle).append(base.image[i]["title"]);
          $(imgBlock).append(imageTitle);
          if (cOverlay) $(imgBlock).append(cOverlay);
          // reflection
          if (base.options.reflection > 0)
            base.setReflection(base.image[i], i+1, imgBlock);
          // MaxImageSize
          base.getMaxImage(i);
          // Events
          $(imgBlock).bind({click: function(event) {base.onPicEvent(event,$(this),i)}});
          $(imgBlock).bind({mouseover: function(event) {base.onPicEvent(event,$(this),i)}});
          $(imgBlock).bind({mouseout: function(event) {base.onPicEvent(event,$(this),i)}});
        }

        base.initializeContent = function()
        {
          base.sc = 0;
          base.anz = base.image.length;
          // Größe und Positionierung des DIV-Containers
          //base.$el.css('width',base.options.width);
          //base.$el.css('height',base.options.height);
          base.$el.find('.c').css('position','absolute');
          $('#carouselContent_'+base.el.id).css({
                                                'position':'relative',
                                                'width':base.options.width,
                                                'height':base.options.height
                                                });
          $('#carouselContent_'+base.el.id+' .cReflection').css('position','absolute');
          $('#carouselContent_'+base.el.id+' .cImgTitle').css({
                                                              'position':'absolute',
                                                              'text-align':'center',
                                                              'display':'none'
                                                              });
          if (base.options.overlayColor)
          {
            $('.cOverlayImage').css('opacity',base.overlayGlobal);
          }
          // automatischer Reload
          if (base.reload) window.setTimeout(function() {reloadContent();}, base.reload);
          $('.cOverlay').css('background-color',base.options.overlayColor);
          base.reflection = (base.options.reflection * base.imageMaxHeight) / 100;
          base.PosX = (base.options.width - base.imageMaxWidth)/2;
          base.PosY = (base.options.height - base.reflection - base.imageMaxHeight)/2;
          base.$el.css('display','block');
          if (base.firstStart == true) {
            base.firstStart = false;
            base.startCarousel();
          }
        }

        base.setImage = function() {
          for(base.b = 1;base.b < base.anz + 1; base.b++) // alle Bilder durchlaufen
          {
            base.j = base.j + (base.speed * base.acc); // kreiswert (vor korrektur für mehrere bilder)
            base.k = ((2 * Math.PI) / base.anz) * (base.b-1); // korrektur der bilder auf dem kreis
            base.i = base.j + base.k; // kreiswert nach korrektur
            if (base.j >= 2 * Math.PI || base.j <= -(2 * Math.PI)) base.j = 0; // nullung nach erreichen des vollkreises (2*Pi)
            x = (Math.cos(base.i) + 1) * base.PosX;   // Abszisse
            y = (Math.sin(base.i) + 1) * base.PosY; // Ordinate

            zIndex = Math.round(Math.cos(base.i - Math.PI / 2)*100) + 101;
            if (base.options.perspective) base.sc = (1 +  Math.cos(base.i + Math.PI / 2)) / base.perspective; // skalierungsfaktor (Standard = 0)
            if (base.options.overlayColor)
            {
              base.z = (Math.cos(base.i - Math.PI / 2) + 1) / 2; // laufvariable zum berechnen des alpha-wertes
              base.z = base.overlay - base.z * base.overlay;
              if (base.overlayGlobal > 0) base.z = base.z + base.overlayGlobal;
            }
            if (base.image[base.b-1])
            {
              $('#cBlock'+base.el.id+''+base.b+'').css('left', x + (base.image[base.b-1]["width"] * base.sc) / (2 * base.sc + 2));
              //$('#cBlock'+base.el.id+''+base.b+'').css('top', y + base.options.imageTitleShift);
              $('#cBlock'+base.el.id+''+base.b+'').css('top',y);
              $('#cBlock'+base.el.id+''+base.b+'').children().andSelf().css('width', base.image[base.b-1]["width"]/(base.sc+1));
              $('#cBlock'+base.el.id+''+base.b+'').children().andSelf().css('z-index', zIndex);
              $('#cBlock'+base.el.id+''+base.b+'').children('.cImage').css('height', base.image[base.b-1]["height"]/(base.sc+1));
              //$('#cBlock'+base.el.id+''+base.b+'').children('.cOverlay').andSelf().css('height', (base.image[base.b-1]["height"]+base.reflection)/(base.sc+1));
              $('#cBlock'+base.el.id+''+base.b+'').css('height', (base.image[base.b-1]["height"]+base.reflection)/(base.sc+1));
              if (base.options.showImageTitle) {
                $('#cBlock'+base.el.id+''+base.b+'').children('.cImgTitle').css({
                                                                                'font-size': (base.options.imageTitleFontSize / (base.sc+1)) +'px',
                                                                                'top': (base.options.imageTitleShift + base.image[base.b-1]["height"]) / (base.sc+1)
                                                                              });
              }
              if (base.options.overlayColor)
              {
                $('#cOverlay_'+base.el.id+''+base.b+'').css('opacity', base.z);
                $('#cOverlay_'+base.el.id+''+base.b+'').css('z-index', zIndex+1);
                $('#cOverlay_'+base.el.id+''+base.b+'').css('height', (base.image[base.b-1]["height"]+base.reflection)/(base.sc+1));
              }
             if (base.options.reflection > 0)
              {
                $('#cReflection'+base.b+'').children().css('width', base.image[base.b-1]["width"]/(base.sc+1));
                if ($.support.scriptEval)
                {
                  $('#cReflection'+base.b+'').css('top', base.image[base.b-1]["height"]/(base.sc+1)-1);
                  $('#cReflection'+base.b+'').css('height', base.reflection/(base.sc+1));
                }
                else
                {
                  $('#cReflection'+base.b+'').css('top', base.image[base.b-1]["height"]/(base.sc+1));
                  $('#cReflection'+base.b+'').css('height', 150);
                  $('#cReflection'+base.b+'').children().css('filter','flipv progid:DXImageTransform.Microsoft.Alpha(opacity='+(100 - base.reflectionStart * 100)+', style=1, finishOpacity='+ (100 - base.reflectionEnd*100)+', startx=0, starty=0, finishx=0, finishy='+ base.reflection * 100 / base.image[base.b-1]["height"]/(base.sc+1) +')');
                }
            }
              //if (base.b==1) $('#debug1').val(base.options.reflection);
              if (base.b==1) $('#debug2').val(base.interval1);
            }
          }
          //base.$el.css('display', 'block'); // kompletten Inhalt anzeigen
          if ((base.options.showButtons) && (base.buttonMouseDown == false)) base.stopCarousel();
        }

        base.startCarousel = function()
        {
          base.carouselOn = true;
          window.clearInterval(base.interval1);
          base.interval1 = window.setInterval(function() {base.setImage();}, base.options.dynamic);
          // high dynamic
          //window.clearInterval(base.interval2);
          //base.interval2 = window.setInterval(function() {base.setImage();}, base.options.dynamic);
        }

        base.stopCarousel = function()
        {
          window.clearInterval(base.interval1);
          base.carouselOn = false;
          //window.clearInterval(base.interval2);
        }



        base.accelaration = function(event) {
          var direction;
          base.offsetX = $('#carouselContent_'+base.el.id).offset().left;
          if (base.options.maxSpeed)
          {
            if ((event.pageX - base.offsetX) < (base.options.width) / 2)
              direction = -1;
            else
              direction = 1;
            base.acc = ((Math.abs(base.options.width / 2 - (event.pageX - base.offsetX)) / 100) * base.options.maxSpeed) / (base.speed * 1000) * direction;
          }
        }

        base.onButtonMouseDown = function(event) {
          var direction;
          base.speed = base.speedHelp;
          base.buttonMouseDown = true;
          if (event.currentTarget.className == 'carouselNext')
            base.options.direction = 1;
          if (event.currentTarget.className == 'carouselPrev')
            base.options.direction = -1;
          base.firstStart = true;
          base.initHelp();
          base.startCarousel();
        }

        base.onButtonMouseUp = function() {
          base.buttonMouseDown = false;
          base.speed = base.stopCarousel();
        }

        base.setReflection = function(pic, i, imgBlock) {
          if ($.support.scriptEval) {
            if (base.options.reflection > pic["height"]) base.options.reflection = parseInt(pic["height"]);
            $('#carouselContent_'+base.el.id+'').append('<canvas id="cReflection'+i+'" width="'+pic["width"]+'" height="'+base.options.reflection+'" class="cReflection">');
            var ctx = document.getElementById('cReflection'+i).getContext('2d');
            var img = new Image();
            img.src = pic["src"];
            img.onload = function() {   // Fix the Firefox-Problem
              ctx.scale(1,-1);
              ctx.translate(0,-pic["height"]);
              ctx.drawImage(img, 0, pic["height"]-base.options.reflection, pic["width"], base.options.reflection, 0, pic["height"]-base.options.reflection, pic["width"], base.options.reflection);
              ctx.restore();
              ctx.scale(1,-1);
              ctx.translate(0,-pic["height"]);
              ctx.globalCompositeOperation = "destination-out";
              var gradient = ctx.createLinearGradient(0,0,0,parseInt(base.options.reflection));
              gradient.addColorStop(1, "rgba(255, 255, 255, "+ base.reflectionEnd +")");
              gradient.addColorStop(0, "rgba(255, 255, 255, "+ base.reflectionStart +")");
              ctx.fillStyle = gradient;
              ctx.rect(0,0,pic["width"], base.options.reflection);
              ctx.fill();
            }
            $('#cReflection'+i).remove().appendTo(imgBlock);
          }
            else
          {
            $('#carouselContent_'+base.el.id+'').append('<div id="cReflection'+i+'" class="cReflection">');
            var reflection = new Image();
            reflection.src = pic["src"];
            reflection.style.height = pic["height"];
            $('.cReflection').css('height',base.options.reflection);
            $('#cReflection'+i).append(reflection);
            $('#cReflection'+i).appendTo(imgBlock);
          }
    }

        base.onPicEvent = function(event, imgBlock, i) {
          if (event.type == 'click')  {
            // extern definierte Funktion
            if (base.options.onPicClick)
            {
              // Übergebene Funktion aufrufen
              base.options.onPicClick.call(event,base,imgBlock, i);
            }
            else
            {
              // interner Funktionsaufruf
            }
          } // ende click

          if (event.type == 'mouseover')
          {
            if (!base.clickStatus)
            {
              if (base.options.showImageTitle) {
                //$(imgBlock).children('.cImgTitle').css('display', 'block');
                $(imgBlock).children('.cImgTitle').fadeIn('fast');
              }
            }
          }
          if (event.type == 'mouseout')
          {
            if (!base.clickStatus)
            {
              $(imgBlock).children('.cImgTitle').fadeOut('fast');
              $(imgBlock).children('.cOverlayImage').css('display', 'block');
              //$(imgBlock).children('.cImgTitle').css('display', 'none');
            }
          }
        }

        base.getMaxImage = function(i) {
          if (base.image[i]["width"] > base.imageMaxWidth)
            base.imageMaxWidth = parseInt(base.image[i]["width"]);
          if (base.image[i]["height"] > base.imageMaxHeight)
            base.imageMaxHeight = parseInt(base.image[i]["height"]);
        }

        function validateInput(param,value) {
          if (param == 'overlayColor') {
            var validValue = /^#([0-9a-f]{1,2}){6}$/i;
            if (validValue.test(value))
              value = "'" + value + "'";
            else
              value = "'" + base.options.overlayColor + "'";
          }
          return value;
          }


        /*************************************************************/
        /* extern functions                                          */
        /*************************************************************/

        $.fn.startCarousel = function(){
          base.startCarousel();
        }

        $.fn.stopCarousel = function(){
          base.stopCarousel();
        }

        $.fn.getValue = function(param) {
          //ToDo: Außnahmen für initHelpWert
          if (param) {
            param = 'base.options.'+param;
            return eval(param);
          }
        }

        $.fn.setValue = function(param, value) {
          value = validateInput(param, value);
            var i;
            var _param = 'base.options.'+param+' = ' + value;
            eval(_param);

            if (base.options.reflection == 0) base.options.reflection = false;
            //alert(base.options.reflection);
            if (base.options.reflection) {
              var imgBlock;
              $('.cReflection').remove();
              for (i=0;i<base.image.length;i++)
              {
                imgBlock = $('#cBlock'+base.el.id+''+(i+1));
                base.setReflection(base.image[i], i+1, imgBlock);
                $('#cReflection'+(i+1)).css('position','absolute');
              }
            }
            else
            {
              $('.cReflection').remove();
            }
            if (i == base.image.length || !base.options.reflection) {
              base.initHelp(); // ggf. value umrechnen
              if (param == 'jsonScript') {
                base.carouselContent.children().remove();
                base.getData();
              }
              else {
                base.initHelp();
                base.startCarousel();
                base.initializeContent();
              }
            }

            if (param == 'dynamic') {
              base.stopCarousel();
              base.startCarousel();
            }

            if (param == 'showButtons') {
              if (!base.options.showButtons) {
                base.$el.children('#carouselContent_'+base.el.id).bind({mousemove: function(event) {base.accelaration(event)}});
                base.initHelp();
                base.startCarousel();
              }
              else {
                base.$el.children('#carouselContent_'+base.el.id).bind({mousemove: function(event) {base.acc = 1}});
                base.carouselOn = false;
              }
              //base.initHelp();
              base.showButtons();

            }
        }

        $.fn.setDefaultValues = function() {
          base.options = $.extend({},$.jCarousel.defaultOptions, options);
          base.initHelp();
          base.initializeContent();
//          base.$el.find('#carouselContent_carousel').remove();
//          $('#carousel').jCarousel({
//            jsonScript : 'images.json'
//          });
        }


        /*************************************************************/
        /* Run initializer                                           */
        /*************************************************************/
        base.init();

    };



    $.fn.jCarousel = function(options){
        return this.each(function(){
            (new $.jCarousel(this, options));
        });
    };



    // This function breaks the chain, but returns
    // the jCarousel if it has been attached to the object.
    $.fn.getjCarousel = function(){
        return this.data("jCarousel");
    };



})(jQuery);
