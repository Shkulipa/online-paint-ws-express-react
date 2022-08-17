import Tool from './tool';

export default class Circle extends Tool {
  constructor(canvas) {
    super(canvas);
    this.listen();
  }

  listen() {
    this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
    this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    this.canvas.onmouseup = this.mouseUpHandler.bind(this);
  }

  mouseUpHandler(e) {
    this.mouseDown = false;
  }
  mouseDownHandler(e) {
    this.mouseDown = true

    this.startX = e.pageX - e.target.offsetLeft;
    this.startY = e.pageY - e.target.offsetTop;

    this.ctx.beginPath()
    
    this.saved = this.canvas.toDataURL()
  }
  mouseMoveHandler(e) {
    if(this.mouseDown) {
      
  
      this.currentX = e.pageX-e.target.offsetLeft;
      this.currentY = e.pageY-e.target.offsetTop;
  
      this.radius = 0;
      let radiusX = this.currentX - this.startX;
      let radiusY = this.currentY - this.startY;

      // radiusX < radiusY ? this.radius = radiusY : this.radius = radiusX;
      this.radius = Math.sqrt(radiusX**2 + radiusY**2)

      this.draw(this.startX, this.startY,  this.radius)
    }
  }

  draw(x, y, r) {
    const img = new Image()
    img.src = this.saved
    img.onload = async function () {
      this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
      this.ctx.beginPath()
      this.ctx.arc(x, y, r, 0, 2 * Math.PI, false)
      this.ctx.fill();
      this.ctx.stroke()
    }.bind(this)
  }
}