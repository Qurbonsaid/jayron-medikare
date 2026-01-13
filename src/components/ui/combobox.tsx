import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import * as React from 'react';

export interface ComboBoxOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: ComboBoxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Infinite scroll
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  // Mobile optimization
  autoFocus?: boolean;
  // Render customization
  renderOption?: (option: ComboBoxOption) => React.ReactNode;
}

export const ComboBox = React.forwardRef<HTMLButtonElement, ComboBoxProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyText = 'No results found',
      loadingText = 'Loading...',
      className,
      disabled,
      searchValue,
      onSearchChange,
      onScroll,
      isLoading,
      hasMore,
      autoFocus = true,
      renderOption,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalSearch, setInternalSearch] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const search = searchValue ?? internalSearch;
    const setSearch = onSearchChange ?? setInternalSearch;

    // Get selected option label
    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel = selectedOption?.label || placeholder;

    // Focus input when opening (desktop only via autoFocus prop)
    React.useEffect(() => {
      if (open && autoFocus && inputRef.current) {
        // Small delay to ensure popover is rendered
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [open, autoFocus]);

    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      setOpen(false);
      setSearch(''); // Clear search after selection
    };

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={ref}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              !value && 'text-muted-foreground',
              className
            )}
          >
            <span className='truncate'>{displayLabel}</span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align='start'
            side='bottom'
            sideOffset={4}
            className={cn(
              'z-50 w-full min-w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)]',
              'rounded-md border bg-popover p-0 text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            onOpenAutoFocus={(e) => {
              // Prevent Radix from stealing focus on mobile
              e.preventDefault();
            }}
            onCloseAutoFocus={(e) => {
              // Prevent focus return issues
              e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              // Allow clicking on input without closing
              const target = e.target as HTMLElement;
              if (inputRef.current?.contains(target)) {
                e.preventDefault();
              }
            }}
            onWheel={(e) => {
              // Prevent wheel event from closing popover
              e.stopPropagation();
            }}
          >
            {/* Search Input */}
            <div
              className='flex items-center border-b px-3 py-2'
              onPointerDown={(e) => {
                // Prevent popover from closing when clicking input area
                e.stopPropagation();
              }}
            >
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape') {
                    setOpen(false);
                  }
                  if (e.key === 'Enter' && options.length === 1) {
                    handleSelect(options[0].value);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div
              className='max-h-[300px] overflow-y-auto overscroll-contain p-1'
              onScroll={onScroll}
              onWheel={(e) => {
                // Allow wheel scrolling within the container
                e.stopPropagation();
              }}
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {isLoading && options.length === 0 ? (
                <div className='flex items-center justify-center py-6 text-sm text-muted-foreground'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {loadingText}
                </div>
              ) : options.length === 0 ? (
                <div className='py-6 text-center text-sm text-muted-foreground'>
                  {emptyText}
                </div>
              ) : (
                <>
                  {options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <button
                        key={option.value}
                        type='button'
                        disabled={option.disabled}
                        className={cn(
                          'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus:bg-accent focus:text-accent-foreground',
                          'disabled:pointer-events-none disabled:opacity-50',
                          isSelected && 'bg-accent'
                        )}
                        onClick={() => handleSelect(option.value)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <div className='flex flex-col items-start flex-1 min-w-0'>
                            <span className='truncate'>{option.label}</span>
                            {option.sublabel && (
                              <span className='text-xs text-muted-foreground truncate'>
                                {option.sublabel}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {isLoading && options.length > 0 && (
                    <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
                      <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                      {loadingText}
                    </div>
                  )}
                  {!hasMore && options.length > 0 && (
                    <div className='py-2 text-center text-xs text-muted-foreground'>
                      All items loaded
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }
);

ComboBox.displayName = 'ComboBox';
