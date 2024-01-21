import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { fabric } from 'fabric';


@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit, AfterViewInit {
  @ViewChild('annocanvas') canvasRef!: ElementRef
  public cameraOn: boolean = true
  private canvas: any
  private image!: WebcamImage
  selectedTool: string | undefined;
  isDrawing: boolean;
  private currentLine: fabric.Line;

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, { height: innerHeight - 200, width: innerWidth - 200 })

    this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
    this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
    this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
  }

  getImage(image: WebcamImage) {
    this.image = image
    this.cameraOn = false
    const imgElement = new Image();
    imgElement.src = this.image?.imageAsDataUrl;
    const fabricImage = new fabric.Image(imgElement, {
      left: 0,
      top: 0,
      height: imgElement.height,
      width: imgElement.width,
      scaleX: this.canvas.width / imgElement.width,
      scaleY: this.canvas.height / imgElement.height,
      selectable: false
    });

    this.canvas.add(fabricImage);
    this.canvas.renderAll();
  }

  handleMouseDown(event: fabric.IEvent) {
    if (!this.isDrawing) {
      const pointer = this.canvas.getPointer(event.e);

      // Create a new line
      this.currentLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        stroke: 'black',
        strokeWidth: 2,
        originX: 'left',
        originY: 'top',
      });

      this.canvas.add(this.currentLine);

      this.isDrawing = true;
    }
  }

  handleMouseMove(event: fabric.IEvent) {
    if (this.isDrawing) {
      const pointer = this.canvas.getPointer(event.e);

      // Update the line coordinates
      this.currentLine.set({ x2: pointer.x, y2: pointer.y });

      this.canvas.renderAll();
    }
  }
  handleMouseUp() {
    this.isDrawing = false;
  }

}