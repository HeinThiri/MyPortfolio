import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';

type Channel = 'R' | 'G' | 'B';

let glassUid = 0;

/**
 * Liquid-glass surface — an SVG displacement-map refraction applied through
 * `backdrop-filter`. Ported from the React Bits `GlassSurface` component.
 *
 * The refraction only renders in Chromium (Chrome/Edge); Safari and Firefox
 * fall back to a plain frosted-glass surface via `.glass-surface--fallback`.
 */
@Component({
  selector: 'aurora-glass-surface',
  standalone: true,
  templateUrl: './glass-surface.html',
  styleUrl: './glass-surface.scss',
})
export class GlassSurface implements AfterViewInit, OnDestroy {
  readonly width = input<number | string>(200);
  readonly height = input<number | string>(80);
  readonly borderRadius = input(20);
  readonly borderWidth = input(0.07);
  readonly brightness = input(50);
  readonly opacity = input(0.93);
  readonly blur = input(11);
  readonly displace = input(0);
  readonly backgroundOpacity = input(0);
  readonly saturation = input(1);
  readonly distortionScale = input(-180);
  readonly redOffset = input(0);
  readonly greenOffset = input(10);
  readonly blueOffset = input(20);
  readonly xChannel = input<Channel>('R');
  readonly yChannel = input<Channel>('G');
  readonly mixBlendMode = input('difference');

  private readonly uid = glassUid++;
  readonly filterId = `aurora-glass-${this.uid}`;
  readonly redGradId = `aurora-glass-red-${this.uid}`;
  readonly blueGradId = `aurora-glass-blue-${this.uid}`;

  readonly svgSupported = signal(false);

  private readonly container = viewChild<ElementRef<HTMLDivElement>>('container');
  private readonly feImage = viewChild<ElementRef<SVGFEImageElement>>('feImage');
  private readonly redChannel = viewChild<ElementRef<SVGFEDisplacementMapElement>>('redChannel');
  private readonly greenChannel = viewChild<ElementRef<SVGFEDisplacementMapElement>>('greenChannel');
  private readonly blueChannel = viewChild<ElementRef<SVGFEDisplacementMapElement>>('blueChannel');
  private readonly gaussianBlur = viewChild<ElementRef<SVGFEGaussianBlurElement>>('gaussianBlur');

  private resizeObserver?: ResizeObserver;

  constructor() {
    // Re-apply the filter whenever a relevant input (or the resolved view refs) changes.
    effect(() => {
      // Touch the reactive inputs so the effect re-runs when they change.
      this.width();
      this.height();
      this.borderRadius();
      this.borderWidth();
      this.brightness();
      this.opacity();
      this.blur();
      this.displace();
      this.distortionScale();
      this.redOffset();
      this.greenOffset();
      this.blueOffset();
      this.xChannel();
      this.yChannel();
      this.mixBlendMode();
      this.applyFilter();
    });
  }

  ngAfterViewInit(): void {
    this.svgSupported.set(this.supportsSvgFilters());

    const el = this.container()?.nativeElement;
    if (el) {
      this.resizeObserver = new ResizeObserver(() => {
        setTimeout(() => this.updateDisplacementMap(), 0);
      });
      this.resizeObserver.observe(el);
    }
    this.applyFilter();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  cssSize(value: number | string): string | null {
    if (typeof value === 'number') return `${value}px`;
    // `auto` defers sizing to CSS so consumers can stretch the surface responsively.
    return value === 'auto' ? null : value;
  }

  filterUrl(): string {
    return `url(#${this.filterId})`;
  }

  private generateDisplacementMap(): string {
    const rect = this.container()?.nativeElement.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (this.borderWidth() * 0.5);
    const r = this.borderRadius();

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${this.redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${this.blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${r}" fill="url(#${this.redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${r}" fill="url(#${this.blueGradId})" style="mix-blend-mode: ${this.mixBlendMode()}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${r}" fill="hsl(0 0% ${this.brightness()}% / ${this.opacity()})" style="filter:blur(${this.blur()}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }

  private updateDisplacementMap(): void {
    this.feImage()?.nativeElement.setAttribute('href', this.generateDisplacementMap());
  }

  private applyFilter(): void {
    this.updateDisplacementMap();

    const channels: Array<[ElementRef<SVGFEDisplacementMapElement> | undefined, number]> = [
      [this.redChannel(), this.redOffset()],
      [this.greenChannel(), this.greenOffset()],
      [this.blueChannel(), this.blueOffset()],
    ];

    for (const [ref, offset] of channels) {
      const node = ref?.nativeElement;
      if (!node) continue;
      node.setAttribute('scale', (this.distortionScale() + offset).toString());
      node.setAttribute('xChannelSelector', this.xChannel());
      node.setAttribute('yChannelSelector', this.yChannel());
    }

    this.gaussianBlur()?.nativeElement.setAttribute('stdDeviation', this.displace().toString());
  }

  private supportsSvgFilters(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) {
      return false;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${this.filterId})`;
    return div.style.backdropFilter !== '';
  }
}
