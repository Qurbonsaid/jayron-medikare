import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: "Навигация",
      items: [
        { keys: ["G", "H"], description: "Бош саҳифа" },
        { keys: ["G", "P"], description: "Беморлар" },
        { keys: ["G", "A"], description: "Навбатлар" },
        { keys: ["G", "L"], description: "Таҳлил натижалари" },
      ]
    },
    {
      category: "Харакатлар",
      items: [
        { keys: ["N"], description: "Янги бемор" },
        { keys: ["Ctrl", "K"], description: "Қидириш" },
        { keys: ["Ctrl", "P"], description: "Рецепт ёзиш" },
        { keys: ["Esc"], description: "Modal ёпиш" },
        { keys: ["?"], description: "Тугмалар рўйхати" },
      ]
    },
    {
      category: "Форма",
      items: [
        { keys: ["Ctrl", "S"], description: "Сақлаш" },
        { keys: ["Ctrl", "Enter"], description: "Юбориш" },
        { keys: ["Tab"], description: "Кейинги майдон" },
        { keys: ["Shift", "Tab"], description: "Олдинги майдон" },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Клавиатура тугмалари</DialogTitle>
          <DialogDescription>
            Тизимда тезкор ишлаш учун қулай комбинациялар
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                    <span className="text-sm">{item.description}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
