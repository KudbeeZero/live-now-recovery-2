declare module "maplibre-gl" {
  export interface GeoJSONSource {
    setData(data: any): void;
    getClusterExpansionZoom(clusterId: number): Promise<number>;
    getClusterChildren(clusterId: number): Promise<any[]>;
  }

  export class Map {
    constructor(options: any);
    on(event: string, layerOrCallback: any, callback?: any): this;
    off(event: string, layerOrCallback: any, callback?: any): this;
    addSource(id: string, source: any): this;
    addLayer(layer: any, before?: string): this;
    removeLayer(id: string): this;
    removeSource(id: string): this;
    getSource(id: string): GeoJSONSource | undefined;
    getLayer(id: string): any;
    getCanvas(): HTMLCanvasElement;
    setFilter(layer: string, filter: any): this;
    flyTo(options: any): this;
    easeTo(options: any): this;
    getZoom(): number;
    remove(): void;
    addControl(control: any, position?: string): this;
    setPitch(pitch: number): this;
    setBearing(bearing: number): this;
    fitBounds(bounds: any, options?: any): this;
    getStyle(): any;
    loaded(): boolean;
    setPaintProperty(layer: string, name: string, value: any): this;
    setLayoutProperty(layer: string, name: string, value: any): this;
    queryRenderedFeatures(point: any, options?: any): any[];
  }

  export class Popup {
    constructor(options?: any);
    setLngLat(lnglat: any): this;
    setHTML(html: string): this;
    addTo(map: any): this;
    remove(): void;
  }

  export class NavigationControl {
    constructor(options?: any);
  }

  export class ScaleControl {
    constructor(options?: any);
  }

  export class AttributionControl {
    constructor(options?: any);
  }

  export class LngLatBounds {
    constructor(sw?: any, ne?: any);
    extend(point: any): this;
    isEmpty(): boolean;
    getCenter(): any;
  }

  const maplibregl: any;
  export default maplibregl;
}

declare namespace maplibregl {
  interface GeoJSONSource {
    setData(data: any): void;
    getClusterExpansionZoom(clusterId: number): Promise<number>;
    getClusterChildren(clusterId: number): Promise<any[]>;
  }
  class Map {
    constructor(options: any);
    on(event: string, layerOrCallback: any, callback?: any): this;
    off(event: string, layerOrCallback: any, callback?: any): this;
    addSource(id: string, source: any): this;
    addLayer(layer: any, before?: string): this;
    removeLayer(id: string): this;
    removeSource(id: string): this;
    getSource(id: string): GeoJSONSource | undefined;
    getLayer(id: string): any;
    getCanvas(): HTMLCanvasElement;
    setFilter(layer: string, filter: any): this;
    flyTo(options: any): this;
    easeTo(options: any): this;
    getZoom(): number;
    remove(): void;
    addControl(control: any, position?: string): this;
    setPitch(pitch: number): this;
    setBearing(bearing: number): this;
    fitBounds(bounds: any, options?: any): this;
    getStyle(): any;
    loaded(): boolean;
    setPaintProperty(layer: string, name: string, value: any): this;
    setLayoutProperty(layer: string, name: string, value: any): this;
    queryRenderedFeatures(point: any, options?: any): any[];
  }
  class Popup {
    constructor(options?: any);
    setLngLat(lnglat: any): this;
    setHTML(html: string): this;
    addTo(map: any): this;
    remove(): void;
  }
  class NavigationControl {
    constructor(options?: any);
  }
  class ScaleControl {
    constructor(options?: any);
  }
  class AttributionControl {
    constructor(options?: any);
  }
  class LngLatBounds {
    constructor(sw?: any, ne?: any);
    extend(point: any): this;
    isEmpty(): boolean;
    getCenter(): any;
  }
}

declare module "geojson" {
  export interface FeatureCollection<G = any, P = any> {
    type: "FeatureCollection";
    features: Array<Feature<G, P>>;
  }
  export interface Feature<G = any, P = any> {
    type: "Feature";
    geometry: G;
    properties: P;
  }
  export interface Point {
    type: "Point";
    coordinates: [number, number];
  }
}
