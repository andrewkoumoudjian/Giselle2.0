// This is a more complete type declaration for monaco-editor to satisfy TypeScript during build
declare module 'monaco-editor' {
  export namespace editor {
    export interface IMarkerData {
      severity: number;
      message: string;
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
      code?: string;
    }

    export interface IStandaloneThemeData {
      base: string;
      inherit: boolean;
      rules: Array<{
        token: string;
        foreground?: string;
        background?: string;
        fontStyle?: string;
      }>;
      colors: {
        [key: string]: string;
      };
    }

    export interface IStandaloneCodeEditor {
      // Add more complete interface to satisfy compile requirements
      layout(): void;
      focus(): void;
      getValue(): string;
      setValue(value: string): void;
      getModel(): ITextModel;
      updateOptions(options: IEditorOptions): void;
      onDidChangeModelContent(listener: (e: IModelContentChangedEvent) => void): IDisposable;
    }

    export interface IModelContentChangedEvent {
      // Minimal interface
      changes: Array<{
        range: IRange;
        text: string;
      }>;
    }

    export interface IRange {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    }

    export interface ITextModel {
      // Minimal interface
      getValue(): string;
      getValueLength(): number;
      getLineCount(): number;
    }

    export interface IDisposable {
      dispose(): void;
    }

    export interface IEditorOptions {
      // Any editor option can go here
      readOnly?: boolean;
      contextmenu?: boolean;
      minimap?: {
        enabled?: boolean;
      };
      [key: string]: any;
    }

    export interface IEditorOverrideServices {
      // Minimal interface
    }

    export interface IStandaloneEditorConstructionOptions extends IEditorOptions {
      value?: string;
      language?: string;
      theme?: string;
      automaticLayout?: boolean;
      readOnly?: boolean;
      minimap?: {
        enabled?: boolean;
      };
      overviewRulerLanes?: number;
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