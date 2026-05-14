declare namespace JSX {
  interface IntrinsicElements {
    'a-scene': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      embedded?: boolean
      'vr-mode-ui'?: string
      arjs?: string
    }
    'a-marker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      type?: string
      value?: number
    }
    'a-entity': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'gltf-model'?: string
      scale?: string
      position?: string
      rotation?: string
      animation?: string
      camera?: boolean
    }
    'a-assets': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    'a-asset-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      id?: string
      src?: string
    }
  }
}
