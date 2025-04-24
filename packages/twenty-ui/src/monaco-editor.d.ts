// This is a simplified type declaration for monaco-editor to satisfy TypeScript during build
declare module 'monaco-editor' {
  export namespace editor {
    export interface IStandaloneCodeEditor {
      // Add minimal interface to satisfy compile requirements
      layout(): void;
      focus(): void;
      getValue(): string;
      setValue(value: string): void;
    }

    export interface IModelContentChangedEvent {
      // Minimal interface
    }

    export interface ITextModel {
      // Minimal interface
    }

    export interface IEditorOverrideServices {
      // Minimal interface
    }

    export interface IStandaloneEditorConstructionOptions {
      value?: string;
      language?: string;
      theme?: string;
      automaticLayout?: boolean;
      readOnly?: boolean;
      minimap?: {
        enabled?: boolean;
      };
    }

    export function create(element: HTMLElement, options?: IStandaloneEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneCodeEditor;
    
    // Add theme configuration
    export namespace editor {
      export interface IColors {
        [key: string]: string;
      }
    }
  }
}