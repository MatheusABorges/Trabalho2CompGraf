(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.ImageProcessing = {}));
}(this, (function (exports) { 'use strict';

    //transforma um nj array em um array normal para que seja possível utilizara a lib math.js para calcular a inversa
    function toArray(njarray){
        var width = njarray.shape[1];
        var height = njarray.shape[0];
        var saida = []
        for(var i=0; i<height; i++){
            var row = []
            for(var j=0; j<width; j++){
                row.push(njarray.get(i,j));
            }
            saida.push(row);
        }
        return saida;
    }

    //retorna o valor de um pixel após aplicar o filtro box
    function box(points){
        var saida = 0;
        for(var i=0; i<points.length; i++){
            saida += points[i];
        }
        return saida/9;
    }

    //retorna a parte x do filtro de sobel
    function sobel_x(points){
        var saida = 0;
        saida += (points[0]*(-1));
        saida += (points[1]*0);    
        saida += (points[2]*(1));
        saida += (points[3]*(-2));  
        saida += (points[4]*0);         
        saida += (points[5]*(2));
        saida += (points[6]*(-1));
        saida += (points[7]*0);
        saida += (points[8]*(1));
        return saida;
    }

    //retorna a parte y do filtro de sobel
    function sobel_y(points){
        var saida = 0;
        saida += (points[0]*(1));
        saida += (points[1]*(2));    
        saida += (points[2]*(1));
        saida += (points[3]*0);  
        saida += (points[4]*0);         
        saida += (points[5]*0);
        saida += (points[6]*(-1));
        saida += (points[7]*(-2));
        saida += (points[8]*(-1));
        return saida;
    }

    //retorna o valor de um pixel após aplicação do filtro de laplace
    function laplace(points){
        var saida = 0;
        saida += points[0]*0;
        saida += points[1]*-1;
        saida += points[2]*0;
        saida += points[3]*-1;
        saida += points[4]*4;
        saida += points[5]*-1;
        saida += points[6]*0;
        saida += points[7]*-1;
        saida += points[8]*0;
        return saida;
    }

    //realiza o calculo da nova imgagem a partir de um kernel usando icrop
    function kernel_icrop(height, width, img, kernel){
        var newImage = nj.zeros([height-2, width-2]);
        for(var i=1; i<height-1; i++){
            for(var j=1; j<width-1; j++){
                var points = [img.get(i-1, j-1), img.get(i-1, j), img.get(i-1, j+1), img.get(i, j-1), img.get(i, j), img.get(i, j+1),
                    img.get(i+1, j-1), img.get(i+1, j), img.get(i+1, j+1)];
                switch(kernel){
                    case("box"): newImage.set(i-1, j-1, box(points));
                        break;
                    case("sobel"): newImage.set(i-1, j-1, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                        break;
                    case("laplace"): newImage.set(i-1, j-1, laplace(points));
                        break;
                }
            }
        }
        return newImage;
    }

    //realiza o calculo da nova imagem a partir de um kernel usando extend
    function kernel_extend(height, width, img, kernel){
        var newImage = nj.zeros([height, width]);
        //calcula os pixels da imagem exceto as bordas
        for(var i=1; i<height-1; i++){
            for(var j=1; j<width-1; j++){
                var points = [img.get(i-1, j-1), img.get(i-1, j), img.get(i-1, j+1), img.get(i, j-1), img.get(i, j), img.get(i, j+1),
                    img.get(i+1, j-1), img.get(i+1, j), img.get(i+1, j+1)];
                switch(kernel){
                    case("box"): newImage.set(i, j, box(points));
                        break;
                    case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                        break;
                    case("laplace"): newImage.set(i, j, laplace(points));
                        break;
                }
            }
        }
        //calcula os valores dos pixels da primeira linha da imagem
        for(var j=1, i=0; j<width-1; j++){
            var points = [img.get(i, j-1), img.get(i, j), img.get(i, j+1), img.get(i, j-1), img.get(i, j), img.get(i, j+1),
                    img.get(i+1, j-1), img.get(i+1, j), img.get(i+1, j+1)];
            switch(kernel){
                case("box"): newImage.set(i, j, box(points));
                    break;
                case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                    break;
                case("laplace"): newImage.set(i, j, laplace(points));
                    break;
            }
        }

        //calcula os valores dos pixels da ultima linha da imagem
        for(var j=1, i=height-1; j<width-1; j++){
            var points = [img.get(i-1, j-1), img.get(i-1, j), img.get(i-1, j+1), img.get(i, j-1), img.get(i, j), img.get(i, j+1), 
                img.get(i, j-1), img.get(i, j), img.get(i, j+1)];
            switch(kernel){
                case("box"): newImage.set(i, j, box(points));
                    break;
                case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                    break;
                case("laplace"): newImage.set(i, j, laplace(points));
                    break;
            }
        }

        //calcula os valores dos pixels da primeira coluna da imagem
        for(var i=1, j=0; i<height-1; i++){
            var points = [img.get(i-1, j), img.get(i-1, j), img.get(i-1, j+1), img.get(i, j), img.get(i, j), img.get(i, j+1), 
                img.get(i+1, j), img.get(i+1, j), img.get(i+1, j+1)];
            switch(kernel){
                case("box"): newImage.set(i, j, box(points));
                    break;
                case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                    break;
                case("laplace"): newImage.set(i, j, laplace(points));
                    break;
            }
        }

        //calcula os valores dos pixels da ultima coluna da imagem
        for(var i=1, j=width-1; i<height-1; i++){
            var points = [img.get(i-1, j-1), img.get(i-1, j), img.get(i-1, j), img.get(i, j-1), img.get(i, j), img.get(i, j), 
                img.get(i+1, j-1), img.get(i+1, j), img.get(i+1, j)];
            switch(kernel){
                case("box"): newImage.set(i, j, box(points));
                    break;
                case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                    break;
                case("laplace"): newImage.set(i, j, laplace(points));
                    break;
            }
        }

        //calcula o valor do pixel do canto superior esquerdo da imagem
        var i = 0, j = 0;
        var points = [img.get(i,j), img.get(i,j), img.get(i, j+1), img.get(i, j), img.get(i,j), img.get(i,j+1), 
            img.get(i+1, j), img.get(i+1, j), img.get(i+1, j+1)];
        switch(kernel){
            case("box"): newImage.set(i, j, box(points));
                break;
            case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                break;
            case("laplace"): newImage.set(i, j, laplace(points));
                break;
        }
        
        //calcula o valor do pixel do canto superior direito da imagem
        i=0;
        j=width-1;
        points = [img.get(i, j-1), img.get(i, j), img.get(i,j), img.get(i,j-1), img.get(i,j), img.get(i,j), 
            img.get(i+1, j-1), img.get(i+1, j), img.get(i+1, j)];
        switch(kernel){
            case("box"): newImage.set(i, j, box(points));
                break;
            case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                break;
            case("laplace"): newImage.set(i, j, laplace(points));
                break;
        }

        //calcula o valor do pixel do canto inferior esquerdo da imagem
        i=height-1;
        j=0;
        points = [img.get(i-1,j), img.get(i-1, j), img.get(i-1, j+1), img.get(i, j), img.get(i,j), img.get(i, j+1), 
            img.get(i,j), img.get(i,j), img.get(i, j+1)];
        switch(kernel){
            case("box"): newImage.set(i, j, box(points));
                break;
            case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                break;
            case("laplace"): newImage.set(i, j, laplace(points));
                break;
        }

        //calcula o valor do pixel do canto inferior direito da imagem
        i = height-1;
        j = width-1;
        points = [img.get(i-1,j-1), img.get(i-1,j), img.get(i-1,j), img.get(i,j-1), img.get(i,j), img.get(i,j), 
            img.get(i, j-1), img.get(i, j), img.get(i,j)];
        switch(kernel){
            case("box"): newImage.set(i, j, box(points));
                break;
            case("sobel"): newImage.set(i, j, Math.sqrt(Math.pow(sobel_x(points),2) + Math.pow(sobel_y(points),2)));
                break;
            case("laplace"): newImage.set(i, j, laplace(points));
                break;
        }

        return newImage;
    }

    //multiplica matriz 3x3 por vetor de dimensão 3
    function multiply(matrix, vector){
        var rows = matrix.shape[0];
        var columns = matrix.shape[1];
        var saida = []
        for(var i = 0; i<rows; i++){
            saida.push(0);
            for(var j=0; j<columns; j++){
                saida[i] += (matrix.get(i, j) * vector.get(j));
            }
        }
        return nj.array(saida);
    }


    //aplica uma transformação a um pixel
    function apply_transf(i, j, inv_xform){
        var point = nj.array([i, j, 1]);
        var saida = multiply(inv_xform, point);
        saida.set(0, Math.round(saida.get(0)));
        saida.set(1, Math.round(saida.get(1)));
        return saida;
    }

    //realiza o foward mapping para saber os e retorna os intervalos da imagem resultante
    function fowardMapping(xform, img){
        var height = img.shape[0];
        var width = img.shape[1];
        var point = multiply(xform, nj.array([0,0,1]));
        var min_x = point.get(0);
        var min_y = point.get(1);
        var max_x = point.get(0);
        var max_y = point.get(1);
        for(var i=0; i<height; i++){
            for(var j=0; j<width; j++){
                point = multiply(xform, nj.array([i,j,1]));
                if(point.get(0) > max_x)
                    max_x = point.get(0);
                if(point.get(0) < min_x)
                    min_x = point.get(0);
                if(point.get(1) > max_y)
                    max_y = point.get(1);
                if(point.get(1) < min_y)
                    min_y = point.get(1);
            }
        }
        return [Math.round(max_x - min_x), Math.round(max_y - min_y)];
    }

    //realiza a transformação afim em uma imagem e retorna o resultado 
    //o faz apicando primeiramente o foward mapping para se saber as dimensões do resultado
    //e em seguida realiza o inverse mapping para de fato calcular a imagem gerada
    //obs: o inverse map utiliza closest point.
    function transform(img, xform){
        var inv = math.inv(toArray(xform));
        var inv_xform = nj.array(inv);
        var dimensions = fowardMapping(xform, img);
        var height = dimensions[0];
        var width = dimensions[1];
        var newImg = nj.zeros([height, width]);
        for(var i=0; i<height; i++){
            for(var j=0; j<width; j++){
                var coords = apply_transf(i, j, inv_xform);
                if(coords.get(0)> img.shape[0] || coords.get(1) > img.shape[1])
                    newImg.set(i, j, 0);
                else
                    newImg.set(i, j, img.get(coords.get(0), coords.get(1)));
            }
        }
        return newImg;
    }


    function ImageProcesser(img, kernel = null, xform = null, bhandler = 'icrop') {
        this.img = img.clone();
        this.width = img.shape[1];
        this.height = img.shape[0];
        this.kernel = kernel;
        this.xform = xform;
        this.bhandler = bhandler;
    }

    Object.assign( ImageProcesser.prototype, {

        apply_kernel: function(border = 'icrop') {
            if(border == 'icrop'){
                this.img = kernel_icrop(this.height, this.width, this.img, this.kernel);
                //this.img = nj.images.scharr(this.img);
            }else if(border == 'extend'){
                this.img = kernel_extend(this.height, this.width, this.img, this.kernel);
            }
        },

        apply_xform: function()  {
            this.img = transform(this.img, this.xform);
            
        },

        update: function() {
            // Method to process image and present results
            var start = new Date().valueOf();

            if(this.kernel != null) {
                this.apply_kernel(this.bhandler);
            }

            if(this.xform != null) {
                this.apply_xform();
            }

            // Loading HTML elements and saving
            var $transformed = document.getElementById('transformed');
            $transformed.width = this.width; 
            $transformed.height = this.height;
            nj.images.save(this.img, $transformed);
            var duration = new Date().valueOf() - start;
            document.getElementById('duration').textContent = '' + duration;
        }

    } )


    exports.ImageProcesser = ImageProcesser;
    
    
})));

