import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import Konva from 'konva';


@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit, AfterViewInit {
  @ViewChild('konvaContainer', { static: true }) konvaContainer: ElementRef;

  public cameraOn: boolean = true
  private image!: WebcamImage
  selectedTool: string | undefined;
  isDrawing: boolean;
  webcamWidth = 640;
  webcamHeight = 480;
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private shapeType: 'rect' | 'polygon' | 'line';
  private drawingShape: Konva.Shape
  rectangle: any;
  polygonPoints: any[] = []
  mouseDownEvent: any
  shapes: any;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

  }

  private initKonva() {
    this.stage = new Konva.Stage({
      container: this.konvaContainer.nativeElement,
      width: this.webcamWidth,
      height: this.webcamHeight
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Load and set the background image
    const backgroundImage = new Konva.Image({
      x: 0,
      y: 0,
      width: this.stage.width(),
      height: this.stage.height()
    } as any);

    const imageElement = new Image();
    imageElement.onload = () => {
      backgroundImage.image(imageElement);
      this.layer.add(backgroundImage);
      this.layer.draw();
    };
    imageElement.src = this.image.imageAsDataUrl;

    // Handle mouse down events
    this.stage.on('mousedown', (event) => {
      this.onMouseDown(event.evt);
    });

    // Handle mouse up events
    this.stage.on('mouseup', (e) => {
      this.onMouseUp(e.evt);
    });

    this.stage.on('touchstart', (event) => {
      this.onMouseDown(this.touchEventToMouseEvent(event.evt));
    });

    // Handle mouse up events
    this.stage.on('touchend', (e) => {
      this.onMouseUp(this.touchEventToMouseEvent(e.evt));
    });
  }

  startDrawingShape(shapeType: 'rect' | 'polygon' | 'line'): void {
    // Handle button click events and start drawing the selected shape
    this.polygonPoints = []
    this.isDrawing = true;
    this.shapeType = shapeType
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseDownEvent = {
      x: event.x,
      y: event.y,
    }
    // Handle mouse down events to start the drawing
    if (this.isDrawing) {
      const stagePointer = this.stage.getPointerPosition();
      console.log(stagePointer);

      if (this.shapeType === 'polygon' || this.shapeType === 'line') {
        this.polygonPoints = [...this.polygonPoints, stagePointer.x, stagePointer.y]
        this.drawingShape = new Konva.Line({
          points: [...this.polygonPoints],
          stroke: 'red',
          strokeWidth: 2,
          closed: this.shapeType === 'polygon',
          draggable: true
        });
      } else if (this.shapeType === 'rect') {
        this.stage.container().style.cursor = 'crosshair'
        this.drawingShape = new Konva.Rect({
          x: stagePointer.x,
          y: stagePointer.y,
          width: 0,
          height: 0,
          stroke: 'red',
          strokeWidth: 2,
          draggable: true
        });

        // add cursor styling
        this.drawingShape.on('mouseover', function () {
          document.body.style.cursor = 'pointer';
        });
        this.drawingShape.on('mouseout', function () {
          document.body.style.cursor = 'default';
        });
      }

      this.layer.add(this.drawingShape);
      this.layer.batchDraw();
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.stage.container().style.cursor = 'default'
    console.log(event);
    if (this.isDrawing) {
      const stagePointer = this.stage.getPointerPosition();
      console.log(stagePointer);

      if (this.drawingShape instanceof Konva.Line) {
        // Update line points for polygon and polyline
        this.drawingShape.points([...this.polygonPoints, stagePointer.x, stagePointer.y]);
      } else if (this.drawingShape instanceof Konva.Rect) {
        // Update rectangle dimensions
        this.drawingShape.width(event.x - this.mouseDownEvent.x);
        this.drawingShape.height(event.y - this.mouseDownEvent.y);
      }
      this.layer.batchDraw();
    }

    // Handle mouse up events to complete the drawing

    this.drawingShape = null;
    this.mouseDownEvent = {}
    if (this.shapeType === 'polygon') return
    this.isDrawing = false;
  }

  getImage(image: WebcamImage) {
    this.image = image
    this.cameraOn = false
    this.initKonva()
  }

  clear() {
    this.stage.clear()
    this.polygonPoints = []
    this.isDrawing = false
    // Load and set the background image
    const backgroundImage = new Konva.Image({
      x: 0,
      y: 0,
      width: this.stage.width(),
      height: this.stage.height()
    } as any);

    const imageElement = new Image();
    imageElement.onload = () => {
      backgroundImage.image(imageElement);
      this.layer.add(backgroundImage);
      this.layer.draw();
    };
    imageElement.src = this.image.imageAsDataUrl;
  }

  touchEventToMouseEvent(touchEvent: TouchEvent): MouseEvent {
    const touch = touchEvent.touches && touchEvent.touches.length > 0 ? touchEvent.touches[0] : null;
    const { view, detail, ctrlKey, altKey, shiftKey, metaKey } = touchEvent;

    if (touch) {
      const { screenX, screenY, clientX, clientY } = touch;
      return new MouseEvent('converted', {
        bubbles: true,
        cancelable: true,
        view,
        detail,
        ctrlKey,
        altKey,
        shiftKey,
        metaKey,
        screenX: screenX !== undefined ? screenX : 0,
        screenY: screenY !== undefined ? screenY : 0,
        clientX: clientX !== undefined ? clientX : 0,
        clientY: clientY !== undefined ? clientY : 0
      });
    } else {
      // Handle the case where there are no touches
      console.error('No touches available in the TouchEvent:', touchEvent);
      return new MouseEvent('converted', { bubbles: true, cancelable: true });
    }
  }

  exportAnnotatedImage(format: 'jpg' | 'png'): void {
    const dataURL = this.stage.toDataURL({ mimeType: `image/${format}`, quality: 1 });
    this.downloadFile(dataURL, `annotated_image.${format}`, `image/${format}`);
  }

  private downloadFile(data: string, fileName: string, fileType: string): void {
    const blob = this.dataURLtoBlob(data);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

  exportAnnotations(): void {
    const annotationsJSON = JSON.stringify(this.shapes.map(shape => shape.toObject()));
    this.downloadFile(annotationsJSON, 'annotations.json', 'application/json');
  }

}