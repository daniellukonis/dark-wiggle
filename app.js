const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth - 50;
  canvas.height = window.innerHeight - 50;
}

function clearCanvas(canvas, context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

let clear = true;
canvas.addEventListener('click', () => {
  clear = clear ? false : true;
})

resizeCanvas(canvas);

class EndPoint {
  constructor(canvas, context) {
    
    this.canvas = canvas;
    this.context = context;

    this.margin = Math.round(this.canvas.width * this.canvas.height * 0.0001);

    this.x = Math.round(
      (this.canvas.width - this.margin * 2) * Math.random()
      ) + this.margin;
    this.y = Math.round(
      (this.canvas.height - this.margin * 2) * Math.random()
      ) + this.margin;
    this.xSpeed = Math.random() * (Math.random() > 0.5 ? 1 : -1);
    this.ySpeed = Math.random() * (Math.random() > 0.5 ? 1 : -1);

    this.angleX = Math.PI * 2 * Math.random();
    this.angleXSpeed = 0.1;
    this.angleY = Math.PI * 2 * Math.random();
    this.angleYSpeed = 0.05;

    this.currentX = this.canvas.width / 2;
    this.currentY = this.canvas.height / 2;
    this.slideDistance = 5;

    this.dotDistance = 0;
    this.dotSpeed = 3;
    
    this.nextAngle = 0;
    this.nextDistance = 0;

    this.endpointRadius = 4;
    this.endpointGrowth = 0;
    this.dotRadius = 4;

    this.next;
  }

  calcDistance() {
    const x1 = this.currentX;
    const x2 = this.next.currentX;
    const y1 = this.currentY;
    const y2 = this.next.currentY;
    
    const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2); 

    this.nextDistance = distance;
  }

  calcAngle() {
    const x1 = this.currentX;
    const x2 = this.next.currentX;
    const y1 = this.currentY;
    const y2 = this.next.currentY;

    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.nextAngle = angle;
  }

  calcCurrent() {
    this.currentX = this.x + (this.slideDistance * Math.sin(this.angleX));
    this.currentY = this.y + (this.slideDistance * Math.sin(this.angleY));
  }

  calcCoords() {
    this.x += this.xSpeed;
    if(this.x >= this.canvas.width - this.margin
      ||
      this.x <= this.margin
      ) {
        this.xSpeed *= -1;
      }

      this.y += this.ySpeed;
    if(this.y >= this.canvas.height - this.margin
      ||
      this.y <= this.margin
      ) {
        this.ySpeed *= -1;
      }
  }

  drawEndpoint({context} = this) {

    context.save();
    context.fillStyle = '#555'
    context.translate(this.currentX, this.currentY);
    context.beginPath();
    context.arc(0, 0, this.endpointRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  drawConnection({context} = this) {

    context.save();
    context.strokeStyle = '#00000010'
    context.translate(this.currentX, this.currentY);
    context.rotate(this.nextAngle);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.nextDistance, 0);
    context.stroke();
    context.restore();
  }

  drawDot({context} = this) {

    context.save();
    context.fillStyle = '#000';
    context.translate(this.currentX, this.currentY);
    context.rotate(this.nextAngle);
    context.beginPath();
    context.arc(this.dotDistance, 0, this.dotRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  getCoords(){
    return {x: this.x, y:this.y}
  }

  setNext(obj) {
    this.next = obj;
  }

  move() {
    this.calcCurrent();
    this.calcCoords();
    this.calcDistance();
    this.calcAngle();
    this.angleX += this.angleXSpeed;
    this.angleY += this.angleYSpeed;

    // if(this.dotDistance > this.nextDistance) {
    //   this.dotDistance = 0;
    //   this.next.startDot();

    // } else if(this.dotDistance >= 1){
    //   this.dotDistance += this.dotSpeed;
    // }
  }

  startDot() {
    this.dotDistance = 1;

    if(this.endpointRadius > this.dotRadius * 4) {
      this.endpointGrowth *= -1;
    }
    if(this.endpointRadius <= this.dotRadius) {
      this.endpointGrowth *= -1;
    }

    this.endpointRadius += this.endpointGrowth;
  }

  animate() {
    this.move();
    this.drawEndpoint();
    this.drawConnection();
    this.drawDot();
  }
}

const endPoints = []
const maxPoints = 50;
for(let i = 0; i < maxPoints; i++) {
  endPoints.push(new EndPoint(canvas, context))
}

endPoints.forEach((e, i, a) => {
  if(i >= a.length - 1) {
    e.setNext(a[0])
  } else {
    e.setNext(a[i + 1]);
  }
  e.animate();
})

// endPoints[0].startDot();

function loop(multiple = true) {

  // clear && clearCanvas(canvas, context);
  endPoints.forEach(e => e.animate());

  multiple && requestAnimationFrame(loop);
}

loop()
