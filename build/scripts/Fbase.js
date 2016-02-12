

// var ImageArea = React.createClass({
//   propTypes: {
//     image: React.PropTypes.string
//   },

//   onSelectFile: function(e) {
//     if (e.target.files.length !== 1) {
//       return;
//     }

//     var file = e.target.files[0];
//     // check MIME type
//     if (!/^image\/(png|jpeg|gif)$/.test(file.type)) {
//       return;
//     }

//     imageActions.loadImage(file);
//   },

//   onDragOver: function(e) {
//     e.preventDefault();
//   },

//   onDrop: function(e) {
//     e.preventDefault();

//     if (e.dataTransfer.files.length !== 1) {
//       return;
//     }

//     var file = e.dataTransfer.files[0];
//     // check MIME type
//     if (!/^image\/(png|jpeg|gif)$/.test(file.type)) {
//       return;
//     }

//     imageActions.loadImage(file);
//   },

//   render: function() {
//     var img;
//     if (this.props.image.length > 0) {
//       img = (
//         <img src={this.props.image} className="picture" onDragOver={this.onDragOver} onDrop={this.onDrop} />
//       );
//     } else {
//       img = (
//         <img src="./image/noimage.png" className="picture" onDragOver={this.onDragOver} onDrop={this.onDrop} />
//       );
//     }
//     return (
//       <div className="col-sm-12">
//         <input type="file" name="imageFile" onChange={this.onSelectFile} />
//       </div>
//     );
//   }
// });


// React.render(<App />, document.getElementById('app'));
