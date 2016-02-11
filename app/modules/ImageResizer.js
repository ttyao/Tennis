window.ImageResizer = {
  resizeImage: function(file, callback) {
    if(!(/image/i).test(file.type)) {
      alert( "File "+ file.name +" is not an image." );
      return false;
    }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function (event) {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL

      // helper Image object
      var image = new Image();
      image.src = blobURL;
      image.onload = function() {
        // have to wait till it's loaded
        var resized = window.ImageResizer.resizeMe(image, callback); // send it to canvas
      }
    };
  },

  // === RESIZE ====

  resizeMe: function(img, callback) {

    var canvas = document.createElement('canvas');

    var width = img.width;
    var height = img.height;
    var max_width = 400;
    var max_height = 300;

    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > max_width) {
        //height *= max_width / width;
        height = Math.round(height *= max_width / width);
        width = max_width;
      }
    } else {
      if (height > max_height) {
        //width *= max_height / height;
        width = Math.round(width *= max_height / height);
        height = max_height;
      }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // console.log(canvas.toDataURL("image/jpeg",0.7));
    canvas.toBlob(function(blob) {
      if (callback) {
        callback(blob);
      }
    }, 'image/jpeg');
    return null;
    // return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
    //return window.ReImg.fromCanvas(canvas).toPng();
  },
};
