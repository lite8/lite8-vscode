import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(
        {language: "lite8"}, new Lite8DocumentSymbolProvider()
    ));
    
    // context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(
    //     {language: "lite8"}, new Lite8FoldingProvider()
    // ));
    // context.subscriptions.push(vscode.languages.registerHoverProvider(
    //     {language: "lite8"}, new Lite8HoverProvider()
    // ));    
}

class Lite8DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    private format(cmd: string):string{
        return cmd.substr(1).toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }
    public provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            const txt = document.getText();
            const regex = /(__\w+__)/gm;
            let m,i;
            let _symbols = [];
            while ((m = regex.exec(txt)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                
                _symbols.push({
                    name: m[0],
                    start: m.index,
                    finish: 0
                })
                // The result can be accessed through the `m`-variable.
                // m.forEach((match, groupIndex) => {
                //     console.log(`Found match, group ${groupIndex}: ${match}`);
                // });
            }
            for(i=0;i<_symbols.length-1;i++){
                _symbols[i].finish = _symbols[i+1].start-1;
            }
            _symbols[_symbols.length-1].finish = txt.length-1;

            let symbols: vscode.DocumentSymbol[] = [];
            for (i = 0; i < _symbols.length; i++) {
                var sym = _symbols[i];
                var r = new vscode.Range( document.positionAt(sym.start), document.positionAt(sym.finish) );
                let marker_symbol = new vscode.DocumentSymbol(
                    //this.format(tokens[0]) + " " + tokens[1],
                    sym.name,
                    'Component',
                    vscode.SymbolKind.Enum,
                    r,r
                )
                symbols.push(marker_symbol);
            }
            resolve(symbols);
        });
    }
    /* private _quickSymbols(txt: string) {

    }
    public _old_provideDocumentSymbols(document: vscode.TextDocument,
            token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            // var symbols = [];
            let symbols: vscode.DocumentSymbol[] = [];
            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);
                if (line.text.startsWith("__")) {
                    
                    let marker_symbol = new vscode.DocumentSymbol(
                        //this.format(tokens[0]) + " " + tokens[1],
                        line.text.substr(2, line.text.length - 4),
                        'Component',
                        vscode.SymbolKind.Struct,
                        line.range, line.range)
                    symbols.push(marker_symbol);
                }
            }
            resolve(symbols);
        });
    } */
}

class Lite8FoldingProvider implements vscode.FoldingRangeProvider {
    async provideFoldingRanges(
        document: vscode.TextDocument, 
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): Promise<vscode.FoldingRange[] | undefined> {
        return new Promise((resolve, reject) => {
            var ranges = [];
            var prev = -1;
            for (var i = 0; i < document.lineCount; i++) {
                var line = document.lineAt(i);
                if (line.text.startsWith("__")) {
                    if (prev >= 0) {
                        ranges.push({
                            start: prev,
                            end: i - 1,
                            kind: vscode.FoldingRangeKind.Region
                        });
                    }
                    prev = i;
                }
            }
            ranges.push({
                start: prev,
                end: document.lineCount - 1,
                kind: vscode.FoldingRangeKind.Region
            });
            resolve(ranges);
        });
    }
    
}
// class Lite8FoldingProvider implements vscode.FoldingRangeProvider {
//     public provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext,
//             token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
//         return new Promise((resolve, reject) => {
//             var ranges = [];
//             var prev = -1;
//             for (var i = 0; i < document.lineCount; i++) {
//                 var line = document.lineAt(i);
//                 if (line.text.startsWith("__")) {
//                     if (prev >= 0) {
//                         ranges.push({
//                             start: prev,
//                             end: i - 1,
//                             kind: vscode.FoldingRangeKind.Region
//                         });
//                     }
//                     prev = i;
//                 }
//             }
//             ranges.push({
//                 start: prev,
//                 end: document.lineCount - 1,
//                 kind: vscode.FoldingRangeKind.Region
//             });
//             resolve(ranges);
//         });
//     }
    
// }

// this method is called when your extension is deactivated
export function deactivate() {}
