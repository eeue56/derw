import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import * as ts from "typescript";

export function compileTypescript(
    source: string
): Result<ts.Diagnostic[], string> {
    const options: ts.TranspileOptions = {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
        reportDiagnostics: true,
    };
    const output = ts.transpileModule(source, options);

    if (output.diagnostics && output.diagnostics.length > 0) {
        return Err(output.diagnostics);
    }

    return Ok(output.outputText);
}
