import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { fabric } from 'fabric';
import Konva from 'konva';


@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnInit, AfterViewInit {
  @ViewChild('konvaContainer', { static: true }) konvaContainer: ElementRef;

  public cameraOn: boolean = true
  private canvas: any
  private image!: WebcamImage
  selectedTool: string | undefined;
  isDrawing: boolean;

  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private polygon: Konva.Line;

  ngOnInit(): void {
    this.initKonva();
  }

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  private initKonva() {
    this.stage = new Konva.Stage({
      container: this.konvaContainer.nativeElement,
      width: 800,
      height: 600
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Add event listener for mouse click to draw a new vertex
    this.stage.on('click', (e) => {
      if (this.polygon) {
        const pos = this.stage.getPointerPosition();
        this.polygon.points([...this.polygon.points(), pos.x, pos.y]);
        this.layer.draw();
      }
    });

    // Add event listener for mouse drag to move the vertex
    this.stage.on('dragmove', (e) => {
      const target = e.target;
      if (target instanceof Konva.Circle) {
        const index = this.polygon.points().indexOf(target.x()) / 2;
        const pos = this.stage.getPointerPosition();
        this.polygon.points()[index * 2] = pos.x;
        this.polygon.points()[index * 2 + 1] = pos.y;
        this.layer.batchDraw();
      }
    });
  }

  startDrawingPolygon() {
    this.layer.destroyChildren(); // Clear existing shapes

    this.polygon = new Konva.Line({
      points: [],
      stroke: 'red',
      strokeWidth: 2,
      closed: true,
      draggable: true
    });

    this.layer.add(this.polygon);
    this.layer.draw();
  }

  getImage(image: WebcamImage) {
    this.image = image
    this.cameraOn = false
  }
}