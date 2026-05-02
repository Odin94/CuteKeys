import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppDefinition, AppHotkeyOverrides } from "@/types/hotkey";
import { buildZedOverrides, mergeOverrides, parseZedKeymap } from "@/lib/zed-keymap-import";

type ZedKeymapImportButtonProps = {
  app: AppDefinition;
  currentOverrides: AppHotkeyOverrides;
  onImported: (next: AppHotkeyOverrides) => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "success"; matched: number; unmatchedActions: string[] }
  | { kind: "error"; message: string };

export const ZedKeymapImportButton = ({
  app,
  currentOverrides,
  onImported,
}: ZedKeymapImportButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseZedKeymap(text);
      const result = buildZedOverrides(app, parsed);
      const merged = mergeOverrides(currentOverrides, result.overrides);
      onImported(merged);
      setStatus({
        kind: "success",
        matched: result.matched,
        unmatchedActions: result.unmatchedActions,
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to parse keymap.json",
      });
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setStatus({ kind: "idle" });
          inputRef.current?.click();
        }}
        className="rounded-xl border-[#F5E6D8] dark:border-[#5A5570] text-[#8D6E63] dark:text-[#B0BEC5] gap-1.5 cursor-pointer"
        title="Override hotkeys from your Zed keymap.json"
      >
        <Upload className="h-3.5 w-3.5" />
        Import keymap.json
      </Button>
      {status.kind === "success" ? (
        <span className="text-[11px] text-[#059669] dark:text-[#6EE7B7]">
          Imported {status.matched} hotkey{status.matched === 1 ? "" : "s"}
          {status.unmatchedActions.length > 0
            ? ` · ${status.unmatchedActions.length} unknown action${
                status.unmatchedActions.length === 1 ? "" : "s"
              } skipped`
            : ""}
        </span>
      ) : null}
      {status.kind === "error" ? (
        <span className="text-[11px] text-[#DC2626] dark:text-[#FCA5A5] max-w-[240px] text-right">
          {status.message}
        </span>
      ) : null}
    </div>
  );
};
